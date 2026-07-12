import { z } from "zod"


//  validation for regions


export const regionSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),

  description: z.string().optional(),
})


export const updateRegionSchema = regionSchema.partial()