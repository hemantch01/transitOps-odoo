import { z } from "zod";

export const EXPENSE_TYPES = ["FUEL", "MAINTENANCE", "TOLL", "INSURANCE", "OTHER"] as const;

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid("invalid vehicle"),
  tripId: z.string().uuid().optional(),
  type: z.enum(EXPENSE_TYPES, { message: "invalid expense type" }),
  description: z.string().optional(),
  amount: z.number().positive("amount must be positive"),
  date: z.coerce.date({ message: "valid date required" }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
