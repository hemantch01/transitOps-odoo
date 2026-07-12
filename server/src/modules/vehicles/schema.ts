import {z  } from "zod"


//  validation for vehical

export const  createVehicleSchema = z.object({
  plateNumber: z.string().min(1),
  make: z.string(),
    model: z.string(),

  year: z.number(),
})

export const updateVehicleSchema = createVehicleSchema.partial()
