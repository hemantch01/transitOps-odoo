import { Request, Response, NextFunction } from "express";
import * as fuelService from "./service.js";
import { createFuelLogSchema } from "../../../../shared/schemas/fuel.js";
import { createExpenseSchema } from "../../../../shared/schemas/expense.js";

export async function listFuelLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit, vehicleId } = req.query
    const result = await fuelService.listFuelLogs(cursor as string, limit ? Number(limit) : undefined, vehicleId as string);
    res.json(result);
  } catch (err) { next(err); }
}

export async function createFuelLog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createFuelLogSchema.parse(req.body);
    const log = await fuelService.createFuelLog(data);
    res.status(201).json({ data: log });
  } catch (err) { next(err); }
}

export async function listExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit, vehicleId, type } = req.query
    const result = await fuelService.listExpenses(
      cursor as string,
      limit ? Number(limit) : undefined,
      { vehicleId: vehicleId as string, type: type as string },
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createExpenseSchema.parse(req.body);
    const expense = await fuelService.createExpense(data);
    res.status(201).json({ data: expense });
  } catch (err) { next(err); }
}
