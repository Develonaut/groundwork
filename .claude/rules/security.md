# Security Checklist

**Last Updated:** April 13, 2026

This document outlines security best practices for Groundwork. Follow these guidelines to protect user data, prevent vulnerabilities, and ensure safe authentication flows.

---

## Overview

Groundwork handles sensitive user data:

- Training session notes (personal reflections)
- User accounts (email, profile data via NextAuth)
- Database queries (Turso LibSQL)

**Security Principles:**

1. **Never trust client input** - Validate everything
2. **Protect user data** - Encrypt in transit, control access
3. **Fail securely** - Errors should not leak sensitive info
4. **Principle of least privilege** - Users only access their own data

---

## 1. Authentication & Authorization (NextAuth + Next.js)

### 1.1 Route Protection

**Rule:** All protected routes must verify authentication before rendering content.

**Next.js App Router Pattern:**

```tsx
// apps/web/app/journal/page.tsx
import { auth } from "next-auth";
import { redirect } from "next/navigation";

export default async function JournalPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  // Render authenticated content
}
```

**Verify:**

- [ ] All `/journal/*` routes call `auth()` and check `session.user.id`
- [ ] Unauthenticated users are redirected to sign-in
- [ ] No protected content is rendered before auth check

**Red flags:**

- Rendering UI before checking `session.user.id`
- Relying on client-side auth state (use server-side `auth()` from NextAuth)

---

### 1.2 API Route Authorization

**Rule:** API routes must verify the user has permission to access the requested resource.

**Pattern:**

```tsx
// apps/web/app/api/sessions/[id]/route.ts
import { auth } from "next-auth";
import { getSessions } from "@groundwork/core";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authSession = await auth();
  const userId = authSession?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getSessions({ id: params.id, userId });

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify ownership
  if (session.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(session);
}
```

**Verify:**

- [ ] API routes call `auth()` to get `userId`
- [ ] Unauthorized requests return 401
- [ ] Resource ownership is verified before returning data
- [ ] Forbidden access returns 403

**Red flags:**

- Returning data without checking `userId`
- Trusting `userId` from request body (use `auth()` instead)

---

### 1.3 Session Management

**Handled by NextAuth:**

- Session tokens (JWT or database sessions)
- Token refresh
- Session expiration
- CSRF protection (automatic)

**Your responsibility:**

- Check `session.user.id` on every request
- Handle `null` session gracefully
- Do NOT store sensitive data in client state

**Pattern:**

```tsx
// Server Component
import { auth } from "next-auth";

const session = await auth();
const userId = session?.user?.id;

// Client Component
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  if (status === "unauthenticated") redirect("/sign-in");

  // Render authenticated UI
}
```

---

## 2. Input Validation & Sanitization

### 2.1 Zod Validation

**Rule:** ALL user input must be validated with Zod schemas before processing.

**Pattern:**

```tsx
// packages/core/src/schemas/session.ts
import { z } from "zod";

export const createSessionSchema = z.object({
  userId: z.string().min(1),
  date: z.string().datetime(),
  type: z.enum(["gi", "nogi", "openmat", "competition", "privates"]),
  duration: z.number().int().min(1).max(480), // 1-480 minutes
  notes: z.string().max(10000).optional(),
  techniques: z.array(z.string()).max(50).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
```

**API Route Usage:**

```tsx
import { createSessionSchema } from "@groundwork/core/schemas";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Validate input
  const result = createSessionSchema.safeParse({ ...body, userId });

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  // Safe to use validated data
  const session = await createSession(result.data);
  return NextResponse.json(session);
}
```

**Verify:**

- [ ] All API routes validate request bodies with Zod
- [ ] All form submissions validate inputs with Zod
- [ ] Validation failures return 400 with error details
- [ ] Never trust client input without validation

---

### 2.2 SQL Injection Prevention

**Rule:** Use Drizzle ORM for all database queries. NEVER concatenate user input into SQL strings.

**Safe (Drizzle ORM):**

```ts
import { db } from "@groundwork/db";
import { sessions } from "@groundwork/db/schema";
import { eq, and } from "drizzle-orm";

// Safe - Drizzle uses parameterized queries
const results = await db
  .select()
  .from(sessions)
  .where(and(eq(sessions.userId, userId), eq(sessions.id, sessionId)));
```

**Unsafe (raw SQL - DO NOT DO THIS):**

```ts
// WRONG - SQL injection vulnerability
const results = await db.execute(`
  SELECT * FROM sessions
  WHERE userId = '${userId}'
  AND id = '${sessionId}'
`);
```

**Verify:**

- [ ] All queries use Drizzle ORM (not raw SQL)
- [ ] No string concatenation in queries
- [ ] User input is passed as parameters, not interpolated

---

### 2.3 XSS Prevention

**Rule:** Never render unsanitized user input as HTML.

**Safe (React auto-escapes):**

```tsx
// Safe - React escapes HTML by default
function SessionNotes({ notes }: { notes: string }) {
  return <p>{notes}</p>;
}
```

**Unsafe (dangerouslySetInnerHTML):**

```tsx
// WRONG - XSS vulnerability
function SessionNotes({ notes }: { notes: string }) {
  return <div dangerouslySetInnerHTML={{ __html: notes }} />;
}
```

**If you MUST render markdown:**

