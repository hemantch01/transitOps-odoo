// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errors.js";
import { CreateDriverInput, UpdateDriverInput } from "../../../../shared/schemas/driver.js";

export async function list(cursor?: string, limit = 20, filters?: { status?: string }) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;

  const drivers = await prisma.driver.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
  });

  const hasMore = drivers.length > limit;
  const data = hasMore ? drivers.slice(0, -1) : drivers;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}

export async function getById(id: string) {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: { trips: { take: 5, orderBy: { createdAt: "desc" } } },
  });
  if (!driver) throw new AppError(404, "driver not found");
  return driver;
}

export async function create(data: CreateDriverInput) {
  return prisma.driver.create({ data: data as any });
}

export async function update(id: string, data: UpdateDriverInput) {
  await getById(id);
  return prisma.driver.update({ where: { id }, data: data as any });
}

export async function remove(id: string) {
  const driver = await getById(id);
  if (driver.status === "ON_TRIP") throw new AppError(409, "cannot delete driver on trip");
  return prisma.driver.delete({ where: { id } });
}
