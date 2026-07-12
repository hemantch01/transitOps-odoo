// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errors.js";
import { CreateMaintenanceInput } from "../../../../shared/schemas/maintenance.js";

export async function list(cursor?: string, limit = 20, filters?: { vehicleId?: string; status?: string }) {
  const where: any = {};
  if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters?.status) where.status = filters.status;

  const logs = await prisma.maintenanceLog.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: { vehicle: { select: { registrationNumber: true, name: true } } },
  });

  const hasMore = logs.length > limit;
  const data = hasMore ? logs.slice(0, -1) : logs;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}

// atomic: create log + vehicle → in_shop
export async function create(data: CreateMaintenanceInput) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUniqueOrThrow({ where: { id: data.vehicleId } });

    if (vehicle.status === "ON_TRIP") throw new AppError(409, "vehicle is on trip, cannot add to maintenance");
    if (vehicle.status === "RETIRED") throw new AppError(409, "vehicle is retired");

    const [log] = await Promise.all([
      tx.maintenanceLog.create({
        data,
        include: { vehicle: { select: { registrationNumber: true, name: true } } },
      }),
      tx.vehicle.update({ where: { id: data.vehicleId }, data: { status: "IN_SHOP" } }),
    ]);

    return log;
  });
}

// atomic: close log + vehicle → available (unless retired)
export async function close(id: string) {
  return prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.findUniqueOrThrow({
      where: { id },
      include: { vehicle: true },
    });

    if (log.status === "COMPLETED") throw new AppError(400, "maintenance already completed");

    const vehicleStatus = log.vehicle.status === "RETIRED" ? "RETIRED" : "AVAILABLE";

    const [updated] = await Promise.all([
      tx.maintenanceLog.update({
        where: { id },
        data: { status: "COMPLETED", endDate: new Date() },
        include: { vehicle: { select: { registrationNumber: true, name: true } } },
      }),
      tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: vehicleStatus } }),
    ]);

    return updated;
  });
}
