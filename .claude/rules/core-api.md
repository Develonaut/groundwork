# Core API Architecture

**Package:** `@groundwork/core`
**Last Updated:** April 13, 2026

---

## Overview

`@groundwork/core` is the transport-agnostic data layer for Groundwork. It abstracts all database operations behind a clean, domain-driven API so that UI code never knows whether it's talking to Turso, local SQLite, or any future backend.

**Key Principle:** The app imports from `@groundwork/core`. Never from `drizzle`, `@libsql/client`, or any database-specific package.

---

## Architecture Pattern: Layered Singleton

```
┌─────────────────────────────────────────┐
│  Apps (Next.js)                         │
│  import { core } from '@groundwork/core'       │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Clients (Public API)                   │
│  - core.sessions                        │
│  - core.user                            │
│  - core.auth                            │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──────┐   ┌──────▼────┐
│ Queries  │   │ Services  │
│ (reads)  │   │ (writes)  │
└───┬──────┘   └──────┬────┘
    │                 │
    └────────┬────────┘
             │
┌────────────▼────────────────────────────┐
│  Adapters (Backend-specific)            │
│  - TursoAdapter                         │
│  - QueryClient (React Query)            │
│  - AuthAdapter (NextAuth)               │
└─────────────────────────────────────────┘
```

---

## 3-Domain Public API

