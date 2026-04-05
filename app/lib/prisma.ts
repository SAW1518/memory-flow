
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/*
 * LINE-BY-LINE EXPLANATION
 *
 * import { Pool } from 'pg';
 *   - Imports Pool from the pg library. A Pool is a collection of reusable database
 *     connections. Instead of opening a new TCP connection to PostgreSQL for every
 *     query (expensive: DNS lookup, TCP handshake, SSL negotiation), the Pool keeps
 *     a set of open connections ready to use. When a query finishes, the connection
 *     goes back to the pool instead of being destroyed.
 *
 * import { PrismaPg } from '@prisma/adapter-pg';
 *   - Imports Prisma's driver adapter for pg. In Prisma 7, Prisma no longer bundles
 *     its own database driver. You bring your own (the "driver adapter" pattern).
 *     PrismaPg is the glue layer — it takes a pg Pool and translates Prisma's
 *     internal query format into calls that pg understands.
 *
 * import { PrismaClient } from '@prisma/client';
 *   - Imports the auto-generated PrismaClient. Created when you run
 *     `pnpm prisma generate`. It reads schema.prisma and generates a client with
 *     methods like prisma.generalWord.findMany(), prisma.userWord.create(), etc.
 *     Every model in your schema becomes a property on this client.
 *
 * const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
 *   - Singleton trick for Next.js development mode.
 *   - globalThis is a built-in JS object that exists across the entire Node.js process.
 *   - We cast it to { prisma: PrismaClient } so TypeScript lets us store/read a
 *     prisma property on it. The `as unknown as` is needed because TypeScript
 *     doesn't know globalThis has a prisma field — we're telling it "trust me".
 *   - WHY: In dev, Next.js hot module replacement (HMR) re-executes modules on
 *     every save. Without this, each re-execution creates a new PrismaClient +
 *     connection pool, eventually exhausting the DB connection limit (~100 on Neon
 *     free tier). Storing on globalThis lets it survive hot reloads.
 *
 * function createPrismaClient() {
 *   - Factory function that builds a fully configured PrismaClient. Wrapped in a
 *     function so it only runs when needed (lazy initialization).
 *
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *     - Creates a pg connection pool pointing at the Neon database. connectionString
 *       is the full PostgreSQL URL from .env. Default max connections: 10. On
 *       serverless (Vercel), you may want to lower this with max: 5.
 *
 *   const adapter = new PrismaPg(pool);
 *     - Wraps the pg Pool in Prisma's adapter. The adapter handles:
 *       1. Translating Prisma's internal query representation into SQL
 *       2. Passing that SQL to the pg Pool
 *       3. Converting raw pg result rows back into typed JS objects
 *
 *   return new PrismaClient({ adapter });
 *     - Creates the PrismaClient using the adapter. After this, queries flow:
 *       PrismaClient -> PrismaPg adapter -> pg Pool -> PostgreSQL
 *
 * export const prisma = globalForPrisma.prisma || createPrismaClient();
 *   - Core singleton logic. Reads left to right:
 *     1. globalForPrisma.prisma — does a PrismaClient already exist on globalThis?
 *     2. If YES (truthy) — reuse it. No new connections.
 *     3. If NO (undefined) — call createPrismaClient() to make one.
 *   - The || operator short-circuits: if left side is truthy, right side never runs.
 *
 * if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
 *   - In DEVELOPMENT only, store the client on globalThis so the next hot reload
 *     reuses it (the line above will find it).
 *   - In PRODUCTION, we skip this. No hot reload in prod — the module loads once
 *     and stays. Storing globally is unnecessary and could cause issues in edge
 *     cases (e.g., serverless cold starts where you want a fresh client).
 *
 * FULL FLOW:
 *
 *   First load (dev or prod):
 *     globalForPrisma.prisma = undefined
 *     -> createPrismaClient() runs
 *     -> new Pool (opens connections to Neon)
 *     -> new PrismaPg (wraps pool)
 *     -> new PrismaClient (ready to query)
 *     -> stored on globalThis (dev only)
 *
 *   Second load (dev hot reload):
 *     globalForPrisma.prisma = existing client
 *     -> reused, no new connections
 *     -> createPrismaClient() never runs
 */
