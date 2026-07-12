import { Request, Response, NextFunction } from "express";
import * as driverService from "./service.js";
import { createDriverSchema, updateDriverSchema } from "../../../../shared/schemas/driver.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit, status } = req.query
    const result = await driverService.list(
      cursor as string,
      limit ? Number(limit) : undefined,
      { status: status as string },
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await driverService.getById((req.params.id as string));
    res.json({ data: driver });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createDriverSchema.parse(req.body);
    const driver = await driverService.create(data);
    res.status(201).json({ data: driver });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateDriverSchema.parse(req.body);
    const driver = await driverService.update((req.params.id as string), data);
    res.json({ data: driver });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await driverService.remove((req.params.id as string));
    res.json({ message: "driver deleted" });
  } catch (err) { next(err); }
}
