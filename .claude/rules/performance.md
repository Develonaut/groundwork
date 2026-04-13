# Performance Standards

**Purpose:** Define performance targets and optimization patterns.

**Key Principles:**

1. Server Components first
2. Lazy load Client Components
3. Optimize bundle size
4. Monitor Core Web Vitals
5. Performance budgets in CI

---

## 1. Server Components First

**Rule:** Default to Server Components. Only use Client Components when necessary.

### When to Use Client Components

- Uses React hooks (useState, useEffect, custom hooks)
- Uses event handlers (onClick, onChange, onSubmit)
- Uses browser APIs (window, localStorage, navigator)
- Uses Context providers/consumers
- Uses third-party libraries that require client-side rendering

### Example: Mixed composition

```tsx
// ✅ app/sessions/page.tsx (Server Component)
import { PageShell } from "@/components/layout/page-shell"; // Server
import { SessionList } from "@/components/session-list"; // Client (uses hooks)

export default function SessionsPage() {
  return (
    <PageShell>
      <SessionList />
    </PageShell>
  );
}
```

**Why:** Server Components are:

- Zero bundle size
- Faster initial load
- Better SEO
- Direct database access (no API needed)

---

## 2. Lazy Load Client Components

**Rule:** Lazy load Client Components that are below the fold or conditionally rendered.

### Example: Dialog lazy loading

```tsx
// ✅ app/sessions/page.tsx
import dynamic from "next/dynamic";

const SessionDialog = dynamic(() =>
  import("@/components/session-dialog").then((mod) => ({ default: mod.SessionDialog })),
);

export default function SessionsPage() {
  return (
    <PageShell>
      <SessionList />
      <SessionDialog /> {/* Only loads when opened */}
    </PageShell>
  );
}
```

### Example: Loading state

```tsx
// ✅ With loading fallback
const SessionDialog = dynamic(
  () => import("@/components/session-dialog").then((mod) => ({ default: mod.SessionDialog })),
  { loading: () => <DialogSkeleton /> },
);
```

**Use lazy loading for:**

- Modals/dialogs
- Below-the-fold content
- Large chart libraries
- Rich text editors

---

## 3. Bundle Size Optimization

**Rule:** Keep JavaScript bundles small. Monitor bundle size in CI.

### Targets

- **First Load JS:** < 100 KB (Next.js default budget)
- **Route JS:** < 50 KB per route
- **Shared JS:** < 200 KB total

### Example: Check bundle size

```bash
pnpm build

# Output shows bundle sizes
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          95 kB
├ ○ /sessions                           12.3 kB         107 kB
└ ○ /sessions/[id]                       8.1 kB         103 kB
```

### Optimization strategies

1. **Use Server Components** (zero bundle size)
2. **Lazy load Client Components** (split bundles)
3. **Tree-shake unused code** (named imports)
4. **Avoid large dependencies** (use lighter alternatives)

### Example: Tree-shaking

```tsx
// ❌ Imports entire library
import _ from "lodash";
_.debounce(fn, 300);

// ✅ Imports only what's needed
import debounce from "lodash/debounce";
debounce(fn, 300);
```

---

## 4. Core Web Vitals Targets

**Rule:** Monitor Core Web Vitals. Target "Good" scores.

### Targets

| Metric                             | Good    | Needs Improvement | Poor     |
| ---------------------------------- | ------- | ----------------- | -------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | 2.5s - 4.0s       | > 4.0s   |
| **FID** (First Input Delay)        | < 100ms | 100ms - 300ms     | > 300ms  |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | 0.1 - 0.25        | > 0.25   |
| **FCP** (First Contentful Paint)   | < 1.8s  | 1.8s - 3.0s       | > 3.0s   |
| **TTFB** (Time to First Byte)      | < 800ms | 800ms - 1800ms    | > 1800ms |

### Optimization strategies

#### LCP (Largest Contentful Paint)

- Use Server Components for above-the-fold content
- Optimize images (Next.js Image component)
- Preload critical resources
- Use CDN for static assets

