# Core API Architecture

**Package:** `@groundwork/core`
**Last Updated:** April 13, 2026

---

## Overview

`@groundwork/core` is the transport-agnostic data layer for Groundwork. It abstracts all data operations behind a clean, domain-driven API so that UI code never knows whether it's talking to a Zustand store, Turso, local SQLite, or any future backend.

**Key Principle:** The app imports from `@groundwork/core`. Never from `drizzle`, `@libsql/client`, `zustand`, or any storage-specific package.

---

## Architecture Pattern: Layered Singleton

```
┌─────────────────────────────────────────┐
│  Apps (Next.js)                         │
│  import { core } from '@groundwork/core'│
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Clients (Public API)                   │
│  - core.sessions                        │
│  - core.user (Sprint 2)                 │
│  - core.auth (Sprint 2)                 │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
┌───▼────┐ ┌▼──────┐ ┌▼──────────┐
│ Stores │ │Queries│ │ Services  │
│(state) │ │(reads)│ │ (writes)  │
└───┬────┘ └┬──────┘ └┬──────────┘
    │       │         │
    └───────┼─────────┘
            │
┌───────────▼─────────────────────────────┐
│  Adapters (Backend-specific)            │
│  - localStorage (MVP via persist)       │
│  - TursoAdapter (Sprint 2)             │
│  - AuthAdapter (Sprint 2)               │
└─────────────────────────────────────────┘
```

---

## Domain Public API

Groundwork starts with 1 domain for MVP and grows to 3:

| Domain          | Sprint | Responsibility             | Key Methods                                     |
| --------------- | ------ | -------------------------- | ----------------------------------------------- |
| `core.sessions` | MVP    | Journal sessions (CRUD)    | `store`, `create()`, `remove()`, `get()`        |
| `core.user`     | 2      | User profile & preferences | `meQueryOptions()`, `update()`                  |
| `core.auth`     | 2      | Auth state & actions       | `store`, `useIsAuthenticated()`, `useSignOut()` |

**Usage:**

```tsx
import { core } from "@groundwork/core";

function SessionList() {
  const sessions = useSessions(); // hook subscribes to core.sessions.store
  // ...
}
```

---

## Layer Responsibilities

### 1. Stores (State)

**Location:** `packages/core/src/stores/`

Stores hold domain state using Zustand. They are the single source of truth.

**Pattern:** `createEnhancedStore` — a factory that wraps Zustand with immer (draft mutations) and optional persist middleware (localStorage/sessionStorage).

**Rules:**

- One store per domain (sessions store, auth store, etc.)
- Stores own their state shape and mutation methods
- Stores are vanilla Zustand (no React dependency) — usable in tests and server code
- Persist middleware is opt-in via `options.persist`
- `partialize` controls what gets persisted (exclude ephemeral state)

**Factory:**

```ts
// packages/core/src/stores/createEnhancedStore.ts
import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

type EnhancedStoreOptions = {
  persist?: {
    name: string;
    partialize?: (state: any) => any;
    storage?: ReturnType<typeof createJSONStorage>;
  };
};

export function createEnhancedStore<T>(options?: EnhancedStoreOptions) {
  return (initializer: StateCreator<T>) => {
    let creator = immer(initializer);

    if (options?.persist) {
      creator = persist(creator, {
        name: options.persist.name,
        partialize: options.persist.partialize,
        storage: options.persist.storage ?? createJSONStorage(() => localStorage),
      });
    }

    return createStore(creator);
  };
}
```

**Example — Sessions Store (MVP):**

```ts
// packages/core/src/stores/sessionsStore.ts
import { createEnhancedStore } from "./createEnhancedStore";
import type { Session } from "../types/session";

type SessionsStoreState = {
  sessions: Record<string, Session>;
  upsert: (session: Session) => void;
  remove: (id: string) => void;
};

export const sessionsStore = createEnhancedStore<SessionsStoreState>({
  persist: {
    name: "groundwork-sessions",
    partialize: (state) => ({ sessions: state.sessions }),
  },
})((set) => ({
  sessions: {},

  upsert: (session) =>
    set((state) => {
      state.sessions[session.id] = session; // immer draft mutation
    }),

  remove: (id) =>
    set((state) => {
      delete state.sessions[id];
    }),
}));
```

**Key design:**

- `Record<string, Session>` for O(1) lookup by ID
- `partialize` ensures only sessions are persisted (not ephemeral UI state)
- Immer syntax — mutate draft state directly, no spread boilerplate
- Vanilla Zustand store — no React dependency, testable with plain objects

---

### 2. Clients (Public API)

**Location:** `packages/core/src/clients/`

Clients are the **only public API**. They own their stores and provide domain-specific methods.

**Rules:**

