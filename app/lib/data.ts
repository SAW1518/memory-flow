'use server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { GeneralWord } from '@prisma/client';

export async function getWords(): Promise<{ words: GeneralWord[]; dbOk: boolean }> {
  try {
    const words = await prisma.generalWord.findMany();
    return { words, dbOk: true };
  } catch (error) {
    console.error('Error fetching words:', error);
    return { words: [], dbOk: false };
  }
}

export async function getUserWordContents(): Promise<{ contents: string[]; dbOk: boolean }> {
  try {
    const { userId } = await auth();
    if (!userId) return { contents: [], dbOk: true };
    const rows = await prisma.userWord.findMany({ where: { user_id: userId } });
    return { contents: rows.map((r) => r.content), dbOk: true };
  } catch (error) {
    console.error('Error fetching user words:', error);
    return { contents: [], dbOk: false };
  }
}