```tsx
// ✅ Optimize images
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Preload above-the-fold images
/>;
```

#### FID (First Input Delay)

- Minimize JavaScript execution
- Use Server Components
- Lazy load non-critical Client Components
- Debounce/throttle expensive operations

```tsx
// ✅ Debounce search input
import { useDebouncedCallback } from "use-debounce";

const debouncedSearch = useDebouncedCallback((value: string) => {
  search(value);
}, 300);
```

#### CLS (Cumulative Layout Shift)

- Set explicit width/height on images
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS transforms (not top/left) for animations

```tsx
// ✅ Reserve space for skeleton
<div className="h-64">
  {" "}
  {/* Explicit height */}
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

---

## 5. Image Optimization

**Rule:** Use Next.js Image component for all images.

### Example: Optimized image

```tsx
// ✅ Next.js Image
import Image from "next/image";

<Image
  src="/session.jpg"
  alt="Session photo"
  width={800}
  height={600}
  className="rounded-lg"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Low-res placeholder
/>;
```

### Benefits

- Automatic image optimization
- Responsive images
- Lazy loading
- Modern formats (WebP, AVIF)
- Blur-up placeholder

---

## 6. Font Optimization

**Rule:** Use `next/font` for font loading.

### Example: Optimized fonts

```tsx
// ✅ app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Avoid flash of invisible text
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Benefits

- Self-host Google Fonts (zero external requests)
- Automatic font optimization
- Zero layout shift
- Preload critical fonts

---

## 7. Database Query Optimization

**Rule:** Optimize database queries. Use indexes. Avoid N+1 queries.

### Example: N+1 query problem

```tsx
// ❌ N+1 queries (1 query for sessions + N queries for techniques)
const sessions = await db.query.sessions.findMany();

for (const session of sessions) {
  const techniques = await db.query.techniques.findMany({
    where: eq(techniques.sessionId, session.id),
  });
  // ...
}
```

### Example: Optimized query

```tsx
// ✅ Single query with join
const sessions = await db.query.sessions.findMany({
  with: {
    techniques: true, // Drizzle joins automatically
  },
});
```

### Index critical columns

```ts
// ✅ schema.ts
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: integer("date", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    dateIdx: index("date_idx").on(table.date),
  }),
);
```

---

## 8. Caching Strategy

**Rule:** Use Next.js caching strategically.

### Server Component caching

```tsx
// ✅ Cache for 1 hour
export const revalidate = 3600;

export default async function SessionsPage() {
  const sessions = await getSessions();
  // ...
}
```

### Client-side caching

```tsx
// ✅ React Query caching
"use client";

import { useSessions } from "@groundwork/core";

export function SessionList() {
  const { data: sessions } = useSessions({
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  // ...
}
```

---

## 9. Performance Monitoring

**Rule:** Monitor performance in production. Use Vercel Analytics or Web Vitals API.

### Example: Web Vitals tracking

```tsx
// ✅ app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 10. Performance Budget (CI)

**Rule:** Fail CI if bundle size exceeds budget.

### Example: next.config.js

```js
// ✅ next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  // Vercel automatically enforces 100 KB first load budget
};
```

### Example: Lighthouse CI

```yaml
# ✅ .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/sessions
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## Summary Checklist

Before deploying, verify:

- [ ] Server Components used by default
- [ ] Client Components lazy loaded when appropriate
- [ ] Bundle size < 100 KB first load
- [ ] Core Web Vitals in "Good" range (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Images optimized with Next.js Image
- [ ] Fonts optimized with next/font
- [ ] Database queries optimized (no N+1, indexes on critical columns)
- [ ] Caching strategy in place (revalidate, staleTime)
- [ ] Performance monitoring enabled (Analytics, SpeedInsights)
- [ ] Performance budget enforced in CI

---

## Tools

- **Bundle Analyzer:** `@next/bundle-analyzer`
- **Lighthouse:** Built into Chrome DevTools
- **Web Vitals:** `web-vitals` npm package
- **Vercel Analytics:** `@vercel/analytics`
- **Vercel Speed Insights:** `@vercel/speed-insights`