- Expose the `store` for reactive subscriptions in hooks
- Provide imperative methods for state mutations
- Handle side effects (validation, cache invalidation)
- Never call adapters directly (services do that in Sprint 2)
- Never import other clients
- Use factory functions, not classes

**Example — Sessions Client (MVP):**

```ts
// packages/core/src/clients/sessionsClient.ts
import { sessionsStore } from "../stores/sessionsStore";
import { sessionSchema } from "../types/session";

export function createSessionsClient() {
  return {
    store: sessionsStore,

    create: (input: { date: string; notes: string }) => {
      const session = sessionSchema.parse({
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
      sessionsStore.getState().upsert(session);
      return session;
    },

    remove: (id: string) => {
      sessionsStore.getState().remove(id);
    },

    get: (id: string) => {
      return sessionsStore.getState().sessions[id] ?? null;
    },
  } as const;
}
```

**Key pattern:**

- Client wraps store with domain logic (validation, ID generation)
- `store` exposed for hooks to subscribe reactively
- Imperative reads via `getState()` for non-reactive access
- Factory function returns `as const` — no classes, no `this`

---

### 3. Hooks (Reactive Layer)

**Location:** `packages/core/src/hooks/`

Hooks subscribe to stores and provide reactive state to React components.

**Rules:**

- Use `useStore(store, selector)` for reactive subscriptions
- Selectors optimize re-renders (only re-render when selected slice changes)
- Return React Query-like interface `{ data, isLoading }` for consistency
- Transformations (sort, filter) happen in the hook via `useMemo`

**Example — useSessions:**

```ts
// packages/core/src/hooks/useSessions.ts
import { useStore } from "zustand";
import { useMemo } from "react";
import { sessionsStore } from "../stores/sessionsStore";

export function useSessions() {
  const sessions = useStore(sessionsStore, (s) => s.sessions);

  const data = useMemo(
    () =>
      Object.values(sessions).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [sessions],
  );

  return { data, isLoading: false };
}
```

**Example — useCreateSession:**

```ts
// packages/core/src/hooks/useCreateSession.ts
import { useCallback } from "react";
import type { core } from "../index";

export function useCreateSession() {
  return useCallback((input: { date: string; notes: string }) => {
    return core.sessions.create(input);
  }, []);
}
```

**Key pattern:**

- `useSessions()` subscribes to the store, sorts by date, returns `{ data, isLoading }`
- `isLoading: false` for MVP (localStorage is sync). Sprint 2 adds real loading states
- The hook interface stays the same when we add React Query — consumers don't change

---

### 4. Services (Write Path — Sprint 2+)

**Location:** `packages/core/src/services/`

Services handle async write operations when we add Turso. For MVP, the client writes directly to the store.

**Sprint 2 pattern:**

```ts
// packages/core/src/services/sessionsService.ts
export function createSessionsService(db: TursoAdapter, queryClient: QueryClient) {
  return {
    create: async (data: CreateSessionInput) => {
      const session = await db.sessions.insert(data);
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      return session;
    },

    listQueryOptions: () =>
      queryOptions({
        queryKey: ["sessions", "list"],
        queryFn: () => db.sessions.findMany(),
        select: (data) =>
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      }),
  } as const;
}
```

**Rules:**

- Never import other services
- Never import clients
- Can call adapters directly
- Handle cache invalidation after mutations
- Return `queryOptions` objects for React Query reads

---

### 5. Adapters (Backend-Specific — Sprint 2+)

**Location:** `packages/core/src/adapters/`

Adapters are the **only layer** that knows about the backend (Turso, Drizzle, NextAuth).

**MVP:** No adapters needed. The Zustand persist middleware IS the storage layer.

**Sprint 2:**

```ts
// packages/core/src/adapters/turso.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../db/schema";

export function createTursoAdapter(url: string, authToken: string) {
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  return {
    sessions: {
      findMany: () => db.query.sessions.findMany(),
      findById: (id: string) => db.query.sessions.findFirst({ where: eq(schema.sessions.id, id) }),
      insert: (data: InsertSession) => db.insert(schema.sessions).values(data).returning(),
    },
  } as const;
}
```

**Rules:**

- One adapter per backend concern
- Export typed interfaces, not implementation details
- No Drizzle/LibSQL/NextAuth imports leak to upper layers
- Factory functions, not classes

---

## Wiring: The Core Singleton

**Location:** `packages/core/src/core.ts` + `packages/core/src/reactCore.ts`

Following bnto's pattern: `core.ts` creates the imperative singleton, `reactCore.ts` enhances it with hooks.

```ts
// packages/core/src/core.ts
import { createSessionsClient } from "./clients/sessionsClient";

function createCore() {
  return {
    sessions: createSessionsClient(),
  };
}

// Singleton — created once, imported everywhere
export const core = createCore();
```

