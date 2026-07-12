import { z} from "zod"


// driver stuff

export const createDriverSchema = z.object({
  name: z.string(),
    licenseNumber: z.string(),

  phone: z.string().optional(),
})


export const updateDriverSchema = createDriverSchema.partial()
