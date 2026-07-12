import { z } from "zod";

export const DRIVER_STATUSES = ["AVAILABLE" , "ON_TRIP", "OFF_DUTY", "SUSPENDED"] as const;
export const LICENSE_CATEGORIES = ["LMV" , "HMV", "HGMV" , "HTV", "LTV"] as const;

export const createDriverSchema = z.object(
  {
  name: z.string().min(1, "driver name required").max(100),
  licenseNumber: z
    .string()
    .min(1, "license number required" )
    .max(20, "license number too long" ),
  licenseCategory:  z.enum(LICENSE_CATEGORIES, { message: "invalid license category"}),
  licenseExpiry: z.coerce.date({message: "valid expiry date required"}),
  contactNumber: z
    .string()
    .min(10,"contact number must be 10 digits")
    .max(13)
    .regex(/^[\d+\-\s]+$/,"invalid contact number"),
  safetyScore: z.number().min(0).max(100).optional(),
});

export const updateDriverSchema = createDriverSchema.partial().extend(
  {
  status: z.enum(DRIVER_STATUSES).optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