```ts
// packages/core/src/reactCore.ts
import { core as imperativeCore } from "./core";
import { useSessions } from "./hooks/useSessions";
import { useCreateSession } from "./hooks/useCreateSession";

export const core = {
  ...imperativeCore,
  sessions: {
    ...imperativeCore.sessions,
    useSessions,
    useCreateSession,
  },
};
```

```ts
// packages/core/src/index.ts
export { core } from "./reactCore";
export { createEnhancedStore } from "./stores/createEnhancedStore";
export type { Session, SessionInput } from "./types/session";
```

---

## Dependency Rules

### Services NEVER Import Other Services

**Rationale:** Services are domain boundaries. Cross-service calls create coupling and circular dependency risks.

### Clients NEVER Import Other Clients

### Namespace Exports Only

**❌ WRONG:**

```ts
import { SessionsClient } from "@groundwork/core/clients/sessions";
```

**✅ CORRECT:**

```ts
import { core } from "@groundwork/core";
core.sessions.create(input);
```

**Rationale:** The namespace `core` is the public API. Internal structure can change without breaking imports.

---

## No Implementation Detail Leakage

### Rule: No Technology Names in Public API

**❌ WRONG:**

```ts
core.sessions.getZustandState();
core.sessions.getTursoSessions();
core.user.nextAuthProfile();
```

**✅ CORRECT:**

```ts
core.sessions.create(input);
core.sessions.get(id);
core.sessions.store; // for reactive subscriptions
```

### Rule: Domain Concepts Only

Method names reflect **what** they do, not **how** they do it.

---

## React Query Rules (Sprint 2+)

When Turso is added, services return React Query `queryOptions` objects.

### Always Use `select` for Data Transforms

```ts
listQueryOptions() {
  return queryOptions({
    queryKey: ['sessions', 'list'],
    queryFn: () => this.db.sessions.findMany(),
    select: (data) => data.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })
}
```

**Rationale:** Transforms in `select` are memoized and don't re-run on every render.

---

## File Structure

### MVP (Sprint 1)

```
packages/core/src/
├── index.ts                    # Public exports: { core, createEnhancedStore, types }
├── core.ts                     # Imperative singleton (clients wired up)
├── reactCore.ts                # React-enhanced singleton (adds hooks)
├── clients/
│   └── sessionsClient.ts       # Sessions client (owns store)
├── hooks/
│   ├── useSessions.ts          # Reactive session list
│   └── useCreateSession.ts     # Session creation
├── stores/
│   ├── createEnhancedStore.ts  # Factory: zustand + immer + persist
│   └── sessionsStore.ts        # Sessions state + localStorage persist
└── types/
    └── session.ts              # Session type + Zod schema
```

### Sprint 2+ (with Turso, Auth)

```
packages/core/src/
├── index.ts
├── core.ts
├── reactCore.ts
├── clients/
│   ├── sessionsClient.ts
│   ├── userClient.ts
│   └── authClient.ts
├── hooks/
│   ├── useSessions.ts
│   ├── useCreateSession.ts
│   ├── useAuth.ts
│   └── useCurrentUser.ts
├── stores/
│   ├── createEnhancedStore.ts
│   ├── sessionsStore.ts
│   └── authStore.ts
├── services/
│   ├── sessionsService.ts
│   └── userService.ts
├── adapters/
│   ├── turso.ts
│   └── auth.ts
├── db/
│   └── schema.ts
└── types/
    ├── session.ts
    └── user.ts
```

---

## MVP → Production Progression

The architecture is designed so the **public API stays the same** as the backend changes:

| Layer    | MVP (Sprint 1)                 | Production (Sprint 2+)                 |
| -------- | ------------------------------ | -------------------------------------- |
| Clients  | Owns store, writes directly    | Owns store + delegates to services     |
| Stores   | Persisted to localStorage      | Local cache, blended with server state |
| Hooks    | Subscribe to store             | Blend store (instant) + query (live)   |
| Services | Not needed                     | Async writes, React Query, cache mgmt  |
| Adapters | Not needed (persist = storage) | Turso, NextAuth                        |

**The hooks return `{ data, isLoading }` in both cases.** Components never know the difference.

---

## Summary

1. **Layered singleton:** clients → stores/services → adapters
2. **Factory functions:** `createSessionsClient()`, `createEnhancedStore()` — not classes
3. **Stores are first-class:** Zustand + immer + persist. Clients own their stores
4. **Hooks consume stores:** `useStore(store, selector)` for reactive subscriptions
5. **Dependency rules:** Services never import services. Clients never import clients
6. **No leakage:** No "zustand", "turso", "drizzle" in public API
7. **MVP → Production:** Same public API, swap the persistence layer
8. **File structure:** Clear separation of clients/hooks/stores/services/adapters

**Golden Rule:** If the app imports anything other than `@groundwork/core`, you've violated the architecture.
