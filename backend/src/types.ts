import z, { optional } from "zod";

export const taskInput = z.object({
  options: z.array(
    z.object({
      imageUrl: z.string(),
    })
  ),
  title: z.string().optional(),
  signature : z.string()
});
