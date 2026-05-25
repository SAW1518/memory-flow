'use server';
// import { auth } from '@clerk/nextjs/server';
import { createWordSchema } from './action.typs';
// import { prisma } from './prisma';

export const createInvoice = async (formData: FormData): Promise<void> => {
  const newWord = createWordSchema.parse({
    word: formData.get('word'),
  });

  console.log(newWord);
};

export type SyncResult = { synced: string[]; failed: string[]; dbOk: boolean };

// User-words sync disabled until Clerk publishableKey is configured.
// Re-enable once CLERK_PUBLISHABLE_KEY is set in the deploy env.
export async function syncOfflineWords(contents: string[]): Promise<SyncResult> {
  return { synced: [], failed: contents, dbOk: true };
  /*
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
          where: { user_id: userId },
          update: { content },
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
  */
}
