import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid("invalid vehicle"),
  type: z.string().min(1, "maintenance type required"),
  description: z.string().optional(),
  cost: z.number().nonnegative("cost cannot be negative"),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
