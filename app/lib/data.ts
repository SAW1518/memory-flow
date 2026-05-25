'use server';
// import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { GeneralWord } from '@prisma/client';

function isNextDynamicError(err: unknown): boolean {
  const digest = (err as { digest?: string })?.digest;
  return typeof digest === 'string' && digest.startsWith('DYNAMIC_SERVER_USAGE');
}

export async function getWords(): Promise<{ words: GeneralWord[]; dbOk: boolean }> {
  try {
    const words = await prisma.generalWord.findMany();
    return { words, dbOk: true };
  } catch (error) {
    if (isNextDynamicError(error)) throw error;
    console.error('Error fetching words:', error);
    return { words: [], dbOk: false };
  }
}

// User-words path disabled until Clerk publishableKey is configured.
// Re-enable once CLERK_PUBLISHABLE_KEY is set in the deploy env.
export async function getUserWordContents(): Promise<{ contents: string[]; dbOk: boolean }> {
  return { contents: [], dbOk: true };
  /*
  try {
    const { userId } = await auth();
    if (!userId) return { contents: [], dbOk: true };
    const rows = await prisma.userWord.findMany({ where: { user_id: userId } });
    return { contents: rows.map((r) => r.content), dbOk: true };
  } catch (error) {
    if (isNextDynamicError(error)) throw error;
    console.error('Error fetching user words:', error);
    return { contents: [], dbOk: false };
  }
  */
}
