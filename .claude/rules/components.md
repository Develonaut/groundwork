# Component Standards

**Purpose:** Define component architecture patterns for Groundwork UI.

**Key Principles:**

1. Start inline, extract when earned
2. Self-fetching components
3. Compound composition with flat named exports
4. Primitives as base, composition in consuming code
5. CSS-first interaction states

---

## 1. Start Inline, Extract When Earned

**Rule:** Don't create a new component until you need it in 2+ places.

**Why:** Premature abstraction creates complexity. Let the API emerge from real usage.

### Example: Wrong (premature extraction)

```tsx
// ❌ components/session-card.tsx (used in ONE place)
export function SessionCard({ session }: { session: Session }) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{session.title}</h3>
      <p>{session.date}</p>
    </div>
  );
}

// app/sessions/page.tsx
import { SessionCard } from "@/components/session-card";
export default function SessionsPage() {
  return sessions.map((s) => <SessionCard key={s.id} session={s} />);
}
```

### Example: Right (inline first)

```tsx
// ✅ app/sessions/page.tsx
export default function SessionsPage() {
  return sessions.map((s) => (
    <div key={s.id} className="rounded-lg border p-4">
      <h3>{s.title}</h3>
      <p>{s.date}</p>
    </div>
  ));
}
```

When you need it in a second place, THEN extract:

```tsx
// ✅ components/session-card.tsx (now used in 2+ places)
export function SessionCard({ session }: { session: Session }) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{session.title}</h3>
      <p>{session.date}</p>
    </div>
  );
}
```

---

## 2. Self-Fetching Components

**Rule:** Components fetch their own data using `@groundwork/core` hooks.

**Why:** Colocation improves readability and reduces prop drilling.

### Example: SessionCard

```tsx
// ✅ components/session-card.tsx
"use client";

import { useSession } from "@groundwork/core";

export function SessionCard({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading) return <SessionCardSkeleton />;
  if (!session) return null;

  return (
    <div className="rounded-lg border p-4">
      <h3>{session.title}</h3>
      <p>{session.date}</p>
    </div>
  );
}

function SessionCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded" />
      <div className="h-4 w-24 bg-muted rounded mt-2" />
    </div>
  );
}
```

---

## 3. Sizing Defaults

**Rule:** Components default to full width/height of their container.

**Why:** Composition. Parent controls layout, child fills space.

### Example: SessionList

```tsx
// ✅ components/session-list.tsx
export function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="flex flex-col gap-4">
      {" "}
      {/* Full width by default */}
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} />
      ))}
    </div>
  );
}

// Usage in page
<div className="max-w-2xl mx-auto">
  {" "}
  {/* Parent controls width */}
  <SessionList sessions={sessions} />
</div>;
```

**Exception:** Dialogs, popovers, tooltips have intrinsic sizing.

---

## 4. Hook Conventions

**Rule:** One hook per component domain. Mirror component API.

### Naming Pattern

```
Component:  SessionCard
Hook:       useSessionCard
```

### Example: useSessionCard

```tsx
// ✅ components/session-card.tsx
"use client";

import { useSession } from "@groundwork/core";

interface UseSessionCardProps {
  sessionId: string;
}

export function useSessionCard({ sessionId }: UseSessionCardProps) {
  const { data: session, isLoading } = useSession(sessionId);

  return {
    session,
    isLoading,
    isEmpty: !session,
  };
}

export function SessionCard({ sessionId }: { sessionId: string }) {
  const { session, isLoading, isEmpty } = useSessionCard({ sessionId });

  if (isLoading) return <SessionCardSkeleton />;
  if (isEmpty) return null;

  return (
    <div className="rounded-lg border p-4">
      <h3>{session.title}</h3>
      <p>{session.date}</p>
    </div>
  );
}
```

---

## 5. Compound Composition (Flat Named Exports)

**Rule:** Export compound components as flat named exports. NO dot notation.

**Why:**

- Tree-shakeable
- Explicit imports
- Better autocomplete
- Avoids namespace conflicts

### Example: Wrong (dot notation)

