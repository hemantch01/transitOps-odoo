// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errors.js";
import { CreateVehicleInput, UpdateVehicleInput } from "../../../../shared/schemas/vehicle.js";

export async function list(cursor?: string, limit = 20, filters?: { status?: string; type?: string; region?: string }) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.region) where.region = filters.region;

  const vehicles = await prisma.vehicle.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
  });

  const hasMore = vehicles.length > limit;
  const data = hasMore ? vehicles.slice(0, -1) : vehicles;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}

export async function getById(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { trips: { take: 5, orderBy: { createdAt: "desc" } } },
  });
  if (!vehicle) throw new AppError(404, "vehicle not found");
  return vehicle;
}

export async function create(data: CreateVehicleInput) {
  // auto-detect region from registration number
  const region = data.region || data.registrationNumber.slice(0, 2);
  return prisma.vehicle.create({ data: { ...data, region } });
}

export async function update(id: string, data: UpdateVehicleInput) {
  await getById(id);
  return prisma.vehicle.update({ where: { id }, data: data as any });
}

export async function remove(id: string) {
  const vehicle = await getById(id);
  if (vehicle.status === "ON_TRIP") throw new AppError(409, "cannot delete vehicle on trip");
  return prisma.vehicle.delete({ where: { id } });
}
