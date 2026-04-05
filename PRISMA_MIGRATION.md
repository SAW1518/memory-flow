# Prisma Migration Guide

This document explains every change made to migrate from raw SQL queries (using the `postgres` package) to **Prisma ORM v7** with the `@prisma/adapter-pg` driver adapter.

---

## Table of Contents

1. [Why Prisma?](#why-prisma)
2. [What Changed (File by File)](#what-changed-file-by-file)
3. [New Files](#new-files)
4. [Modified Files](#modified-files)
5. [Dead Code (Can Be Deleted)](#dead-code-can-be-deleted)
6. [Package Changes](#package-changes)
7. [Understanding the Architecture](#understanding-the-architecture)
8. [DTOs and Types: What You Need to Know](#dtos-and-types-what-you-need-to-know)
9. [Common Prisma Commands](#common-prisma-commands)
10. [What to Consider Going Forward](#what-to-consider-going-forward)

---

## Why Prisma?

**Before:** We used the `postgres` package to write raw SQL strings like:

```ts
const result = await sql<GeneralWord[]>`SELECT * FROM general_words`;
```

This works but has problems:

- No type safety: the `GeneralWord[]` type annotation is a **lie** — TypeScript trusts you, but the DB could return anything
- No autocomplete: you write SQL as a string, so your editor can't help you
- Manual type definitions: you had to manually create and maintain `types.ts` to match your DB schema
- Easy to make mistakes: typos in SQL, wrong column names, mismatched types — all silent at compile time

**After:** Prisma generates types directly from your database schema:

```ts
const result = await prisma.generalWord.findMany();
```

- Full type safety: the return type is `GeneralWord[]` and it's **guaranteed** to match the DB
- Autocomplete: your editor knows every model, field, and query method
- Single source of truth: `schema.prisma` defines the shape, types are auto-generated
- Compile-time errors: if you reference a field that doesn't exist, TypeScript catches it

---

## What Changed (File by File)

### New Files

#### `prisma/schema.prisma`

This is the **single source of truth** for your database structure. It defines:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model GeneralWord {
  id      Int    @id @default(autoincrement())
  content String @unique @db.VarChar(255)

  @@map("general_words")
}

model UserWord {
  user_id String @id @db.VarChar(255)
  content String @db.VarChar(255)

  @@map("users_words")
}
```

Key concepts:

- **`generator client`**: Tells Prisma to generate a TypeScript client you can import
- **`datasource db`**: Declares this is a PostgreSQL database. In Prisma 7, the connection URL lives in `prisma.config.ts`, NOT here
- **`model GeneralWord`**: A model = a database table. The model name (`GeneralWord`) becomes the TypeScript type AND the query namespace (`prisma.generalWord.___`)
- **`@@map("general_words")`**: The actual table name in PostgreSQL is `general_words` (snake_case), but in your code you use `GeneralWord` (PascalCase). The `@@map` bridges them
- **`@id`**: This column is the primary key
- **`@default(autoincrement())`**: The DB auto-generates this value
- **`@unique`**: No two rows can have the same `content` — this is required for the `upsert` in the seed route to work (upsert needs a unique field in `where`)
- **`@db.VarChar(255)`**: The actual PostgreSQL column type. Prisma pulled this from introspecting the real database

#### `prisma.config.ts`

Prisma 7 introduced this file to replace the old `url = env("DATABASE_URL")` that used to live inside `schema.prisma`.

```ts
import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

- **`import 'dotenv/config'`**: Loads `.env` variables so Prisma CLI commands (`prisma db pull`, `prisma migrate`, etc.) can read `DATABASE_URL`. Without this, CLI commands fail because they don't use Next.js's built-in env loading
- **`schema`**: Points to where the schema file lives
- **`datasource.url`**: The database connection string, read from your `.env` file

#### `app/lib/prisma.ts`

The Prisma client singleton. This is the file every other file imports to talk to the database.

```ts
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
```

**Why is this so complex? Why not just `new PrismaClient()`?**

1. **Prisma 7 requires a driver adapter**: Unlike older versions, Prisma 7 doesn't bundle database drivers. You provide one. We use `@prisma/adapter-pg` which wraps the `pg` package's `Pool`
2. **`Pool`**: A connection pool manages multiple database connections efficiently. Instead of opening a new connection for every query (slow), it reuses existing ones
3. **Singleton pattern (`globalForPrisma`)**: In development, Next.js hot-reloads your code frequently. Each reload would create a NEW PrismaClient (and a new connection pool), eventually exhausting your database connections. By storing it on `globalThis`, we reuse the same client across hot reloads
4. **Production guard**: In production there's no hot-reload, so we don't need the global trick — but it doesn't hurt

---

### Modified Files

#### `app/lib/data.ts`

**Before:**

```ts
'use server';
import postgres from 'postgres';
import { GeneralWord } from './types';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getWords() {
  try {
    const result = await sql<GeneralWord[]>`SELECT * FROM general_words`;
    return result;
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}
```

**After:**

```ts
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
```

What changed:

- `postgres` import replaced with our `prisma` singleton
- Raw SQL `SELECT * FROM general_words` replaced with `prisma.generalWord.findMany()`
- No need to manually type the result — Prisma knows the return type is `GeneralWord[]`
- No more `POSTGRES_URL` env var needed — Prisma uses `DATABASE_URL`
- No more `ssl: 'require'` config — that's handled by the `pg` Pool in `prisma.ts`

#### `app/page.tsx`

**Before:**

```ts
import { GeneralWord } from './lib/types';
```

**After:**

```ts
import type { GeneralWord } from '@prisma/client';
```

The type now comes from Prisma's auto-generated client instead of your manually maintained `types.ts`. The `import type` syntax tells TypeScript this is a type-only import (it gets stripped at compile time, no runtime cost).

#### `app/ui/card/card.tsx`

Same change as `page.tsx`:

```ts
// Before
import { GeneralWord } from '@/app/lib/types';

// After
import type { GeneralWord } from '@prisma/client';
```

#### `app/send/route.tsx`

Added one line:

```ts
export const dynamic = 'force-dynamic';
```

**Why?** Next.js tries to pre-render routes at build time. The seed route imports the Prisma client, which tries to connect to the database. During `pnpm build` on CI or locally, the database might not be reachable. `force-dynamic` tells Next.js: "don't try to render this at build time, only at request time."

---

### Dead Code (Can Be Deleted)

#### `app/lib/types.ts`

```ts
export type GeneralWord = {
  id: number;
  content: string;
};

export type UserWord = {
  user_id: string;
  content: string;
};
```

This file is **no longer imported anywhere**. Both types are now auto-generated by Prisma from the schema. You can safely delete this file.

---

## Package Changes

### Added

| Package | Type | Why |
|---------|------|-----|
| `prisma` | devDependency | The Prisma CLI — runs `prisma generate`, `prisma migrate`, `prisma db pull`, etc. |
| `@prisma/client` | dependency | The generated query client you import in your code |
| `@prisma/adapter-pg` | dependency | Prisma 7 driver adapter that bridges Prisma to the `pg` library |
| `pg` | dependency | The underlying PostgreSQL driver (manages actual TCP connections to your DB) |
| `@types/pg` | devDependency | TypeScript types for `pg`. Pinned to `8.11.11` to match the version `@prisma/adapter-pg` expects |
| `dotenv` | dependency | Loads `.env` file for Prisma CLI commands |

### Removed

| Package | Why |
|---------|-----|
| `postgres` | Replaced entirely by Prisma + pg |

---

## Understanding the Architecture

Here's how the pieces connect:

```
prisma/schema.prisma          <-- You define your models here
        |
        v
pnpm prisma generate          <-- Reads schema, generates TypeScript types + query engine
        |
        v
@prisma/client                <-- Auto-generated. Exports PrismaClient class + all types
        |
        v
app/lib/prisma.ts             <-- Creates ONE PrismaClient instance (singleton)
   |         |
   |         v
   |    @prisma/adapter-pg    <-- Translates Prisma queries into pg-compatible calls
   |         |
   |         v
   |       pg (Pool)          <-- Manages actual PostgreSQL connections
   |         |
   |         v
   |    PostgreSQL (Neon)     <-- Your actual database
   |
   v
app/lib/data.ts               <-- Imports prisma, exports query functions
app/send/route.tsx             <-- Imports prisma, seeds the DB
        |
        v
app/page.tsx                   <-- Calls getWords(), renders cards
app/ui/card/card.tsx           <-- Receives GeneralWord as props
```

---

## DTOs and Types: What You Need to Know

### What is a DTO?

**DTO = Data Transfer Object.** It's a plain object that carries data between layers of your application. The idea is simple: the shape of data in your database might not be the shape you want in your UI.

### Prisma's Generated Types ARE Your Base DTOs

When you run `pnpm prisma generate`, Prisma creates types like:

```ts
// Auto-generated (you never edit this)
type GeneralWord = {
  id: number;
  content: string;
};
```

This type matches your database row exactly. You can import it anywhere:

```ts
import type { GeneralWord } from '@prisma/client';
```

### When You DON'T Need a Custom DTO

Right now, your `Card` component receives the full `GeneralWord`:

```tsx
export const Card = ({ content, id }: GeneralWord) => { ... };
```

This is fine because:
- The component uses both `id` (as React key) and `content` (displayed text)
- The shape from the DB matches what the UI needs
- There's no sensitive data being leaked

### When You WILL Need Custom DTOs

As your app grows, you'll hit these situations:

**1. You add sensitive fields to a model:**

```prisma
model UserWord {
  user_id    String @id
  content    String
  created_at DateTime  // <-- new
  ip_address String    // <-- new, sensitive!
}
```

You don't want to pass `ip_address` to client components. Create a DTO:

```ts
// app/lib/dtos.ts
import type { UserWord } from '@prisma/client';

// Pick only the fields the UI needs
export type UserWordDTO = Pick<UserWord, 'user_id' | 'content' | 'created_at'>;
```

Then in your data layer:

```ts
export async function getUserWords(userId: string): Promise<UserWordDTO[]> {
  return await prisma.userWord.findMany({
    where: { user_id: userId },
    select: { user_id: true, content: true, created_at: true },
    // ^ Prisma's `select` ensures ip_address never leaves the server
  });
}
```

**2. You need computed or combined fields:**

```ts
export type WordWithStats = {
  id: number;
  content: string;
  practiceCount: number;   // computed from another table
  lastPracticedAt: Date;   // joined from another table
};
```

**3. You want to decouple your UI from your DB:**

If you rename a column in the DB (`content` -> `word_text`), with DTOs you only update the mapping in one place. Without DTOs, you'd update every component.

### The Rule of Thumb

- **Server Components / Server Actions**: Use Prisma types directly. They're on the server, nothing leaks.
- **Client Components**: If the Prisma type has fields the client shouldn't see, create a DTO. If not, use the Prisma type directly (like you do now with `Card`).
- **API routes returning JSON**: Always think about what you're exposing. Use `select` in Prisma queries or map to DTOs.

---

## Common Prisma Commands

```bash
# Generate the client after changing schema.prisma
pnpm prisma generate

# Pull the current DB structure into schema.prisma (introspection)
pnpm prisma db pull

# Create a migration from schema changes and apply it
pnpm prisma migrate dev --name describe_your_change

# Apply pending migrations in production
pnpm prisma migrate deploy

# Open Prisma Studio (visual DB browser)
pnpm prisma studio

# Reset the database (DESTRUCTIVE — drops all data)
pnpm prisma migrate reset

# Validate your schema file
pnpm prisma validate

# Format your schema file
pnpm prisma format
```

### Workflow When Changing the Database

1. Edit `prisma/schema.prisma` (add/remove/modify models or fields)
2. Run `pnpm prisma migrate dev --name what_you_changed`
3. Prisma creates a SQL migration file in `prisma/migrations/`
4. Prisma applies it to your database
5. Prisma regenerates the client (types update automatically)
6. Your code now has updated types — TypeScript errors will guide you to fix any breaking changes

---

## What to Consider Going Forward

### 1. Migrations

Right now you have NO migration history — we used `db pull` to introspect the existing database. Going forward:

- **Always use `prisma migrate dev`** to change the database schema
- Never manually ALTER tables in SQL — Prisma won't know about it and your schema will drift
- Migration files in `prisma/migrations/` should be committed to git

### 2. The `@unique` Constraint on `content`

We added `@unique` to `GeneralWord.content` because the seed route uses `upsert({ where: { content } })`. Consider whether this is correct for your app — can two different users have the same word? If yes, you may need a compound unique constraint or a different upsert strategy.

### 3. Environment Variables

- The app now uses `DATABASE_URL` (Prisma's default) instead of `POSTGRES_URL`
- Make sure your deployment platform (Vercel, etc.) has `DATABASE_URL` set
- Neon provides this by default, so you should be fine

### 4. Connection Pooling

The `pg` Pool defaults to 10 connections. On serverless platforms (Vercel), this can be too many. Consider:

```ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // limit connections for serverless
});
```

### 5. `app/lib/types.ts` Cleanup

This file is dead code now. Delete it when you're ready. Both `GeneralWord` and `UserWord` types come from `@prisma/client`.

### 6. `actions.ts` Still Doesn't Write to DB

The `createInvoice` server action currently only `console.log`s. When you're ready to actually save words, it will look like:

```ts
'use server';
import { prisma } from './prisma';
import { createWordSchema } from './action.typs';
import { revalidatePath } from 'next/cache';

export const createInvoice = async (formData: FormData): Promise<void> => {
  const { word } = createWordSchema.parse({
    word: formData.get('word'),
  });

  await prisma.generalWord.create({
    data: { content: word },
  });

  revalidatePath('/'); // refresh the word list
};
```

### 7. `@types/pg` Version Pinning

`@types/pg` is pinned to `8.11.11` because `@prisma/adapter-pg` bundles an older version internally. If you upgrade Prisma in the future, check if you can also upgrade `@types/pg`.
