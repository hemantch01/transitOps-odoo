import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "./service.js";
import { createMaintenanceSchema } from "../../../../shared/schemas/maintenance.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit, vehicleId, status } = req.query
    const result = await maintenanceService.list(
      cursor as string,
      limit ? Number(limit) : undefined,
      { vehicleId: vehicleId as string, status: status as string },
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createMaintenanceSchema.parse(req.body);
    const log = await maintenanceService.create(data);
    res.status(201).json({ data: log });
  } catch (err) { next(err); }
}

export async function close(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await maintenanceService.close((req.params.id as string));
    res.json({ data: log });
  } catch (err) { next(err); }
}
