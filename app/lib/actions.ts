'use server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createWordSchema } from './action.typs';
import { prisma } from './prisma';

export const createInvoice = async (formData: FormData): Promise<void> => {
  const newWord = createWordSchema.parse({
    word: formData.get('word'),
  });

  console.log(newWord);
};

export type RegisterWordResult =
  | 'saved'
  | 'exists'
  | 'unauthenticated'
  | 'error';

// Saves a word for the signed-in user (words are keyed per user via [user_id, content])
export async function registerWord(content: string): Promise<RegisterWordResult> {
  const parsed = createWordSchema.safeParse({ word: content });
  if (!parsed.success) return 'error';

  const { userId } = await auth();
  if (!userId) return 'unauthenticated';

  try {
    await prisma.userWord.create({
      data: { user_id: userId, content: parsed.data.word },
    });
    revalidatePath('/');
    return 'saved';
  } catch (err) {
    // P2002 = unique constraint violation — word already registered by this user
    if ((err as { code?: string })?.code === 'P2002') return 'exists';
    console.error('registerWord failed:', err);
    return 'error';
  }
}

// Deletes the signed-in user's registered copy of a word.
// General words are curated by the app owner and are never user-deletable.
export async function deleteUserWord(content: string): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    await prisma.userWord.deleteMany({ where: { user_id: userId, content } });
    revalidatePath('/');
    return true;
  } catch (err) {
    console.error('deleteUserWord failed:', err);
    return false;
  }
}

