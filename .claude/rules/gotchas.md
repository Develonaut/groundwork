# Known Gotchas & Sharp Edges

**Last Updated:** April 13, 2026

This document catalogs known issues, quirks, and "gotchas" in the Groundwork stack that can trip up developers. Read this before debugging mysterious issues.

---

## 1. Tailwind v4 + Monorepo

**Problem:** Tailwind CSS v4 with `@import` in monorepo packages can cause build issues.

**Symptom:**

```
Error: Cannot find module '@groundwork/ui/styles.css'
```

**Cause:** Tailwind v4 uses `@import` for CSS imports, which Next.js may not resolve correctly across workspace packages.

**Solution:**

**Option A: Copy CSS to apps/web (MVP approach)**

```tsx
// apps/web/app/layout.tsx
import "@groundwork/ui/styles.css"; // If this fails, copy CSS into apps/web
```

**Option B: Configure Next.js CSS resolution**

```js
// apps/web/next.config.js
module.exports = {
  transpilePackages: ["@groundwork/ui"],
  experimental: {
    cssChunking: "loose", // May help with CSS imports
  },
};
```

**Workaround (temporary):**

- Copy `@groundwork/ui/styles.css` into `apps/web/app/globals.css`
- Import directly: `import './globals.css'`

**Status:** Monitor Tailwind v4 + Next.js compatibility. May improve in future releases.

---

## 2. pnpm 10 + Native Dependencies

**Problem:** pnpm 10 changed how it handles native dependencies (Node.js addons).

**Symptom:**

```
Error: Cannot find module 'better-sqlite3'
Error: Cannot find module '@libsql/client'
```

**Cause:** pnpm 10's stricter dependency hoisting can break native modules.

**Solution:**

**Add to `.npmrc`:**

```ini
# .npmrc
node-linker=hoisted
public-hoist-pattern[]=*sqlite*
public-hoist-pattern[]=*libsql*
```

**Or downgrade to pnpm 9:**

```bash
pnpm -v  # Check version
npm install -g pnpm@9  # If pnpm 10 causes issues
```

**Status:** Turso's LibSQL client should work with pnpm 10, but watch for issues.

---

## 3. Turbopack + Node.js Subpath Imports on Vercel

**Problem:** Turbopack (Next.js dev server) may not resolve Node.js subpath imports correctly on Vercel.

**Symptom:**

```
Error: Cannot find module '@groundwork/core/hooks'
```

**Cause:** Turbopack's module resolution differs from Webpack. Subpath imports (e.g., `@groundwork/core/hooks`) may not work in dev.

**Solution:**

**Option A: Use full path imports**

```tsx
// Instead of:
import { useSessions } from "@groundwork/core/hooks";

// Use:
import { useSessions } from "@groundwork/core/src/hooks/use-sessions";
```

**Option B: Configure package.json exports**

```json
// packages/core/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./services": "./src/services/index.ts"
  }
}
```

**Option C: Disable Turbopack (temporary)**

```bash
# Use Webpack instead
pnpm dev --no-turbopack
```

**Status:** Turbopack is experimental. Use full paths if subpath imports break.

---

## 4. Git Case-Sensitivity on macOS

**Problem:** macOS filesystem is case-insensitive by default, but Git is case-sensitive.

**Symptom:**

- Rename `SessionCard.tsx` → `sessionCard.tsx` locally
- Git doesn't detect the change
- CI/CD fails on Linux (case-sensitive filesystem)

**Example:**

```bash
# macOS (case-insensitive)
ls -l
# session-card.tsx  (lowercase)

# Git thinks it's still SessionCard.tsx (uppercase)
git status
# No changes detected

# Deploy to Vercel (Linux, case-sensitive)
# Error: Cannot find module 'session-card.tsx'
```

**Solution:**

**Force Git to recognize case changes:**

```bash
git mv SessionCard.tsx session-card-temp.tsx
git commit -m "Rename step 1"
git mv session-card-temp.tsx session-card.tsx
git commit -m "Rename step 2"
```

**Or use `git mv` directly:**

```bash
git mv -f SessionCard.tsx session-card.tsx
git commit -m "Fix case sensitivity"
```

**Prevention:**

- Use consistent naming (kebab-case for files, PascalCase for components)
- Test builds locally before pushing

---

## 5. No Object.assign for Compound Components

**Problem:** Using `Object.assign` for compound components (e.g., `Card.Header`) breaks TypeScript and React.

**Bad Pattern (from bnto @bnto/ui - DO NOT COPY):**

```tsx
// WRONG - causes TypeScript issues in Groundwork
const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
});
```

**Good Pattern (use named exports):**

```tsx
// @groundwork/ui/card.tsx
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="card-content">{children}</div>;
}

// Usage
import { Card, CardHeader, CardContent } from "@groundwork/ui/card";

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Body</CardContent>
</Card>;
```

**Why:** Named exports are clearer, TypeScript-friendly, and work better with tree-shaking.

---

## 6. Stale Symlinks After Moving Packages

**Problem:** pnpm uses symlinks for workspace packages. Moving/renaming packages leaves stale symlinks.

**Symptom:**

```
Error: ENOENT: no such file or directory, open '/path/to/old-package'
```

**Cause:** pnpm's `node_modules` still points to the old package location.

**Solution:**

**Reinstall dependencies:**

