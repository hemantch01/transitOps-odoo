// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { CreateFuelLogInput } from "../../../../shared/schemas/fuel.js";
import { CreateExpenseInput } from "../../../../shared/schemas/expense.js";

export async function listFuelLogs(cursor?: string, limit = 20, vehicleId?: string) {
  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId;

  const logs = await prisma.fuelLog.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { date: "desc" },
    include: { vehicle: { select: { registrationNumber: true, name: true } } },
  });

  const hasMore = logs.length > limit;
  const data = hasMore ? logs.slice(0, -1) : logs;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}

export async function createFuelLog(data: CreateFuelLogInput) {
  return prisma.fuelLog.create({
    data,
    include: { vehicle: { select: { registrationNumber: true, name: true } } },
  });
}

export async function listExpenses(cursor?: string, limit = 20, filters?: { vehicleId?: string; type?: string }) {
  const where: any = {};
  if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters?.type) where.type = filters.type;

  const expenses = await prisma.expense.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { date: "desc" },
    include: { vehicle: { select: { registrationNumber: true, name: true } } },
  });

  const hasMore = expenses.length > limit;
  const data = hasMore ? expenses.slice(0, -1) : expenses;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}

export async function createExpense(data: CreateExpenseInput) {
  return prisma.expense.create({
    data,
    include: { vehicle: { select: { registrationNumber: true, name: true } } },
  });
}
