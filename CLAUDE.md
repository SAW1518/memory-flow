# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memory Flow — a typing practice app where users register vocabulary words and practice typing them repeatedly. Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and Clerk for authentication. Data is stored in PostgreSQL via the `postgres` package.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (ESLint with next/core-web-vitals + typescript configs)
- **Format:** `pnpm format` (Prettier with tailwindcss plugin)
- **Format check:** `pnpm format:check`

Package manager is **pnpm** (enforced via `preinstall` script — npm/yarn will fail).

## Architecture

### Routing (App Router)hi

- `/` — Home page (server component): word registration form + card grid of saved words
- `/word?practice=<word>` — Typing practice page (client component): type a word N times to complete
- `/word` has its own layout with a back-navigation header

### Key Directories

- `app/lib/` — Server-side data layer and shared types
  - `data.ts` — Database queries (`getWords`) marked `'use server'`
  - `actions.ts` — Server Actions for form submissions (e.g., `createInvoice`)
  - `types.ts` — TypeScript types (`GeneralWord`, `UserWord`)
  - `action.typs.ts` — Zod schemas for form validation
- `app/ui/` — Reusable UI components organized by concern (`card/`, `cursor/`, `navbar/`, `logo/`, `icons/`)
- `proxy.ts` — Clerk middleware configuration (despite the filename, this is the Next.js middleware)

### Database

Uses raw SQL via the `postgres` package (not an ORM). Connection requires `POSTGRES_URL` env var with SSL. Main table: `general_words` (columns: `id`, `content`).

### Auth

Clerk handles authentication. The root layout wraps everything in `ClerkProvider` with dark theme. Middleware in `proxy.ts` protects routes. Navbar shows sign-in/user buttons via Clerk components.

### Styling

Tailwind CSS 4 with `@tailwindcss/postcss`. Fonts: Inter and Outfit loaded via `next/font/google`. Dark theme throughout (neutral-800/900 backgrounds). Path alias `@/*` maps to project root.
