import z from "zod";

export const taskInput = z.object({
  options: z.array(
    z.object({
      imageUrl: z.string(),
    })
  ),
  title: z.string().optional(),
  signature: z.string(),
});


export const submissionInput = z.object({
  taskId: z.string(),
  OptionId: z.string(),
});