```tsx
import { remark } from "remark";
import html from "remark-html";
import sanitizeHtml from "sanitize-html";

function SessionNotes({ notes }: { notes: string }) {
  const processedNotes = await remark().use(html).process(notes);

  const sanitized = sanitizeHtml(processedNotes.toString(), {
    allowedTags: ["p", "strong", "em", "ul", "ol", "li", "code", "pre"],
    allowedAttributes: {},
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**Verify:**

- [ ] No `dangerouslySetInnerHTML` unless absolutely necessary
- [ ] If used, HTML is sanitized with `sanitize-html`
- [ ] Markdown is processed through a safe pipeline

---

## 3. Data Access Control

### 3.1 User Data Isolation

**Rule:** Users can ONLY access their own data. Always filter by `userId`.

**Pattern:**

```ts
// packages/core/src/services/sessions.ts
import { db } from "@groundwork/db";
import { sessions } from "@groundwork/db/schema";
import { eq, and } from "drizzle-orm";

export async function getSessions(userId: string) {
  // ALWAYS filter by userId
  return await db.select().from(sessions).where(eq(sessions.userId, userId));
}

export async function getSession(id: string, userId: string) {
  const results = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, id),
        eq(sessions.userId, userId), // CRITICAL - prevent access to other users' data
      ),
    );

  return results[0] || null;
}
```

**Verify:**

- [ ] All database queries filter by `userId`
- [ ] No queries return data for other users
- [ ] Ownership is verified before updates/deletes

**Red flags:**

- Queries without `userId` filter
- Trusting client-provided `userId` (always use `auth()`)

---

### 3.2 Database Row-Level Security (Future)

Turso supports row-level security policies. For now, we enforce security in application code.

**Future enhancement:**

```sql
-- Turso RLS policy (not implemented yet)
CREATE POLICY user_sessions_policy ON sessions
  USING (userId = current_user_id());
```

---

## 4. Sensitive Data Handling

### 4.1 Environment Variables

**Rule:** Store secrets in `.env.local`, never commit to git.

**Required secrets:**

```bash
# .env.local (NEVER commit this file)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

**Verify:**

- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets in code (use `process.env.SECRET_NAME`)
- [ ] Secrets are set in Vercel dashboard for production

**Red flags:**

- Hard-coded API keys, database URLs, auth tokens
- Committed `.env.local` files

---

### 4.2 Error Messages

**Rule:** Do not leak sensitive information in error messages.

**Safe:**

```ts
// Good - generic error for client
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Good - log details server-side only
console.error("Auth failed:", error);
```

**Unsafe:**

```ts
// WRONG - leaks database details
return NextResponse.json(
  {
    error: `Database query failed: ${error.message}`,
  },
  { status: 500 },
);

// WRONG - leaks user existence
return NextResponse.json(
  {
    error: "User with email user@example.com not found",
  },
  { status: 404 },
);
```

**Pattern:**

```ts
try {
  // Database operation
} catch (error) {
  console.error("Database error:", error); // Log server-side
  return NextResponse.json(
    {
      error: "An error occurred", // Generic message for client
    },
    { status: 500 },
  );
}
```

---

## 5. HTTPS & Transport Security

**Rule:** All production traffic uses HTTPS.

**Vercel handles:**

- ✅ Automatic HTTPS certificates
- ✅ HTTP → HTTPS redirects
- ✅ TLS 1.3

**Your responsibility:**

- [ ] No `http://` URLs in production code
- [ ] Cookies use `Secure` flag (NextAuth handles this)

---

## 6. Dependency Security

### 6.1 Regular Updates

**Rule:** Keep dependencies up to date to patch vulnerabilities.

**Commands:**

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

**Frequency:**

- Check weekly during active development
- Check before every production deploy

---

### 6.2 Trusted Sources

**Rule:** Only install packages from npm with good reputation.

**Before installing a package, check:**

- [ ] Recent downloads (> 10k/week)
- [ ] Active maintenance (commits in last 3 months)
- [ ] Known vulnerabilities (check npm audit)
- [ ] License compatibility (MIT, Apache, etc.)

---

## 7. Rate Limiting (Future)

**Not implemented yet**, but plan for:

- API route rate limits (e.g., 100 requests/minute per user)
- NextAuth handles auth rate limits
- Turso has built-in query limits

**Future tools:**

- `@upstash/ratelimit` (Redis-based)
- Vercel Edge Config

---

## 8. Content Security Policy (Future)

**Not implemented yet**, but plan for:

- CSP headers to prevent XSS
- Restrict script sources
- Restrict external resources

**Example (future):**

```tsx
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

## When to Run Full Security Audit

Run this checklist for:

- [ ] All authentication/authorization changes
- [ ] New API routes
- [ ] Database schema changes
- [ ] User input handling
- [ ] Before production deploy
- [ ] After adding new dependencies

**Quick checks (on every commit):**

- Zod validation for new inputs
- `userId` checks in new queries
- No hard-coded secrets

---

## Summary

**Key Security Rules:**

1. **Auth:** Verify `userId` on every protected route/API
2. **Validation:** Use Zod for all user input
3. **SQL:** Use Drizzle ORM, never raw SQL with user input
4. **XSS:** Let React auto-escape, sanitize if using `dangerouslySetInnerHTML`
5. **Access Control:** Always filter by `userId`
6. **Secrets:** Use `.env.local`, never commit
7. **Errors:** Generic messages for client, detailed logs server-side

**If you're unsure about security:** Ask for a second review before merging.
