# code-review - Comprehensive Code Review

**Status:** Active
**Purpose:** Perform a thorough code review on changed files, auditing against all standards and architectural rules

---

## What This Skill Does

The **code-review** skill performs a comprehensive audit of code changes:

1. Identifies all changed files
2. Reads relevant standards documents
3. Performs per-file audit against standards
4. Checks for violations and suggests improvements
5. **Fixes violations immediately** (not just flagging)
6. Outputs review summary with pass/fail matrix

---

## Usage

```bash
/code-review              # Review all changed files
/code-review <file-path>  # Review specific file
```

---

## Step 1: Identify Files to Review

### If no file specified

Run:

```bash
git status
git diff --name-only
git diff --staged --name-only
```

**Categorize by package:**

```markdown
## Files to Review

**[web]**

- apps/web/src/app/page.tsx
- apps/web/src/app/sessions/new/page.tsx

**[core]**

- packages/core/src/services/sessions.ts
- packages/core/src/adapters/turso-adapter.ts

**[ui]**

- packages/ui/src/button.tsx

**[docs]**

- README.md
```

### If file specified

Review only that file.

---

## Step 2: Read Standards

Read standards based on files being reviewed:

**Always read:**

- `.claude/rules/code-standards.md`
- `.claude/rules/architecture.md`

**If reviewing `[web]` files:**

- `.claude/rules/components.md`
- `.claude/rules/pages.md`
- `.claude/rules/theming.md`

**If reviewing `[core]` files:**

- `.claude/rules/core-api.md`

**If reviewing `[ui]` files:**

- `.claude/rules/components.md`
- `.claude/rules/theming.md`
- `.claude/strategy/design-language.md`

---

## Step 3: Per-File Audit

For each file, audit against the following standards:

### 1. Architecture

**Check:**

- [ ] Respects layered architecture (Apps → @groundwork/core → Database)
- [ ] No layer-skipping
- [ ] @groundwork/core uses service/adapter pattern
- [ ] UI uses React Query hooks from @groundwork/core
- [ ] No framework dependencies in @groundwork/core

**Violations:**

- ❌ UI importing `@turso/client` directly
- ❌ @groundwork/core importing `next`
- ❌ Direct database queries in components

**Severity:** BLOCKING - Must fix immediately

### 2. Bento Box Principle

**Check:**

- [ ] File size < 250 lines
- [ ] Function size < 20 lines (avg), max 30 lines
- [ ] One clear purpose per file
- [ ] No `utils.ts` grab bags
- [ ] Descriptive file names

**Violations:**

- ❌ File > 250 lines → Split into multiple files
- ❌ Function > 30 lines → Extract helper functions
- ❌ Multiple unrelated exports → Separate files

**Severity:** BLOCKING - Must fix immediately

### 3. Components (if `[web]` or `[ui]`)

**Check:**

- [ ] Uses shadcn/ui primitives
- [ ] Applies Swiss Design styling
- [ ] Mobile-first responsive
- [ ] Accessible (ARIA, keyboard)
- [ ] Server Components by default
- [ ] `"use client"` only when necessary (interactivity/hooks)

**Violations:**

- ❌ Custom components instead of shadcn/ui
- ❌ Inline styles instead of Tailwind
- ❌ Missing ARIA labels
- ❌ Unnecessary `"use client"`

**Severity:** BLOCKING - Must fix immediately

### 4. Theming (if `[ui]`)

**Check:**

- [ ] Follows Swiss Design principles (typography-first, grid-based)
- [ ] Uses design tokens from Tailwind config
- [ ] Black/white/grey + one accent color
- [ ] 8px baseline grid for spacing
- [ ] No gradients, no shadows (or minimal)

**Violations:**

- ❌ Custom colors not in design system
- ❌ Spacing not aligned to 8px grid
- ❌ Centered layouts (Swiss Design prefers asymmetric balance)

**Severity:** BLOCKING - Must fix immediately

### 5. TypeScript

**Check:**

- [ ] No `any` types
- [ ] Proper type inference
- [ ] Exported types from @groundwork/core for contracts
- [ ] Zod schemas for runtime validation
- [ ] Return type annotations on exported functions

**Violations:**

