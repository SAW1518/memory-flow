import z from 'zod';

export const wordType = z.object({
  id: z.string(),
  word: z.string().trim().min(1).max(255),
});

export const createWordSchema = wordType.omit({ id: true });