Groundwork has 3 core domains (simplified from bnto's 7):

| Domain          | Responsibility                   | Key Methods                                                       |
| --------------- | -------------------------------- | ----------------------------------------------------------------- |
| `core.sessions` | Journal entries (CRUD, timeline) | `listQueryOptions()`, `create()`, `update()`, `remove()`          |
| `core.user`     | User profile & preferences       | `meQueryOptions()`, `useCurrentUser()`, `update()`                |
| `core.auth`     | Auth state & actions             | `useReady()`, `useIsAuthenticated()`, `useAuth()`, `useSignOut()` |

**Usage Example:**

```tsx
import { core } from "@groundwork/core";

function SessionList() {
  const { data: sessions } = useQuery(core.sessions.listQueryOptions());
  // ...
}
```

---

## Layer Responsibilities

### 1. Clients (Public API)

**Location:** `packages/core/src/clients/`

Clients are the **only public API**. They compose queries and services via constructor injection.

**Rules:**

- Export domain-specific methods (e.g., `sessions.create()`, `user.meQueryOptions()`)
- Never call adapters directly
- Never import other clients
- Use constructor injection for dependencies

**Example:**

```ts
// packages/core/src/clients/sessions.ts
import type { SessionsQueries } from "../queries/sessions";
import type { SessionsService } from "../services/sessions";

export class SessionsClient {
  constructor(
    private queries: SessionsQueries,
    private service: SessionsService,
  ) {}

  listQueryOptions() {
    return this.queries.listQueryOptions();
  }

  async create(data: CreateSessionInput) {
    return this.service.create(data);
  }
}
```

---

### 2. Queries (Read Path)

**Location:** `packages/core/src/queries/`

Queries handle all **read operations**. They return React Query `queryOptions` objects.

**Rules:**

- Never mutate data
- Return `queryOptions` from `@tanstack/react-query`
- Use `select` for data transformations (never transform outside)
- Can call adapters directly (e.g., `TursoAdapter`)

**Example:**

```ts
// packages/core/src/queries/sessions.ts
import { queryOptions } from "@tanstack/react-query";
import type { TursoAdapter } from "../adapters/turso";

export class SessionsQueries {
  constructor(private db: TursoAdapter) {}

  listQueryOptions() {
    return queryOptions({
      queryKey: ["sessions", "list"],
      queryFn: () => this.db.sessions.findMany(),
      select: (data) => {
        // Transform data here, not in components
        return data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },
    });
  }
}
```

---

### 3. Services (Write Path)

**Location:** `packages/core/src/services/`

Services handle all **write operations** (create, update, delete). They return plain Promises.

**Rules:**

- Never import other services
- Never import clients
- Can call adapters directly
- Handle validation and business logic
- Invalidate React Query cache after mutations

**Example:**

```ts
// packages/core/src/services/sessions.ts
import type { TursoAdapter } from "../adapters/turso";
import type { QueryClient } from "@tanstack/react-query";

export class SessionsService {
  constructor(
    private db: TursoAdapter,
    private queryClient: QueryClient,
  ) {}

  async create(data: CreateSessionInput) {
    const session = await this.db.sessions.insert(data);

    // Invalidate cache
    await this.queryClient.invalidateQueries({
      queryKey: ["sessions"],
    });

    return session;
  }
}
```

---

### 4. Adapters (Backend-Specific)

**Location:** `packages/core/src/adapters/`

Adapters are the **only layer** that knows about the backend (Turso, Drizzle, NextAuth, etc.).

**Rules:**

- One adapter per backend concern
- Export typed interfaces, not implementation details
- No Drizzle/LibSQL/NextAuth imports leak to upper layers

**Example:**

```ts
// packages/core/src/adapters/turso.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../db/schema";

export class TursoAdapter {
  private db: ReturnType<typeof drizzle>;

  constructor(url: string, authToken: string) {
    const client = createClient({ url, authToken });
    this.db = drizzle(client, { schema });
  }

  get sessions() {
    return {
      findMany: () => this.db.query.sessions.findMany(),
      insert: (data: InsertSession) => this.db.insert(schema.sessions).values(data).returning(),
    };
  }
}
```

---

## Dependency Rules

### Services NEVER Import Other Services

**❌ WRONG:**

```ts
// services/sessions.ts
import { UserService } from "./user"; // NEVER DO THIS

export class SessionsService {
  constructor(private userService: UserService) {}
}
```

**✅ CORRECT:**

```ts
// services/sessions.ts
export class SessionsService {
  constructor(private db: TursoAdapter) {}

  async create(data: CreateSessionInput) {
    // Call adapter directly
    return this.db.sessions.insert(data);
  }
}
```

**Rationale:** Services are domain boundaries. Cross-service calls create coupling and circular dependency risks.

---

### Clients Compose Services via Constructor Injection

**✅ CORRECT:**

```ts
// clients/sessions.ts
export class SessionsClient {
  constructor(
    private queries: SessionsQueries,
    private service: SessionsService,
  ) {}

  listQueryOptions() {
    return this.queries.listQueryOptions();
  }

  create(data: CreateSessionInput) {
    return this.service.create(data);
  }
}
```

---

### Namespace Exports Only

**❌ WRONG:**

```ts
// app/page.tsx
import { SessionsClient } from "@groundwork/core/clients/sessions";
```

**✅ CORRECT:**

```ts
// app/page.tsx
import { core } from "@groundwork/core";

const sessions = core.sessions.listQueryOptions();
```

**Rationale:** The namespace `core` is the public API. Internal structure can change without breaking imports.

---

## No Implementation Detail Leakage

### Rule: No Technology Names in Public API

**❌ WRONG:**

```ts
core.sessions.getTursoSessions();
core.sessions.drizzleQuery();
core.user.nextAuthProfile();
```

**✅ CORRECT:**

```ts
core.sessions.listQueryOptions();
core.sessions.getQueryOptions(id);
core.user.meQueryOptions();
```

**Rationale:** If we swap Turso for Postgres or NextAuth for another auth provider, the API shouldn't change.

---

### Rule: Domain Concepts Only

Method names should reflect **what** they do, not **how** they do it.

**Examples:**

- `core.sessions.create()` ← domain concept
- `core.user.meQueryOptions()` ← domain concept
- `core.auth.useSignOut()` ← domain action

---

## Lazy Infrastructure

Infrastructure (database connections, auth clients) is initialized **lazily** on first use.

**Why:** Server-side rendering and build-time code execution shouldn't require live credentials.

**Example:**

```ts
// packages/core/src/index.ts
let _core: Core | null = null;

export const core = new Proxy({} as Core, {
  get(_, prop) {
    if (!_core) {
      _core = createCore();
    }
    return _core[prop as keyof Core];
  },
});
```

**Benefit:** Import `core` anywhere without triggering initialization until actually used.

---

## Auth Boundary (NextAuth)

Groundwork uses **NextAuth.js** for authentication.

### Auth Adapter

**Location:** `packages/core/src/adapters/auth.ts`

```ts
import { auth } from "next-auth";

export class AuthAdapter {
  async getCurrentUserId() {
    const session = await auth();
    return session?.user?.id ?? null;
  }

  async getCurrentUser() {
    const session = await auth();
    return session?.user ?? null;
  }
}
```

### Auth Client

**Location:** `packages/core/src/clients/auth.ts`

```ts
import { useSession, signOut } from "next-auth/react";

export class AuthClient {
  useReady() {
    const { status } = useSession();
    return { isLoaded: status !== "loading" };
  }

  useIsAuthenticated() {
    const { status } = useSession();
    return status === "authenticated";
  }

  useAuth() {
    return useSession();
  }

  useSignOut() {
    return signOut;
  }
}
```

**Usage:**

```tsx
import { core } from "@groundwork/core";

function Header() {
  const isAuthenticated = core.auth.useIsAuthenticated();
  const signOut = core.auth.useSignOut();

  if (!isAuthenticated) return null;

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

---

## React Query Rules

### Always Use `select` for Data Transforms

**❌ WRONG:**

```tsx
const { data } = useQuery(core.sessions.listQueryOptions())
const sorted = data?.sort((a, b) => ...) // Transform in component
```

**✅ CORRECT:**

```ts
// queries/sessions.ts
listQueryOptions() {
  return queryOptions({
    queryKey: ['sessions', 'list'],
    queryFn: () => this.db.sessions.findMany(),
    select: (data) => {
      return data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  })
}
```

**Rationale:** Transforms in `select` are memoized and don't re-run on every render.

---

### No Transforms Outside Select

All data shaping happens in the `select` function, not in components.

**Benefits:**

- Memoization (only re-runs when data changes)
- Separation of concerns (components just render)
- Testability (query logic isolated from UI)

---

## File Structure

```
packages/core/src/
├── index.ts                    # Public exports: { core }
├── clients/
│   ├── sessions.ts             # SessionsClient
│   ├── user.ts                 # UserClient
│   └── auth.ts                 # AuthClient
├── queries/
│   ├── sessions.ts             # SessionsQueries
│   └── user.ts                 # UserQueries
├── services/
│   ├── sessions.ts             # SessionsService
│   └── user.ts                 # UserService
├── adapters/
│   ├── turso.ts                # TursoAdapter (Drizzle + LibSQL)
│   └── auth.ts                 # AuthAdapter (NextAuth)
├── db/
│   ├── schema.ts               # Drizzle schema
│   └── client.ts               # Database client factory
└── types/
    ├── session.ts              # Session domain types
    └── user.ts                 # User domain types
```

---

## Example: Full Stack for a Domain

### 1. Define Schema

```ts
// db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

### 2. Create Types

```ts
// types/session.ts
import type { sessions } from "../db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Session = InferSelectModel<typeof sessions>;
export type InsertSession = InferInsertModel<typeof sessions>;
export type UpdateSession = Partial<InsertSession>;
```

### 3. Build Adapter Methods

```ts
// adapters/turso.ts
export class TursoAdapter {
  get sessions() {
    return {
      findMany: () => this.db.query.sessions.findMany(),
      findById: (id: string) =>
        this.db.query.sessions.findFirst({ where: eq(schema.sessions.id, id) }),
      insert: (data: InsertSession) => this.db.insert(schema.sessions).values(data).returning(),
      update: (id: string, data: UpdateSession) =>
        this.db.update(schema.sessions).set(data).where(eq(schema.sessions.id, id)).returning(),
    };
  }
}
```

### 4. Build Queries

```ts
// queries/sessions.ts
export class SessionsQueries {
  constructor(private db: TursoAdapter) {}

  listQueryOptions() {
    return queryOptions({
      queryKey: ["sessions", "list"],
      queryFn: () => this.db.sessions.findMany(),
      select: (data) => data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    });
  }

  getQueryOptions(id: string) {
    return queryOptions({
      queryKey: ["sessions", "detail", id],
      queryFn: () => this.db.sessions.findById(id),
    });
  }
}
```

### 5. Build Services

```ts
// services/sessions.ts
export class SessionsService {
  constructor(
    private db: TursoAdapter,
    private queryClient: QueryClient,
  ) {}

  async create(data: InsertSession) {
    const session = await this.db.sessions.insert(data);
    await this.queryClient.invalidateQueries({ queryKey: ["sessions"] });
    return session;
  }

  async update(id: string, data: UpdateSession) {
    const session = await this.db.sessions.update(id, data);
    await this.queryClient.invalidateQueries({ queryKey: ["sessions"] });
    return session;
  }
}
```

### 6. Build Client

```ts
// clients/sessions.ts
export class SessionsClient {
  constructor(
    private queries: SessionsQueries,
    private service: SessionsService,
  ) {}

  listQueryOptions() {
    return this.queries.listQueryOptions();
  }

  getQueryOptions(id: string) {
    return this.queries.getQueryOptions(id);
  }

  create(data: InsertSession) {
    return this.service.create(data);
  }

  update(id: string, data: UpdateSession) {
    return this.service.update(id, data);
  }
}
```

### 7. Wire Up in Core

```ts
// index.ts
function createCore() {
  const db = new TursoAdapter(process.env.TURSO_URL!, process.env.TURSO_AUTH_TOKEN!);
  const queryClient = new QueryClient();

  const sessionsQueries = new SessionsQueries(db);
  const sessionsService = new SessionsService(db, queryClient);
  const sessionsClient = new SessionsClient(sessionsQueries, sessionsService);

  return {
    sessions: sessionsClient,
    // ... other clients
  };
}

export const core = /* lazy proxy */ createCore();
```

### 8. Use in App

```tsx
// app/sessions/page.tsx
import { core } from "@groundwork/core";

export default function SessionsPage() {
  const { data: sessions } = useQuery(core.sessions.listQueryOptions());

  return (
    <div>
      {sessions?.map((session) => (
        <div key={session.id}>{session.content}</div>
      ))}
    </div>
  );
}
```

---

## Summary

1. **Layered singleton:** clients → queries/services → adapters
2. **3 domains:** sessions, user, auth
3. **Dependency rules:** Services never import services; clients compose via constructor injection
4. **No leakage:** No "turso", "drizzle", "next-auth" in public API
5. **Lazy infrastructure:** Database/auth initialized on first use
6. **Auth boundary:** NextAuth adapter + auth client
7. **React Query:** Always use `select` for transforms
8. **File structure:** Clear separation of clients/queries/services/adapters

**Golden Rule:** If the app imports anything other than `@groundwork/core`, you've violated the architecture.
