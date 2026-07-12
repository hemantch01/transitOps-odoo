import { Request, Response, NextFunction } from "express";
import * as tripService from "./service.js";
import { createTripSchema, completeTripSchema } from "../../../../shared/schemas/trip.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit, status, vehicleId, driverId } = req.query
    const result = await tripService.list(
      cursor as string,
      limit ? Number(limit) : undefined,
      { status: status as string, vehicleId: vehicleId as string, driverId: driverId as string },
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getById((req.params.id as string));
    res.json({ data: trip });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createTripSchema.parse(req.body);
    const trip = await tripService.create(data);
    res.status(201).json({ data: trip });
  } catch (err) { next(err); }
}

export async function dispatch(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.dispatch((req.params.id as string));
    res.json({ data: trip });
  } catch (err) { next(err); }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const data = completeTripSchema.parse(req.body);
    const trip = await tripService.complete((req.params.id as string), data);
    res.json({ data: trip });
  } catch (err) { next(err); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.cancel((req.params.id as string));
    res.json({ data: trip });
  } catch (err) { next(err); }
}
