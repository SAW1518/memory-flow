import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const GENERAL_WORDS = [
  'separate',
  'occurred',
  'receive',
  'necessary',
  'definitely',
  'environment',
  'algorithm',
  'asynchronous',
  'hierarchy',
  'initialize',
  'maintenance',
  'occurrence',
  'parallel',
  'privilege',
  'length',
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
