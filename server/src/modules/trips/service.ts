// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errors.js";
import { CreateTripInput, CompleteTripInput } from "../../../../shared/schemas/trip.js";

export async function list(cursor?: string, limit = 20, filters?: { status?: string; vehicleId?: string; driverId?: string }) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters?.driverId) where.driverId = filters.driverId;

  const trips = await prisma.trip.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: { select: { registrationNumber: true, name: true, status: true, maxLoadCapacity: true } },
      driver: { select: { name: true, status: true, licenseExpiry: true } },
    },
  });

  const hasMore = trips.length > limit;
  const data = hasMore ? trips.slice(0, -1) : trips;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}

export async function getById(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
  if (!trip) throw new AppError(404, "trip not found");
  return trip;
}

export async function create(data: CreateTripInput) {
  // validate vehicle
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new AppError(404, "vehicle not found");
  if (vehicle.status !== "AVAILABLE") throw new AppError(409, "vehicle not available", "vehicleId");
  if (data.cargoWeight > vehicle.maxLoadCapacity) {
    throw new AppError(422, `cargo ${data.cargoWeight}kg exceeds vehicle capacity ${vehicle.maxLoadCapacity}kg`, "cargoWeight");
  }

  // validate driver
  const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
  if (!driver) throw new AppError(404, "driver not found");
  if (driver.status !== "AVAILABLE") throw new AppError(409, "driver not available", "driverId");
  if (driver.licenseExpiry < new Date()) throw new AppError(422, "driver license expired", "driverId");

  return prisma.trip.create({
    data: {
      ...data,
      startOdometer: vehicle.currentOdometer,
    },
    include: { vehicle: true, driver: true },
  });
}

// atomic: trip → dispatched, vehicle + driver → on_trip
export async function dispatch(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (trip.status !== "DRAFT") throw new AppError(400, "only draft trips can be dispatched");
    if (trip.vehicle.status !== "AVAILABLE") throw new AppError(409, "vehicle not available");
    if (trip.driver.status !== "AVAILABLE") throw new AppError(409, "driver not available");
    if (trip.driver.licenseExpiry < new Date()) throw new AppError(422, "driver license expired");
    if (trip.cargoWeight > trip.vehicle.maxLoadCapacity) throw new AppError(422, "cargo exceeds capacity");

    const [updated] = await Promise.all([
      tx.trip.update({
        where: { id: tripId },
        data: { status: "DISPATCHED", dispatchedAt: new Date() },
        include: { vehicle: true, driver: true },
      }),
      tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "ON_TRIP" } }),
      tx.driver.update({ where: { id: trip.driverId }, data: { status: "ON_TRIP" } }),
    ]);

    return updated;
  });
}

// atomic: trip → completed, vehicle + driver → available, update odometer
export async function complete(tripId: string, data: CompleteTripInput) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId } });

    if (trip.status !== "DISPATCHED") throw new AppError(400, "only dispatched trips can be completed");

    // revenue: manual override > computed from ratePerKm
    let revenue = data.revenue;
    if (!revenue && trip.ratePerKm) {
      revenue = trip.ratePerKm * data.actualDistance;
    }

    const [updated] = await Promise.all([
      tx.trip.update({
        where: { id: tripId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          endOdometer: data.endOdometer,
          fuelConsumed: data.fuelConsumed,
          actualDistance: data.actualDistance,
          revenue,
        },
        include: { vehicle: true, driver: true },
      }),
      tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE", currentOdometer: data.endOdometer },
      }),
      tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } }),
    ]);

    return updated;
  });
}

// atomic: trip → cancelled, vehicle + driver → available
export async function cancel(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId } });

    if (trip.status !== "DISPATCHED" && trip.status !== "DRAFT") {
      throw new AppError(400, "only draft or dispatched trips can be cancelled");
    }

    // only restore statuses if trip was dispatched
    if (trip.status === "DISPATCHED") {
      await Promise.all([
        tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } }),
        tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } }),
      ]);
    }

    return tx.trip.update({
      where: { id: tripId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: { vehicle: true, driver: true },
    });
  });
}