```bash
# Remove all node_modules and reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

**Or just reinstall affected package:**

```bash
pnpm install @groundwork/core --force
```

**Prevention:**

- Use `pnpm -r exec rm -rf node_modules && pnpm install` after moving packages
- Commit `pnpm-lock.yaml` to track dependencies

---

## 7. Turso Connection Pooling (LibSQL Client Singleton)

**Problem:** Creating multiple LibSQL clients causes connection pool exhaustion.

**Symptom:**

```
Error: Too many open connections
Error: Connection timeout
```

**Cause:** Each `createClient()` call creates a new connection pool. In Next.js, this can happen on every request.

**Bad Pattern:**

```tsx
// WRONG - creates new client on every import
// apps/web/lib/db.ts
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
```

**Good Pattern (Singleton):**

```tsx
// @groundwork/db/client.ts
import { createClient } from "@libsql/client";

let client: ReturnType<typeof createClient> | null = null;

export function getDbClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return client;
}

// Usage
import { getDbClient } from "@groundwork/db/client";
const db = getDbClient();
```

**Or use Drizzle's built-in pooling:**

```tsx
// @groundwork/db/index.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

**Why:** LibSQL clients maintain connection pools. One client per app, not per request.

---

## 8. Drizzle Schema Push vs Migrations

**Problem:** Confusion about when to use `drizzle-kit push` vs `drizzle-kit generate` + `drizzle-kit migrate`.

**Two workflows:**

### Development (Schema Push - Fast, Destructive)

```bash
# Push schema directly to database (no migration files)
pnpm db:push
```

- ✅ Fast iteration
- ✅ Auto-syncs schema
- ❌ No migration history
- ❌ Destructive (drops columns, rewrites tables)

### Production (Migrations - Safe, Tracked)

```bash
# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

- ✅ Migration history
- ✅ Safe (reversible, reviewable)
- ✅ CI/CD friendly
- ❌ Slower iteration

**Rule:**

- **Dev:** Use `pnpm db:push` for fast iteration
- **Production:** Use `pnpm db:generate` + `pnpm db:migrate` for safety

**Gotcha:** If you `push` in dev, you lose migration history. For production, generate migrations BEFORE pushing.

**Workflow:**

```bash
# Development
1. Edit schema in packages/db/schema.ts
2. pnpm db:push  # Sync to Turso dev database

# Before production deploy
1. pnpm db:generate  # Create migration file
2. Review migration in drizzle/migrations/
3. pnpm db:migrate  # Apply to production database
```

---

## 9. Next.js Server Components + Hooks

**Problem:** React hooks (useState, useEffect, etc.) don't work in Server Components.

**Symptom:**

```
Error: You're importing a component that needs useState. This only works in a Client Component.
```

**Cause:** Next.js 16 defaults to Server Components. Hooks require `'use client'`.

**Solution:**

**Option A: Add 'use client' directive**

```tsx
"use client";

import { useState } from "react";

export function SessionForm() {
  const [notes, setNotes] = useState("");
  // ...
}
```

**Option B: Keep Server Component, extract Client Component**

```tsx
// app/journal/page.tsx (Server Component)
import { SessionForm } from "./session-form";

export default function JournalPage() {
  // Fetch data server-side
  const sessions = await getSessions();

  return (
    <div>
      <SessionForm /> {/* Client Component */}
      <SessionList sessions={sessions} /> {/* Server Component */}
    </div>
  );
}

// app/journal/session-form.tsx (Client Component)
("use client");

import { useState } from "react";

export function SessionForm() {
  const [notes, setNotes] = useState("");
  // ...
}
```

**Rule:** Use Server Components by default. Add `'use client'` only when needed (forms, interactivity, hooks).

---

## 10. NextAuth Middleware + Protected Routes

**Problem:** NextAuth middleware must be configured correctly to protect routes while keeping public pages accessible.

**Symptom:**

- `/about` redirects to `/sign-in` even though it's a public page
- Static pages fail to load
- API routes return 401 unexpectedly

**Cause:** Without proper middleware configuration, auth checks may apply too broadly or not at all.

**Solution:**

**Export NextAuth's `auth` as middleware:**

```tsx
// apps/web/middleware.ts
export { auth as middleware } from "next-auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**For route-level protection, check the session in server components:**

```tsx
// apps/web/app/(app)/layout.tsx
import { auth } from "next-auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
```

**Rule:** Use middleware for session hydration; use `auth()` checks in layouts/pages for route protection.

---

## Summary

**Top Gotchas:**

1. **Tailwind v4 + Monorepo:** Copy CSS to apps/web if imports fail
2. **pnpm 10:** Add `node-linker=hoisted` to `.npmrc`
3. **Turbopack:** Use full paths if subpath imports break
4. **Git Case-Sensitivity:** Use `git mv` for renames on macOS
5. **Object.assign Components:** Use named exports instead
6. **Stale Symlinks:** `rm -rf node_modules && pnpm install` after moving packages
7. **Turso Client:** Singleton pattern, one client per app
8. **Drizzle Push vs Migrate:** `push` for dev, `generate` + `migrate` for prod
9. **Server Components + Hooks:** Add `'use client'` when needed
10. **NextAuth Middleware:** Use `auth` export + route-level session checks

**When in doubt:** Check this doc, then search GitHub issues for the relevant tool.
