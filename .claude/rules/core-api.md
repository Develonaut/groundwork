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

| Domain         | Sprint | Responsibility             | Key Methods                                                 |
| -------------- | ------ | -------------------------- | ----------------------------------------------------------- |
| `core.entries` | MVP    | Daily journal entries      | `store`, `getOrCreate(date)`, `update()`, `get()`, `list()` |
| `core.user`    | 2      | User profile & preferences | `meQueryOptions()`, `update()`                              |
| `core.auth`    | 2      | Auth state & actions       | `store`, `useIsAuthenticated()`, `useSignOut()`             |

**Usage:**

```tsx
import { core } from "@groundwork/core";

function TodayPage() {
  const entry = useEntry(today()); // hook subscribes to core.entries.store
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

**Example — Entries Store (MVP):**

```ts
// packages/core/src/stores/entriesStore.ts
import { createEnhancedStore } from "./createEnhancedStore";
import type { Entry } from "../types/entry";

type EntriesStoreState = {
  entries: Record<string, Entry>; // keyed by date (YYYY-MM-DD)
  upsert: (entry: Entry) => void;
  remove: (date: string) => void;
};

export const entriesStore = createEnhancedStore<EntriesStoreState>({
  persist: {
    name: "groundwork-entries",
    partialize: (state) => ({ entries: state.entries }),
  },
})((set) => ({
  entries: {},

  upsert: (entry) =>
    set((state) => {
      state.entries[entry.date] = entry; // immer draft mutation
    }),

  remove: (date) =>
    set((state) => {
      delete state.entries[date];
    }),
}));
```

**Key design:**

- `Record<string, Entry>` keyed by date (YYYY-MM-DD) for O(1) lookup
- `partialize` ensures only entries are persisted (not ephemeral UI state)
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

**Example — Entries Client (MVP):**

```ts
// packages/core/src/clients/entriesClient.ts
import { entriesStore } from "../stores/entriesStore";
import { entrySchema } from "../types/entry";

export function createEntriesClient() {
  return {
    store: entriesStore,

    getOrCreate: (date: string) => {
      const existing = entriesStore.getState().entries[date];
      if (existing) return existing;

      const entry = entrySchema.parse({
        id: crypto.randomUUID(),
        date,
        focus: "",
        content: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      entriesStore.getState().upsert(entry);
      return entry;
    },

    update: (date: string, data: { focus?: string; content?: string }) => {
      const entry = entriesStore.getState().entries[date];
      if (!entry) return null;
      const updated = { ...entry, ...data, updatedAt: new Date().toISOString() };
      entriesStore.getState().upsert(updated);
      return updated;
    },

    get: (date: string) => {
      return entriesStore.getState().entries[date] ?? null;
    },

    list: () => {
      return Object.values(entriesStore.getState().entries).sort((a, b) =>
        b.date.localeCompare(a.date),
      );
    },
  } as const;
}
```

**Key pattern:**

- Client wraps store with domain logic (validation, auto-create)
- `getOrCreate` — today's entry always exists, no explicit "create" step
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

**Example — useEntry:**

```ts
// packages/core/src/hooks/useEntry.ts
import { useStore } from "zustand";
import { entriesStore } from "../stores/entriesStore";

export function useEntry(date: string) {
  const entry = useStore(entriesStore, (s) => s.entries[date] ?? null);
  return { data: entry, isLoading: false };
}
```

**Example — useEntries:**

```ts
// packages/core/src/hooks/useEntries.ts
import { useStore } from "zustand";
import { useMemo } from "react";
import { entriesStore } from "../stores/entriesStore";

export function useEntries() {
  const entries = useStore(entriesStore, (s) => s.entries);

  const data = useMemo(
    () => Object.values(entries).sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  return { data, isLoading: false };
}
```

**Example — useUpdateEntry:**

```ts
// packages/core/src/hooks/useUpdateEntry.ts
import { useCallback } from "react";
import { core } from "../reactCore";

export function useUpdateEntry() {
  return useCallback((date: string, data: { focus?: string; content?: string }) => {
    return core.entries.update(date, data);
  }, []);
}
```

**Key pattern:**

- `useEntry(date)` subscribes to a single entry by date
- `useEntries()` subscribes to all entries, sorted newest first, returns `{ data, isLoading }`
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
import { createEntriesClient } from "./clients/entriesClient";

function createCore() {
  return {
    entries: createEntriesClient(),
  };
}

// Singleton — created once, imported everywhere
export const core = createCore();
```

```ts
// packages/core/src/reactCore.ts
import { core as imperativeCore } from "./core";
import { useEntry } from "./hooks/useEntry";
import { useEntries } from "./hooks/useEntries";
import { useUpdateEntry } from "./hooks/useUpdateEntry";

export const core = {
  ...imperativeCore,
  entries: {
    ...imperativeCore.entries,
    useEntry,
    useEntries,
    useUpdateEntry,
  },
};
```

```ts
// packages/core/src/index.ts
export { core } from "./reactCore";
export { createEnhancedStore } from "./stores/createEnhancedStore";
export type { Entry } from "./types/entry";
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
│   └── entriesClient.ts        # Entries client (owns store)
├── hooks/
│   ├── useEntry.ts             # Reactive single entry by date
│   ├── useEntries.ts           # Reactive entry list
│   └── useUpdateEntry.ts       # Entry update
├── stores/
│   ├── createEnhancedStore.ts  # Factory: zustand + immer + persist
│   └── entriesStore.ts         # Entries state + localStorage persist
└── types/
    └── entry.ts                # Entry type + Zod schema
```

### Sprint 2+ (with Turso, Auth)

```
packages/core/src/
├── index.ts
├── core.ts
├── reactCore.ts
├── clients/
│   ├── entriesClient.ts
│   ├── userClient.ts
│   └── authClient.ts
├── hooks/
│   ├── useEntry.ts
│   ├── useEntries.ts
│   ├── useUpdateEntry.ts
│   ├── useAuth.ts
│   └── useCurrentUser.ts
├── stores/
│   ├── createEnhancedStore.ts
│   ├── entriesStore.ts
│   └── authStore.ts
├── services/
│   ├── entriesService.ts
│   └── userService.ts
├── adapters/
│   ├── turso.ts
│   └── auth.ts
├── db/
│   └── schema.ts
└── types/
    ├── entry.ts
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

**The domain shifts but the pattern holds:**

- MVP: `core.entries.getOrCreate(today)` → Zustand store → localStorage
- Sprint 2: `core.entries.getOrCreate(today)` → Zustand store + React Query → Turso

---

## Summary

1. **Layered singleton:** clients → stores/services → adapters
2. **Factory functions:** `createEntriesClient()`, `createEnhancedStore()` — not classes
3. **Stores are first-class:** Zustand + immer + persist. Clients own their stores
4. **Hooks consume stores:** `useStore(store, selector)` for reactive subscriptions
5. **Dependency rules:** Services never import services. Clients never import clients
6. **No leakage:** No "zustand", "turso", "drizzle" in public API
7. **MVP → Production:** Same public API, swap the persistence layer
8. **File structure:** Clear separation of clients/hooks/stores/services/adapters
9. **Day-based model:** One entry per day, `getOrCreate(date)` — no explicit "create" step

**Golden Rule:** If the app imports anything other than `@groundwork/core`, you've violated the architecture.
