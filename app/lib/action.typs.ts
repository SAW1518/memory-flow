import z from "zod";

export const wordType = z.object({
 id: z.string(),
  word: z.string(),
})

export const createWordSchema = wordType.omit({ id: true })