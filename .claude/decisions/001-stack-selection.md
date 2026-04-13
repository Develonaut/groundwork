# Stack Selection

**Date:** April 13, 2026
**Status:** Accepted
**Context:** Initial technology choices for Groundwork monorepo

---

## Decision

Build Groundwork as a **pnpm + Turborepo monorepo** with the following stack:

| Layer            | Choice                                          |
| ---------------- | ----------------------------------------------- |
| Frontend & Build | Next.js 16, React 19, Turborepo, Tailwind CSS 4 |
| UI Components    | shadcn/ui (copy-paste, Swiss Design styling)    |
| Database         | Turso (LibSQL) + Drizzle ORM                    |
| Auth             | NextAuth.js (self-hosted)                       |
| Server State     | React Query                                     |
| Deployment       | Vercel (free tier)                              |

---

## Rationale

### Why Monorepo (same pattern as bnto)

- **Clean boundaries** — `@groundwork/core` abstracts the data layer
- **Package extraction** — Start small, extract patterns as they emerge
- **Bento Box Principle** — Small, focused packages that compose

### Why Turso + Drizzle (vs Convex)

- **Free tier:** 500 DBs, 9GB storage, 1B row reads/month
- **SQLite semantics:** Familiar, portable, exportable — user owns their data
- **No lock-in:** It's just SQL. Can swap to Postgres or local SQLite later
- Convex is great for real-time, but overkill for a personal journal

### Why NextAuth.js (vs Clerk)

- **Completely free:** No user limits, no pricing tiers, no MAU ceiling
- **Self-hosted:** We control the auth flow
- **Vercel-native:** Built by Vercel team, first-class Next.js support
- Clerk has great DX but adds a vendor dependency and cost at scale

### Why shadcn/ui (vs component libraries)

- **Copy-paste approach:** Not a dependency — components live in our codebase
- **Radix UI primitives:** Accessible, composable, unstyled
- **Full control:** We apply Swiss Design styling without fighting a library's opinions

---

## Cost Breakdown

| Service   | Free Tier             | Our Usage           | Cost   |
| --------- | --------------------- | ------------------- | ------ |
| Turso     | 9GB storage, 1B reads | < 100MB, < 1M reads | **$0** |
| Vercel    | 100GB bandwidth       | < 10GB              | **$0** |
| NextAuth  | Self-hosted           | Unlimited           | **$0** |
| shadcn/ui | Copy-paste            | N/A                 | **$0** |
| **Total** |                       |                     | **$0** |

---

## Revision History

- **2026-04-13:** Initial stack selection
- **2026-04-13:** Updated UI library from neobrutalism-components to shadcn/ui
- **2026-04-13:** Confirmed NextAuth.js as auth provider
