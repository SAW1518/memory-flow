'use server';
import { prisma } from './prisma';

export async function getWords() {
  try {
    return await prisma.generalWord.findMany();
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}
