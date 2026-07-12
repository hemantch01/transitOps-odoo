import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid("invalid vehicle"),
  tripId: z.string().uuid().optional(),
  liters: z.number().positive("liters must be positive"),
  cost: z.number().nonnegative("cost cannot be negative"),
  date: z.coerce.date({ message: "valid date required" }),
});

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