- ❌ `any` types
- ❌ `@ts-ignore` without explanation
- ❌ Missing return types on public APIs

**Severity:** BLOCKING - Must fix immediately

### 6. Data Fetching (if `[web]`)

**Check:**

- [ ] Server Components fetch directly (no React Query)
- [ ] Client Components use React Query hooks from @groundwork/core
- [ ] No direct database calls from UI
- [ ] Proper error handling

**Violations:**

- ❌ `fetch()` in Client Components
- ❌ React Query in Server Components
- ❌ Database imports in UI

**Severity:** BLOCKING - Must fix immediately

### 7. Performance

**Check:**

- [ ] Images use Next.js `<Image>` component
- [ ] Dynamic imports for large components
- [ ] No unnecessary `"use client"` directives
- [ ] Database queries optimized (indexes, limits)

**Violations:**

- ❌ `<img>` instead of `<Image>`
- ❌ Large bundles imported without code-splitting
- ❌ Unoptimized database queries (N+1, full table scans)

**Severity:** HIGH - Should fix before merge

### 8. Gotchas (Next.js 15 / React 19)

**Check:**

- [ ] No `useEffect` with async functions
- [ ] No mutations in Server Components (use Server Actions)
- [ ] No non-serializable props to Client Components
- [ ] Proper error boundaries for async components

**Violations:**

- ❌ `useEffect(async () => ...)`
- ❌ `JSON.stringify()` on props
- ❌ Missing error boundaries

**Severity:** BLOCKING - Must fix immediately

### 9. Code Quality

**Check:**

- [ ] No commented-out code
- [ ] No debug `console.log()`
- [ ] No hardcoded values (use constants/env vars)
- [ ] Proper error handling
- [ ] Descriptive variable names

**Violations:**

- ❌ `console.log()` statements
- ❌ Commented-out code
- ❌ Magic numbers/strings
- ❌ Empty `catch` blocks

**Severity:** BLOCKING - Must fix immediately

### 10. Test Coverage

**Check:**

- [ ] Tests exist for new logic/services
- [ ] Tests cover edge cases
- [ ] Tests use proper assertions
- [ ] Integration tests for service/adapter contracts

**Violations:**

- ❌ No tests for new services
- ❌ Tests that don't test behavior (`.toBeTruthy()` only)
- ❌ Missing edge case coverage

**Severity:** BLOCKING - Must fix immediately

### 11. Security

**Check:**

- [ ] User input validated with Zod
- [ ] No SQL injection vectors (using ORM/parameterized queries)
- [ ] Auth checks on protected routes/actions
- [ ] No secrets in code (use env vars)

**Violations:**

- ❌ Raw SQL with string interpolation
- ❌ Missing auth checks
- ❌ Hardcoded API keys

**Severity:** CRITICAL - Must fix immediately

### 12. Stale Artifacts

**Check:**

- [ ] No unused imports
- [ ] No unused variables
- [ ] No orphaned files

**Violations:**

- ❌ Unused imports (ESLint should catch)
- ❌ Unused variables
- ❌ Old files not deleted

**Severity:** MEDIUM - Should fix before merge

---

## Step 4: Fix Violations Immediately

**This is not a passive review** - Fix violations as you find them.

For each violation:

