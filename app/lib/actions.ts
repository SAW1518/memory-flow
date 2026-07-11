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

export type SyncResult = { synced: string[]; failed: string[]; dbOk: boolean };

export async function syncOfflineWords(contents: string[]): Promise<SyncResult> {
  const synced: string[] = [];
  const failed: string[] = [];

  try {
    const { userId } = await auth();
    if (!userId) {
      return { synced: [], failed: contents, dbOk: true };
    }

    await prisma.$queryRaw`SELECT 1`;

    for (const content of contents) {
      try {
        await prisma.userWord.upsert({
          where: { user_id_content: { user_id: userId, content } },
          update: {},
          create: { user_id: userId, content },
        });
        synced.push(content);
      } catch (err) {
        console.error('Sync row failed:', content, err);
        failed.push(content);
      }
    }
    return { synced, failed, dbOk: true };
  } catch (err) {
    console.error('Sync aborted, DB unreachable:', err);
    return { synced: [], failed: contents, dbOk: false };
  }
}
