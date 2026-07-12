import { Request, Response, NextFunction } from "express";
import * as vehicleService from "./service.js";
import { createVehicleSchema, updateVehicleSchema } from "../../../../shared/schemas/vehicle.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit } = req.query
    const filters = {
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      region: req.query.region as string | undefined,
    };
    const result = await vehicleService.list(
      cursor as string,
      limit ? Number(limit) : undefined,
      filters,
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.getById((req.params.id as string));
    res.json({ data: vehicle });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createVehicleSchema.parse(req.body);
    const vehicle = await vehicleService.create(data);
    res.status(201).json({ data: vehicle });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateVehicleSchema.parse(req.body);
    const vehicle = await vehicleService.update((req.params.id as string), data);
    res.json({ data: vehicle });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await vehicleService.remove((req.params.id as string));
    res.json({ message: "vehicle deleted" });
  } catch (err) { next(err); }
}
