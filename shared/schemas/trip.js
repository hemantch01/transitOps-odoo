import { z } from "zod";
export const TRIP_STATUSES = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];
export const createTripSchema = z.object({
    source: z.string().min(1, "source location required"),
    destination: z.string().min(1, "destination required"),
    cargoWeight: z.number().positive("cargo weight must be positive"),
    plannedDistance: z.number().positive("distance must be positive"),
    ratePerKm: z.number().positive("rate must be positive").optional(),
    revenue: z.number().nonnegative().optional(),
    vehicleId: z.string().uuid("invalid vehicle"),
    driverId: z.string().uuid("invalid driver"),
});
export const completeTripSchema = z.object({
    endOdometer: z.number().positive("odometer reading required"),
    fuelConsumed: z.number().positive("fuel consumed required"),
    actualDistance: z.number().positive("actual distance required"),
    revenue: z.number().nonnegative().optional(), // manual override
});
