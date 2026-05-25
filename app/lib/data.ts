'use server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getWords() {
  try {
    return await prisma.generalWord.findMany();
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}

export async function getUserWordContents(): Promise<string[]> {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    const rows = await prisma.userWord.findMany({ where: { user_id: userId } });
    return rows.map((r) => r.content);
  } catch (error) {
    console.error('Error fetching user words:', error);
    return [];
  }
}
