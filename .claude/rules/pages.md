# Page Composition Standards

**Purpose:** Define patterns for composing Next.js App Router pages.

**Key Principles:**

1. Pages are readable blueprints
2. Leaf components, not branches
3. Generic shell + domain leaves
4. Self-fetching components
5. Compose in the page
6. Server Components by default

---

## 1. Pages Are Readable Blueprints

**Rule:** A page should read like a visual hierarchy. Minimal logic.

### Example: Wrong (logic-heavy page)

```tsx
// ❌ app/sessions/page.tsx
export default async function SessionsPage() {
  const sessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, auth.userId),
    orderBy: desc(sessions.date),
  });

  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const month = format(session.date, "MMMM yyyy");
      if (!acc[month]) acc[month] = [];
      acc[month].push(session);
      return acc;
    },
    {} as Record<string, Session[]>,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {Object.entries(groupedSessions).map(([month, sessions]) => (
        <div key={month}>
          <h2>{month}</h2>
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Example: Right (blueprint page)

```tsx
// ✅ app/sessions/page.tsx
export default function SessionsPage() {
  return (
    <PageShell>
      <PageHeader>
        <PageTitle>Sessions</PageTitle>
        <NewSessionButton />
      </PageHeader>
      <SessionList />
    </PageShell>
  );
}
```

**Why:** The page is a visual blueprint. All logic is pushed into components.

---

## 2. Leaf Components, Not Branches

**Rule:** Pages compose leaf components. Leaf components don't compose other domain components.

### Analogy: Tree Structure

```
Page (root)
├── PageShell (generic)
├── PageHeader (generic)
│   ├── PageTitle (generic)
│   └── NewSessionButton (leaf)
└── SessionList (leaf)
    └── SessionCard (leaf)
```

**Leaf components:**

- Fetch their own data
- Render their own UI
- Don't compose other domain components

**Generic components:**

- Layout primitives (PageShell, PageHeader, PageTitle)
- No business logic

### Example: SessionList (leaf)

```tsx
// ✅ components/session-list.tsx
"use client";

import { useSessions } from "@groundwork/core";
import { SessionCard } from "./session-card";

export function SessionList() {
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) return <SessionListSkeleton />;
  if (!sessions?.length) return <EmptyState />;

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => (
        <SessionCard key={s.id} sessionId={s.id} />
      ))}
    </div>
  );
}
```

**Why:** Keeps pages clean. Components are self-contained and testable.

---

## 3. Generic Shell + Domain Leaves

**Rule:** Use generic layout components + domain leaf components.

### Generic Layout Components

```tsx
// ✅ components/layout/page-shell.tsx
export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>;
}

// ✅ components/layout/page-header.tsx
export function PageHeader({ children }: { children: React.ReactNode }) {
  return <header className="flex items-center justify-between mb-8">{children}</header>;
}

// ✅ components/layout/page-title.tsx
export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-4xl font-bold tracking-tight">{children}</h1>;
}
```

### Domain Leaf Components

```tsx
// ✅ components/session-list.tsx (domain leaf)
// ✅ components/session-card.tsx (domain leaf)
// ✅ components/new-session-button.tsx (domain leaf)
```

### Page Composition

```tsx
// ✅ app/sessions/page.tsx
import { PageShell, PageHeader, PageTitle } from "@/components/layout";
import { SessionList, NewSessionButton } from "@/components/session";

export default function SessionsPage() {
  return (
    <PageShell>
      <PageHeader>
        <PageTitle>Sessions</PageTitle>
        <NewSessionButton />
      </PageHeader>
      <SessionList />
    </PageShell>
  );
}
```

**Why:** Generic components are reusable. Domain components are self-contained.

---

## 4. Self-Fetching Components

**Rule:** Components fetch their own data. Don't pass data from page.

### Example: Wrong (prop drilling)

```tsx
// ❌ app/sessions/page.tsx
export default async function SessionsPage() {
  const sessions = await getSessions(); // Fetched in page

  return (
    <PageShell>
      <SessionList sessions={sessions} /> {/* Passed as prop */}
    </PageShell>
  );
}
```

### Example: Right (self-fetching)

```tsx
// ✅ app/sessions/page.tsx
export default function SessionsPage() {
  return (
    <PageShell>
      <SessionList /> {/* Fetches its own data */}
    </PageShell>
  );
}

// ✅ components/session-list.tsx
("use client");

import { useSessions } from "@groundwork/core";