```tsx
// ❌ components/session.tsx
export const Session = {
  Card: SessionCard,
  List: SessionList,
  Header: SessionHeader,
}

// Usage
import { Session } from '@/components/session'
<Session.Card /> {/* Hard to tree-shake, unclear imports */}
```

### Example: Right (flat exports)

```tsx
// ✅ components/session.tsx
export { SessionCard } from './session-card'
export { SessionList } from './session-list'
export { SessionHeader } from './session-header'

// Usage
import { SessionCard, SessionList } from '@/components/session'
<SessionCard />
<SessionList />
```

---

## 6. Primitives as Base

**Rule:** Use Radix UI primitives. Compose in consuming code, not in wrapper components.

**Why:** Flexibility. Avoid "prop explosion" on wrapper components.

### Example: Wrong (wrapper with prop explosion)

```tsx
// ❌ components/session-dialog.tsx
export function SessionDialog({
  trigger,
  title,
  description,
  children,
  onOpenChange,
  defaultOpen,
  // ... 20 more props
}: SessionDialogProps) {
  return (
    <Dialog defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Example: Right (compose in consuming code)

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

export default function SessionsPage() {
  return (
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
  );
}
```

**Exception:** If you use the SAME composition in 3+ places, extract it.

---

## 7. CSS-First Interaction States

**Rule:** Use CSS for hover/focus/active states. JavaScript only when CSS can't do it.

### Example: SessionCard hover

```tsx
// ✅ components/session-card.tsx
export function SessionCard({ session }: { session: Session }) {
  return (
    <div
      className="
      rounded-lg border p-4
      transition-colors
      hover:bg-muted
      focus-within:ring-2 focus-within:ring-primary
    "
    >
      <h3>{session.title}</h3>
      <p>{session.date}</p>
    </div>
  );
}
```

**Use JavaScript for:** Tooltips, popovers, complex animations.

---

## 8. Component File Structure

```tsx
// ✅ Standard component structure

"use client"; // If needed

// 1. Imports
import { useSession } from "@groundwork/core";
import { cn } from "@/lib/utils";

// 2. Types
interface SessionCardProps {
  sessionId: string;
  className?: string;
}

// 3. Hook (if needed)
export function useSessionCard({ sessionId }: { sessionId: string }) {
  // ...
}

// 4. Main component
export function SessionCard({ sessionId, className }: SessionCardProps) {
  // ...
}

// 5. Sub-components (if small and co-located)
function SessionCardSkeleton() {
  // ...
}
```

**Size Limits:**

- Component file: < 250 lines
- Component function: < 50 lines
- Hook function: < 30 lines

If you exceed these, split into multiple files.

---

## 9. Utility Function: cn()

**Rule:** Use shadcn/ui's `cn()` utility for className merging.

```tsx
// ✅ lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn("base-classes", isActive && "active-classes", className)} />;
```

---

## 10. Server vs Client Components

**Default:** Server Component

**Use Client Component when:**

- Uses hooks (useState, useEffect, custom hooks)
- Uses event handlers (onClick, onChange)
- Uses browser APIs (window, localStorage)
- Uses Context

```tsx
// ✅ Server Component (default)
export function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div>
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} />
      ))}
    </div>
  );
}

// ✅ Client Component (when needed)
("use client");

export function SessionCard({ session }: { session: Session }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return <div onClick={() => setIsExpanded(!isExpanded)}>{/* ... */}</div>;
}
```

---

## Summary Checklist

Before creating a component, ask:

- [ ] Is it used in 2+ places? (If no, keep inline)
- [ ] Does it fetch its own data? (Use `@groundwork/core` hooks)
- [ ] Does it default to full width/height? (Parent controls sizing)
- [ ] Is there a matching hook? (useComponentName pattern)
- [ ] Are exports flat, not dot notation? (Tree-shakeable)
- [ ] Are primitives composed, not wrapped? (Avoid prop explosion)
- [ ] Are interactions CSS-first? (JS only when needed)
- [ ] Is it a Server Component by default? ('use client' only when needed)
- [ ] Is it < 250 lines? (Split if larger)
