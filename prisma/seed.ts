import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const GENERAL_WORDS = [
  'abandon', 'ability', 'absence', 'abstract', 'academic', 'accept', 'access', 'accident',
  'account', 'accurate', 'achieve', 'acquire', 'action', 'active', 'actually', 'adapt',
  'address', 'adjust', 'advance', 'advantage', 'adventure', 'advice', 'affect', 'against',
  'agency', 'agenda', 'ahead', 'ambient', 'analyze', 'ancient', 'anxiety', 'appear',
  'approach', 'arrange', 'article', 'aspect', 'assemble', 'assume', 'attempt', 'attract',
  'balance', 'barrier', 'beautiful', 'become', 'behavior', 'believe', 'benefit', 'beyond',
  'brilliant', 'budget', 'calendar', 'capable', 'capture', 'careful', 'category', 'central',
  'certain', 'challenge', 'chapter', 'character', 'circuit', 'climate', 'collect', 'comfort',
  'commerce', 'compare', 'complete', 'concept', 'conflict', 'connect', 'consider', 'contain',
  'context', 'control', 'convince', 'courage', 'create', 'crystal', 'culture', 'current',
  'danger', 'decide', 'declare', 'decline', 'default', 'defend', 'define', 'degree',
  'deliver', 'demand', 'describe', 'design', 'destroy', 'develop', 'device', 'differ',
  'dignity', 'dilemma', 'direct', 'discover',
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const result = await prisma.generalWord.createMany({
      data: GENERAL_WORDS.map((content) => ({ content })),
      skipDuplicates: true,
    });
    const total = await prisma.generalWord.count();
    console.log(`Inserted ${result.count} new GeneralWord rows (skipped duplicates). Total in table: ${total}.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
