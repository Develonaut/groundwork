# Architecture Rules

**Last Updated:** April 13, 2026

---

## Overview

Groundwork uses a **layered architecture** with strict boundaries between layers. This ensures the app remains maintainable, testable, and adaptable as it grows.

**Core Principle:** Apps consume APIs, APIs abstract transports, transports handle persistence.

---

## Table of Contents

1. [Layered Architecture](#layered-architecture)
2. [Package Responsibilities](#package-responsibilities)
3. [API Abstraction](#api-abstraction)
4. [Import Boundary Rules](#import-boundary-rules)
5. [State Management](#state-management)
6. [Cost-First Architecture](#cost-first-architecture)
7. [Data Flow](#data-flow)
8. [Content Model](#content-model)
9. [Testing Boundaries](#testing-boundaries)

---

## Layered Architecture

```
┌─────────────────────────────────────────────┐
│  apps/web (Next.js 16 PWA)                  │
│  - Journal interface                        │
│  - Auth pages (Sprint 2)                    │
│  - PWA configuration                        │
└─────────────────┬───────────────────────────┘
                  │
                  │ imports @groundwork/core, @groundwork/ui
                  ▼
┌─────────────────────────────────────────────┐
│  @groundwork/core (Transport-agnostic API)  │
│  - Clients (public API, own stores)         │
│  - Hooks (reactive subscriptions)           │
│  - Stores (Zustand + persist)               │
│  - Services (Sprint 2+ — async writes)      │
│  - Adapters (Sprint 2+ — Turso, NextAuth)   │
└─────────────────┬───────────────────────────┘
                  │
                  │ MVP: Zustand persist → localStorage
                  │ Sprint 2+: adapters → external services
                  ▼
┌─────────────────────────────────────────────┐
│  Storage                                    │
│  - localStorage (MVP via persist)           │
│  - Turso / LibSQL (Sprint 2+)              │
│  - NextAuth.js (Sprint 2+)                 │
└─────────────────────────────────────────────┘
```

### Critical Rule: Never Skip Layers

**❌ WRONG:**

```tsx
// apps/web/app/sessions/page.tsx
import { db } from "@groundwork/core/db";
import { sessions } from "@groundwork/core/schema";

export default function SessionsPage() {
  const sessions = await db.select().from(sessions); // NEVER!
}
```

**✅ CORRECT:**

```tsx
// apps/web/app/sessions/page.tsx
import { useSessions } from "@groundwork/core";

export default function SessionsPage() {
  const { data: sessions } = useSessions(); // Always through @groundwork/core
}
```

---

## Package Responsibilities

### `@groundwork/core` — Transport-Agnostic API Layer

**Purpose:** Provide a clean, stable API that abstracts away database implementation details.

**Exports:**

- React hooks for queries (`useSessions`, `useEntries`, `useSession`)
- React hooks for mutations (`useCreateSession`, `useUpdateEntry`)
- TypeScript types (`Session`, `Entry`, `CreateSessionInput`)
- Service layer functions (for server components/actions)

**Internal Structure:**

```
packages/core/
├── src/
│   ├── index.ts                # Public API surface
│   ├── core.ts                 # Imperative singleton (clients wired up)
│   ├── reactCore.ts            # React-enhanced singleton (adds hooks)
│   ├── clients/                # Public API — owns stores, domain methods
│   │   └── sessionsClient.ts
│   ├── hooks/                  # Reactive layer — subscribe to stores
│   │   ├── useSessions.ts
│   │   └── useCreateSession.ts
│   ├── stores/                 # Zustand stores — state + persist
│   │   ├── createEnhancedStore.ts
│   │   └── sessionsStore.ts
│   ├── services/               # Write path (Sprint 2+ — Turso)
│   ├── adapters/               # Backend-specific (Sprint 2+ — Turso, NextAuth)
│   └── types/                  # TypeScript types + Zod schemas
│       └── session.ts
```

**Dependencies:**

- `zustand` (domain state — stores with persist middleware)
- `immer` (ergonomic state mutations in stores)
- `@tanstack/react-query` (server state — Sprint 2+)
- `drizzle-orm` (type-safe SQL — Sprint 2+)
- `@libsql/client` (Turso client — Sprint 2+)
- `next-auth` (auth — Sprint 2+)
- `zod` (validation)

**Key Principle:** The adapter pattern allows swapping the persistence layer (localStorage → Turso → Postgres) without changing the API contract.

---

### `@groundwork/ui` — Swiss Design Component Library

**Purpose:** Provide a consistent, zen, Swiss Design UI component library.

**Exports:**

- Primitive components (`Button`, `Input`, `Card`, `Dialog`)
- Layout components (`Container`, `Stack`, `Grid`)
- Typography components (`Heading`, `Text`, `Label`)
- Form components (`Form`, `Field`, `Textarea`)

**Internal Structure:**

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── container.tsx
│   │   ├── stack.tsx
│   │   └── form.tsx
│   ├── styles/
│   │   └── tokens.ts        # Design tokens
│   └── index.ts
```

**Dependencies:**

- `react`
- `tailwindcss`
- `class-variance-authority` (component variants)
- `tailwind-merge` (class merging)

**Key Principle:** `@groundwork/ui` is a **leaf package**. It NEVER imports from `@groundwork/core` or any other `@groundwork/*` package. It's pure presentation.

---

### `apps/web` — Next.js 16 PWA

**Purpose:** The journal application. Composes `@groundwork/core` and `@groundwork/ui` into a cohesive experience.

**Responsibilities:**

- Pages and routing
- Server components and server actions
- Auth flows (NextAuth)
- PWA configuration
- SEO and metadata
- Layout and navigation

**Internal Structure:**

```
apps/web/
├── app/
│   ├── (auth)/             # Auth pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (app)/              # Protected app pages
│   │   ├── sessions/
│   │   ├── entries/
│   │   └── profile/
│   ├── api/                # API routes (if needed)
│   ├── layout.tsx
│   └── page.tsx
├── components/             # App-specific components
│   ├── session-card.tsx
│   ├── entry-editor.tsx
│   └── nav.tsx
├── lib/                    # App utilities
│   └── utils.ts
├── public/                 # Static assets
│   ├── manifest.json
│   └── icons/
└── next.config.ts
```

**Dependencies:**

- `next`
- `react`
- `@groundwork/core`
- `@groundwork/ui`
- `next-auth`

---

## API Abstraction

**Rule:** UI code NEVER calls database APIs directly. Always go through `@groundwork/core`.

### Why This Matters

1. **Testability:** You can mock `@groundwork/core` hooks without mocking Drizzle or Turso.
2. **Flexibility:** Swap databases without touching UI code.
3. **Type Safety:** `@groundwork/core` provides stable TypeScript contracts.
4. **Optimization:** React Query handles caching, deduplication, and revalidation.

### Query Pattern (React Query)

**Client Components:**

```tsx
// apps/web/components/session-list.tsx
"use client";

import { useSessions } from "@groundwork/core";
import { SessionCard } from "./session-card";

export function SessionList() {
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {sessions?.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
```

**Server Components:**

```tsx
// apps/web/app/sessions/page.tsx
import { SessionService } from "@groundwork/core/services";
import { SessionCard } from "@/components/session-card";

export default async function SessionsPage() {
  const sessions = await SessionService.list();

  return (
    <div>
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
```

### Mutation Pattern (Optimistic Updates)

```tsx
// apps/web/components/create-session-form.tsx
"use client";

import { useCreateSession } from "@groundwork/core";
import { Button, Input } from "@groundwork/ui";

export function CreateSessionForm() {
  const createSession = useCreateSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await createSession.mutateAsync({
      date: formData.get("date") as string,
      duration: Number(formData.get("duration")),
      type: formData.get("type") as "gi" | "nogi",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="date" type="date" required />
      <Input name="duration" type="number" required />
      <select name="type">
        <option value="gi">Gi</option>
        <option value="nogi">No-Gi</option>
      </select>
      <Button type="submit" disabled={createSession.isPending}>
        Create Session
      </Button>
    </form>
  );
}
```

### Core API Implementation

```tsx
// packages/core/src/hooks/use-sessions.ts
import { useQuery } from "@tanstack/react-query";
import { SessionService } from "../services/session-service";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => SessionService.list(),
  });
}

// packages/core/src/hooks/use-create-session.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionService } from "../services/session-service";
import type { CreateSessionInput } from "../types/session";

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSessionInput) => SessionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// packages/core/src/services/session-service.ts
import { db } from "../adapters/turso/client";
import { sessions } from "../adapters/turso/schema";
import type { CreateSessionInput, Session } from "../types/session";

export class SessionService {
  static async list(): Promise<Session[]> {
    return db.select().from(sessions);
  }

  static async create(input: CreateSessionInput): Promise<Session> {
    const [session] = await db.insert(sessions).values(input).returning();
    return session;
  }

  static async get(id: string): Promise<Session | null> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || null;
  }
}
```

---

## Import Boundary Rules

These rules are **enforced** and **non-negotiable**. They prevent circular dependencies and maintain clean architecture.

### `@groundwork/core` Imports

**CAN import:**

- `zustand` (stores)
- `immer` (store middleware)
- `@tanstack/react-query`
- `drizzle-orm`
- `@libsql/client`
- `next-auth`
- `zod` (validation)
- Standard library

**CANNOT import:**

- `@groundwork/ui`
- `next/*` (except types if needed)
- Any app-specific code

### `@groundwork/ui` Imports

**CAN import:**

- `react`
- `tailwindcss`
- `class-variance-authority`
- `tailwind-merge`
- Icon libraries
- Standard library

**CANNOT import:**

- `@groundwork/core`
- Any other `@groundwork/*` package
- `next/*`
- Any business logic

**Why:** `@groundwork/ui` is a **leaf package**. It's pure presentation and should be reusable in any React context.

### `apps/web` Imports

**CAN import:**

- `@groundwork/core`
- `@groundwork/ui`
- `next/*`
- `next-auth`
- Any app-specific utilities

**CANNOT import:**

- `drizzle-orm` directly
- `@libsql/client` directly
- Database adapters directly

**Why:** The app layer consumes APIs, it doesn't implement them.

### Visual Dependency Graph

```
┌─────────────┐
│  apps/web   │
└──────┬──────┘
       │
       ├─────────┐
       │         │
       ▼         ▼
┌──────────┐  ┌─────────┐
│ @groundwork/core│  │ @groundwork/ui │  ← Leaf (no @groundwork/* deps)
└─────┬────┘  └─────────┘
      │
      ▼
┌──────────────┐
│  Adapters    │
│  - Turso     │
│  - NextAuth  │
└──────────────┘
```

---

## State Management

Groundwork uses **multiple state strategies** based on the type of data. The primary pattern is **Zustand stores** owned by `@groundwork/core` clients, following bnto's proven architecture.

### Domain State (Zustand Stores)

**Use for:** Domain data owned by `@groundwork/core` — sessions, auth state, user profile.

**Managed by:** Zustand stores with `createEnhancedStore` (immer + optional persist middleware). Clients own their stores, hooks subscribe reactively.

**Example:**

```tsx
// Hook subscribes to store via selector
const { data: sessions } = useSessions();

// Client writes to store imperatively
core.sessions.create({ date: "2026-04-13", notes: "Worked on half guard" });
```

**Benefits:**

- Instant reads (no async for local data)
- Persist middleware for localStorage/sessionStorage
- Immer for ergonomic state mutations
- Selectors optimize re-renders
- Vanilla stores work in tests without React

**MVP:** Sessions store persisted to localStorage. The store IS the data layer.

**Sprint 2+:** Stores blend with React Query — persisted state provides instant data while server queries load.

### Server State (React Query — Sprint 2+)

**Use for:** Async data from Turso once database is added.

**Managed by:** `@groundwork/core` services returning `queryOptions` objects.

**Example:**

```tsx
// Sprint 2: hooks blend store (instant) + query (live)
const { data: sessions, isLoading } = useSessions();
```

**Benefits:**

- Automatic caching and background refetching
- Optimistic updates
- Request deduplication
- Stale-while-revalidate

### Local UI State (useState)

**Use for:** Ephemeral UI state (modals, forms, toggles, filters).

```tsx
const [isOpen, setIsOpen] = useState(false);
```

### URL State (Next.js Router)

**Use for:** Navigation state (active tab, search query, filters).

```tsx
export default function SessionsPage({ searchParams }: { searchParams: { type?: "gi" | "nogi" } }) {
  const type = searchParams.type || "all";
}
```

### State Decision Matrix

| Data Type           | Strategy                | Example                 |
| ------------------- | ----------------------- | ----------------------- |
| Domain records      | Zustand store (persist) | Sessions, user profile  |
| Auth state          | Zustand store (persist) | Current user, status    |
| Server records      | React Query (Sprint 2+) | Live session data       |
| Form inputs         | useState                | Text fields, checkboxes |
| Modal visibility    | useState                | Dialog open/closed      |
| Active tab / filter | URL params              | `/sessions?type=gi`     |
| Search query        | URL params              | `/sessions?q=armbar`    |

---

## Cost-First Architecture

**Goal:** Run Groundwork at **$0/month** for as long as possible.

### Free Tier Limits

| Service  | Free Tier                    | Notes                              |
| -------- | ---------------------------- | ---------------------------------- |
| Vercel   | 100GB bandwidth, 6000 min/mo | More than enough for MVP           |
| Turso    | 8GB storage, 25B row reads   | Massive headroom for a journal app |
| NextAuth | Unlimited (self-hosted)      | Self-hosted, no user limits        |

### Architectural Choices for Cost

1. **Static-first:** Use Next.js static generation wherever possible (cheaper than SSR)
2. **Client-side queries:** React Query handles most reads client-side (fewer Vercel function invocations)
3. **Batch writes:** Group mutations to reduce Turso write operations
4. **CDN-friendly:** Aggressive caching headers for static assets
5. **Edge functions:** Use Vercel Edge Functions (cheaper than Node.js functions) for auth checks

### Cost Monitoring

```tsx
// packages/core/src/adapters/turso/client.ts
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// TODO: Add query logging in development to monitor usage
if (process.env.NODE_ENV === "development") {
  db.on("query", (query) => {
    console.log("[Turso]", query);
  });
}
```

---

## Data Flow

### Read Flow (Query)

```
┌──────────────────────────────────────────────────────────┐
│  User opens /sessions                                    │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  SessionList component renders                           │
│  Calls: const { data } = useSessions()                   │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  @groundwork/core/hooks/use-sessions                            │
│  useQuery(['sessions'], SessionService.list)             │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ├─ Cache hit? Return cached data
                            │
                            ▼ Cache miss? Fetch
┌──────────────────────────────────────────────────────────┐
│  @groundwork/core/services/SessionService.list()                │
│  Calls Drizzle query: db.select().from(sessions)         │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Turso Adapter (Drizzle)                                 │
│  Executes SQL: SELECT * FROM sessions                    │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Turso Database (LibSQL)                                 │
│  Returns rows                                            │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  React Query caches result                               │
│  Component re-renders with data                          │
└──────────────────────────────────────────────────────────┘
```

### Write Flow (Mutation)

```
┌──────────────────────────────────────────────────────────┐
│  User submits form to create session                     │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Form onSubmit handler                                   │
│  Calls: createSession.mutateAsync(input)                 │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  @groundwork/core/hooks/use-create-session                      │
│  useMutation(SessionService.create)                      │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ├─ Optimistic update (optional)
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  @groundwork/core/services/SessionService.create(input)         │
│  Validates input, calls Drizzle insert                   │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Turso Adapter (Drizzle)                                 │
│  Executes SQL: INSERT INTO sessions                      │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Turso Database (LibSQL)                                 │
│  Persists row, returns inserted record                   │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  React Query invalidates ['sessions'] cache              │
│  Triggers refetch, UI updates                            │
└──────────────────────────────────────────────────────────┘
```

---

## Content Model

Groundwork has a simple, focused content model:

### Sessions

A **Session** represents a training session at the gym.

**Schema:**

```typescript
// packages/core/src/types/session.ts
export type Session = {
  id: string; // UUID
  userId: string; // NextAuth user ID
  date: string; // ISO date (YYYY-MM-DD)
  type: "gi" | "nogi"; // Training type
  duration: number; // Minutes
  location?: string; // Gym/location name
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSessionInput = Omit<Session, "id" | "createdAt" | "updatedAt">;
```

**Database:**

```sql
-- packages/core/src/adapters/turso/schema.ts
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('gi', 'nogi')),
  duration INTEGER NOT NULL,
  location TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_date ON sessions(date);
```

### Entries

An **Entry** is a journal entry within a session. A session can have multiple entries.

**Schema:**

```typescript
// packages/core/src/types/entry.ts
export type Entry = {
  id: string; // UUID
  sessionId: string; // Foreign key to Session
  userId: string; // NextAuth user ID
  content: string; // Markdown content
  type: "note" | "technique" | "reflection";
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;
```

**Database:**

```sql
-- packages/core/src/adapters/turso/schema.ts
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('note', 'technique', 'reflection')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_entries_session_id ON entries(session_id);
CREATE INDEX idx_entries_user_id ON entries(user_id);
```

### Relationships

```
Session (1) ──< (many) Entry

- A session has many entries
- An entry belongs to one session
- Deleting a session cascades to delete its entries
```

### Future Extensions

The model is designed to extend gracefully:

- **Techniques:** Add a `techniques` table for structured technique tracking
- **Progress:** Add a `progress` table for belt/stripe milestones
- **Tags:** Add a `tags` table and `entry_tags` junction table
- **Attachments:** Add an `attachments` table for photos/videos

---

## Testing Boundaries

**Rule:** Test at the API boundary, not the implementation.

### What to Test

**✅ Test:**

- `@groundwork/core` hooks return correct data shape
- Service methods validate inputs
- Mutations trigger cache invalidation
- Error states are handled

**❌ Don't Test:**

- Drizzle query implementation details
- React Query internals
- Turso connection logic

### Example Tests

```typescript
// packages/core/src/hooks/__tests__/use-sessions.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSessions } from '../use-sessions'
import { SessionService } from '../../services/session-service'

// Mock the service layer
vi.mock('../../services/session-service')

describe('useSessions', () => {
  it('returns sessions list', async () => {
    const mockSessions = [
      { id: '1', date: '2026-04-13', type: 'gi', duration: 90 },
    ]

    vi.mocked(SessionService.list).mockResolvedValue(mockSessions)

    const queryClient = new QueryClient()
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useSessions(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSessions)
  })
})
```

---

## Summary Checklist

When writing code, ask yourself:

- [ ] Am I importing `@groundwork/core` in the UI layer? (Good)
- [ ] Am I importing Drizzle in the UI layer? (Bad)
- [ ] Am I importing `@groundwork/core` in `@groundwork/ui`? (Bad)
- [ ] Is this React Query hook in `@groundwork/core/hooks`? (Good)
- [ ] Is this service method in `@groundwork/core/services`? (Good)
- [ ] Is this component under 250 lines? (See code-standards.md)
- [ ] Is this function under 20 lines? (See code-standards.md)
- [ ] Am I following the Bento Box Principle? (One thing per file)

---

**Remember:** Architecture is not about perfection, it's about **consistency**. Follow these rules, and the codebase will stay clean and maintainable as it grows.