1. **Identify the issue** (e.g., "File > 250 lines")
2. **Fix it** (e.g., split into multiple files)
3. **Verify fix** (e.g., check new file sizes)
4. **Re-audit** (ensure fix didn't introduce new issues)

**Do not just flag issues** - Fix them.

---

## Step 5: Review Summary

After auditing all files, output a summary matrix:

```markdown
## Code Review Summary

### Files Reviewed: 5

| File                                        | LOC | Architecture | Bento Box | Components | TypeScript | Data Fetching | Performance | Gotchas | Quality | Tests | Security | Stale | Status  |
| ------------------------------------------- | --- | ------------ | --------- | ---------- | ---------- | ------------- | ----------- | ------- | ------- | ----- | -------- | ----- | ------- |
| apps/web/src/app/page.tsx                   | 120 | ✅           | ✅        | ✅         | ✅         | ✅            | ✅          | ✅      | ✅      | N/A   | ✅       | ✅    | ✅ PASS |
| apps/web/src/app/sessions/new/page.tsx      | 85  | ✅           | ✅        | ✅         | ✅         | ✅            | ✅          | ✅      | ✅      | N/A   | ✅       | ✅    | ✅ PASS |
| packages/core/src/services/sessions.ts      | 180 | ✅           | ✅        | N/A        | ✅         | N/A           | ✅          | ✅      | ✅      | ✅    | ✅       | ✅    | ✅ PASS |
| packages/core/src/adapters/turso-adapter.ts | 220 | ✅           | ✅        | N/A        | ✅         | N/A           | ✅          | ✅      | ✅      | ✅    | ✅       | ✅    | ✅ PASS |
| packages/ui/src/button.tsx                  | 45  | ✅           | ✅        | ✅         | ✅         | N/A           | ✅          | ✅      | ✅      | N/A   | ✅       | ✅    | ✅ PASS |

### Overall: ✅ ALL PASS

### Violations Found: 0

### Violations Fixed: 3

- Split `sessions.ts` into `sessions.ts` and `sessions-helpers.ts` (was 280 lines)
- Removed unused imports from `page.tsx`
- Added missing ARIA labels to `button.tsx`

### Suggestions (Non-Blocking):

- Consider adding JSDoc comments to `sessions.ts` public API
- Consider extracting `SessionCard` component from `page.tsx`

### Ready for Commit: ✅ YES
```

---

## Step 6: Detailed Findings (Optional)

If violations were found and fixed, provide details:

```markdown
## Detailed Findings

### File: packages/core/src/services/sessions.ts

**Violation:** Bento Box Principle - File too large (280 lines)

**Fix Applied:**

- Split into `sessions.ts` (main service, 180 lines)
- Extracted to `sessions-helpers.ts` (utility functions, 100 lines)

**Verification:** ✅ Both files now < 250 lines

---

### File: apps/web/src/app/page.tsx

**Violation:** Stale Artifacts - Unused imports

**Fix Applied:**

- Removed unused `import { useEffect } from 'react'`

**Verification:** ✅ ESLint passes

---

### File: packages/ui/src/button.tsx

**Violation:** Components - Missing ARIA labels

**Fix Applied:**

- Added `aria-label` to icon-only button variant

**Verification:** ✅ Accessibility audit passes
```

---

## Notes

- **Fix, don't just flag** - This is an active review
- **All blocking violations must be fixed** - No exceptions
- **Re-audit after fixes** - Ensure fixes didn't introduce new issues
- **Suggestions are optional** - Nice-to-haves, not blockers

---

## Related Skills

- `/pre-commit` - Includes code review as Step 5 (with `-r` flag)
- `/pickup` - Includes code review as Step 7 (self-review)
- `/security-review` - Security-focused review

---

## Example

**User:** `/code-review`

**Agent:**

[Identifies 3 changed files]

[Reads standards]

[Audits each file]

[Fixes 2 violations]

```markdown
## Code Review Summary

### Files Reviewed: 3

| File                                   | LOC | Architecture | Bento Box | Components | TypeScript | Data Fetching | Performance | Gotchas | Quality | Tests | Security | Stale | Status  |
| -------------------------------------- | --- | ------------ | --------- | ---------- | ---------- | ------------- | ----------- | ------- | ------- | ----- | -------- | ----- | ------- |
| apps/web/src/app/page.tsx              | 120 | ✅           | ✅        | ✅         | ✅         | ✅            | ✅          | ✅      | ✅      | N/A   | ✅       | ✅    | ✅ PASS |
| packages/core/src/services/sessions.ts | 180 | ✅           | ✅        | N/A        | ✅         | N/A           | ✅          | ✅      | ✅      | ✅    | ✅       | ✅    | ✅ PASS |
| packages/ui/src/button.tsx             | 45  | ✅           | ✅        | ✅         | ✅         | N/A           | ✅          | ✅      | ✅      | N/A   | ✅       | ✅    | ✅ PASS |

### Overall: ✅ ALL PASS

### Violations Found: 2

### Violations Fixed: 2

### Suggestions (Non-Blocking):

- Consider adding JSDoc comments to `sessions.ts`

### Ready for Commit: ✅ YES
```

---

**End of code-review skill**