export function SessionList() {
  const { data: sessions } = useSessions(); // Self-fetching
  // ...
}
```

**Why:** Colocation. Components are self-contained and reusable.

---

## 5. Compose in the Page

**Rule:** Compose Radix primitives in the page, not in wrapper components.

### Example: Wrong (wrapper component)

```tsx
// ❌ components/session-dialog.tsx
export function SessionDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ❌ app/sessions/page.tsx
<SessionDialog>
  <SessionForm />
</SessionDialog>;
```

### Example: Right (compose in page)

```tsx
// ✅ app/sessions/page.tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionForm } from "@/components/session-form";

export default function SessionsPage() {
  return (
    <PageShell>
      <PageHeader>
        <PageTitle>Sessions</PageTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Session</DialogTitle>
            </DialogHeader>
            <SessionForm />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <SessionList />
    </PageShell>
  );
}
```

**Why:** Flexibility. Avoid prop explosion on wrapper components.

**Exception:** If you use the SAME composition in 3+ places, extract it.

---

## 6. Server Components by Default

**Rule:** Pages and components are Server Components by default.

**Use Client Components when:**

- Uses hooks (useState, useEffect, custom hooks)
- Uses event handlers (onClick, onChange)
- Uses browser APIs (window, localStorage)
- Uses Context

### Example: Page with mixed components

```tsx
// ✅ app/sessions/page.tsx (Server Component)
import { PageShell, PageHeader, PageTitle } from "@/components/layout";
import { SessionList } from "@/components/session-list"; // Client Component
import { NewSessionButton } from "@/components/new-session-button"; // Client Component

export default function SessionsPage() {
  return (
    <PageShell>
      <PageHeader>
        <PageTitle>Sessions</PageTitle>
        <NewSessionButton />
      </PageHeader>
      <SessionList />
    </PageShell>
  );
}
```

**Why:** Server Components are faster. Only use Client Components when needed.

---

## 7. Page Metadata

**Rule:** Export metadata from pages for SEO.

### Example: Static metadata

```tsx
// ✅ app/sessions/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessions | Groundwork",
  description: "View and manage your training sessions",
};

export default function SessionsPage() {
  // ...
}
```

### Example: Dynamic metadata

```tsx
// ✅ app/sessions/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const session = await getSession(params.id);

  return {
    title: `${session.title} | Groundwork`,
    description: session.notes,
  };
}

export default function SessionPage({ params }: { params: { id: string } }) {
  // ...
}
```

---

## 8. Loading States

**Rule:** Use `loading.tsx` for route-level loading states.

### Example: Route loading

```tsx
// ✅ app/sessions/loading.tsx
export default function SessionsLoading() {
  return (
    <PageShell>
      <PageHeader>
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      </PageHeader>
      <SessionListSkeleton />
    </PageShell>
  );
}
```

**Component-level loading:** Handle inside self-fetching components.

---

## 9. Error Boundaries

**Rule:** Use `error.tsx` for route-level error boundaries.

### Example: Route error

```tsx
// ✅ app/sessions/error.tsx
"use client";

export default function SessionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </PageShell>
  );
}
```

---

## 10. Page File Structure

```tsx
// ✅ Standard page structure

// 1. Imports
import type { Metadata } from "next";
import { PageShell, PageHeader, PageTitle } from "@/components/layout";
import { SessionList, NewSessionButton } from "@/components/session";

// 2. Metadata
export const metadata: Metadata = {
  title: "Sessions | Groundwork",
  description: "View and manage your training sessions",
};

// 3. Page component
export default function SessionsPage() {
  return (
    <PageShell>
      <PageHeader>
        <PageTitle>Sessions</PageTitle>
        <NewSessionButton />
      </PageHeader>
      <SessionList />
    </PageShell>
  );
}
```

**Size Limit:** Page files should be < 100 lines. If larger, extract components.

---

## Summary Checklist

Before creating a page, ask:

- [ ] Is it a readable blueprint? (Minimal logic)
- [ ] Does it compose leaf components? (Not branches)
- [ ] Does it use generic shell + domain leaves? (Separation of concerns)
- [ ] Do components self-fetch? (No prop drilling)
- [ ] Are primitives composed in the page? (Not wrapped)
- [ ] Is it a Server Component by default? ('use client' only when needed)
- [ ] Does it export metadata? (SEO)
- [ ] Does it have loading.tsx? (Loading states)
- [ ] Does it have error.tsx? (Error boundaries)
- [ ] Is it < 100 lines? (Extract if larger)
