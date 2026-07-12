import { z } from "zod";

export const VEHICLE_TYPES = ["TRUCK", "VAN", "BUS", "CAR", "BIKE"] as const;
export const VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"] as const;

export const RTO_REGIONS = [
  { code: "DL", name: "Delhi" },
  { code: "RJ", name: "Rajasthan" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "GJ", name: "Gujarat" },
  { code: "KA", name: "Karnataka" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "HR", name: "Haryana" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "PB", name: "Punjab" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "TS", name: "Telangana" },
  { code: "WB", name: "West Bengal" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
] as const;

export const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, "registration number required")
    .max(15, "registration number too long")
    .regex(/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/, "invalid RTO format (e.g. RJ14TC1234)"),
  name: z.string().min(1, "vehicle name required").max(100),
  type: z.enum(VEHICLE_TYPES, { message: "invalid vehicle type" }),
  maxLoadCapacity: z.number().positive("capacity must be positive"),
  currentOdometer: z.number().nonnegative().optional(),
  acquisitionCost: z.number().nonnegative("cost cannot be negative"),
  region: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.enum(VEHICLE_STATUSES).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
