# Pre-Commit Checklist

**Last Updated:** April 13, 2026

This checklist MUST be completed before every commit. No exceptions.

---

## Overview

Before you commit code to Groundwork, you must verify:

1. **Automated checks pass** (build, test, lint)
2. **Architecture compliance** (layering, @groundwork/core abstraction)
3. **Code quality** (Bento Box, TypeScript, naming)
4. **Test coverage** (data layer, hooks, edge cases)
5. **Documentation** (PLAN.md updated, proof of work)
6. **Commit workflow** (branch naming, message, PR size)

**No Ignoring Failures:** If ANY step fails, you MUST fix it before committing. Do not use `--no-verify`. Do not skip tests. Do not commit broken code.

---

## Step 1: Automated Frontend Checks

Run these commands from the repository root:

```bash
# Build the app
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Check formatting
pnpm format:check
```

**Pass Criteria:**

- ✅ Build completes with zero errors
- ✅ All tests pass (zero failures, zero skips)
- ✅ Lint completes with zero errors (warnings are acceptable if justified)
- ✅ Formatting check passes (or run `pnpm format` to auto-fix)

**If any fail:** Fix the issue, re-run the checks, repeat until all pass.

---

## Step 2: Architecture & Bento Box Compliance

Verify your changes follow Groundwork's architectural rules.

### 2.1 Layered Architecture Check

**Rule:** Apps → @groundwork/core → Database (Turso). Never skip layers.

**Verify:**

- [ ] UI code (`apps/web`) does NOT import Drizzle, LibSQL, or database modules directly
- [ ] UI code calls `@groundwork/core` hooks/services for ALL data operations
- [ ] `@groundwork/core` is the ONLY package that touches the database
- [ ] No direct SQL queries in React components or pages

**Red flags:**

- `import { db } from '@groundwork/db'` in `apps/web/` (WRONG - use @groundwork/core)
- `await db.select()` in a React component (WRONG - use a hook from @groundwork/core)
- API routes calling Drizzle directly without going through @groundwork/core

### 2.2 Bento Box Principle Check

**Rule:** One thing per file/function/package. Small, focused modules.

**Verify:**

- [ ] Files are < 250 lines (run `wc -l <file>`)
- [ ] Functions are < 20 lines (eyeball check)
- [ ] Each file has a single, clear purpose
- [ ] No `utils.ts` or `helpers.ts` grab bags
- [ ] Packages are focused (e.g., `@groundwork/core` = data layer, not UI)

**Red flags:**

- Files over 250 lines
- Functions doing multiple unrelated things
- Generic "utility" files

**Fix:** Split large files into smaller modules. Extract helper functions into dedicated files.

### 2.3 Transport-Agnostic API Check

**Rule:** `@groundwork/core` abstracts the data layer. The app doesn't know if it's Turso, SQLite, or future providers.

**Verify:**

- [ ] `@groundwork/core` exports hooks (e.g., `useSessions()`) and services
- [ ] Hooks return plain objects/arrays, not Drizzle query builders
- [ ] Database implementation details are hidden from consumers
- [ ] Adapters pattern is used for swappable backends

**Red flags:**

- Hooks returning Drizzle query objects
- Database-specific types leaking into public APIs

---

## Step 3: TypeScript Compliance

**Rule:** Strict TypeScript. No `any`. No `@ts-ignore` without justification.

**Verify:**

- [ ] Zero TypeScript errors (`pnpm build` checks this)
- [ ] No `any` types (use `unknown` or proper types)
- [ ] No `@ts-ignore` or `@ts-expect-error` unless absolutely necessary
- [ ] All functions have return type annotations
- [ ] All @groundwork/core APIs have proper TypeScript interfaces

**Red flags:**

- `any` types in function parameters or returns
- `@ts-ignore` comments (investigate why, fix the root cause)

**Fix:** Add proper types. If a third-party library lacks types, create a `.d.ts` file.

---

## Step 4: Code Quality

Manual review for readability, maintainability, and patterns.

### 4.1 Naming Conventions

**Verify:**

- [ ] Files: `kebab-case.ts` (e.g., `session-list.tsx`, `use-sessions.ts`)
- [ ] Components: `PascalCase` (e.g., `SessionCard`, `JournalEntry`)
- [ ] Hooks: `useCamelCase` (e.g., `useSessions`, `useAuth`)
- [ ] Functions: `camelCase` (e.g., `getSessions`, `createSession`)
- [ ] Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_SESSION_LENGTH`)

### 4.2 React Patterns

**Verify:**

- [ ] Components are functional (no class components)
- [ ] Hooks are used correctly (only at top level, not in loops/conditions)
- [ ] Server Components are default (use `'use client'` only when needed)
- [ ] Client Components are minimal (push logic to Server Components)

### 4.3 Error Handling

**Verify:**

- [ ] All async operations have error handling (try/catch or `.catch()`)
- [ ] User-facing errors have helpful messages
- [ ] Network errors are handled gracefully
- [ ] Database errors don't leak sensitive info to the client

---

## Step 5: Test Coverage

**Rule:** All data layer code, hooks, and critical paths must have tests.

**Verify:**

- [ ] New `@groundwork/core` functions have unit tests
- [ ] New hooks have integration tests (mock data layer)
- [ ] Edge cases are tested (null, undefined, empty arrays, errors)
- [ ] Tests are in `__tests__/` or `.test.ts` files

**Minimum coverage:**

- Data layer functions (e.g., `getSessions`, `createSession`): 100%
- Hooks (e.g., `useSessions`): 100%
- UI components: Nice to have (not required for MVP)

**Red flags:**

- New data functions with zero tests
- Untested error paths

**Fix:** Write tests using Vitest. See existing tests for patterns.

---

## Step 6: PLAN.md Update

**Rule:** Mark tasks as complete in PLAN.md when you finish them.

**Verify:**

- [ ] PLAN.md is updated to reflect your changes
- [ ] Completed tasks are checked off or moved to "Done"
- [ ] New tasks discovered during implementation are added
- [ ] Next steps are clear for other agents/developers

**Example:**

```diff
- [ ] Implement session creation flow
+ [x] Implement session creation flow (Done - Apr 13, 2026)
+ [ ] Add error handling for session creation (discovered during implementation)
```

---

## Step 7: Proof of Work Summary

**Rule:** Document what you built, why, and how it works.

Create a brief summary (3-5 sentences) for your commit message or PR description:

**Template:**

```
[What] Built/fixed/improved <feature/component/function>
[Why] To enable <user story or technical goal>
[How] By <key implementation details>
[Testing] Verified with <test approach>
```

**Example:**

```
Built session creation flow with form validation and error handling.
To enable users to log training sessions from the journal page.
By creating a SessionForm component with Zod validation and useSessions hook.
Verified with unit tests for form validation and integration tests for the hook.
```

---

## Step 8: Commit & Branch Workflow

### 8.1 Branch Naming

**Rule:** Use descriptive branch names: `<type>/<short-description>`

**Types:**

- `feat/` - New feature
- `fix/` - Bug fix
- `refactor/` - Code refactoring (no behavior change)
- `docs/` - Documentation only
- `test/` - Adding/fixing tests
- `chore/` - Tooling, config, dependencies

**Examples:**

- `feat/session-creation-form`
- `fix/auth-redirect-loop`
- `refactor/split-session-service`
- `docs/update-architecture-rules`

### 8.2 Commit Message Format

**Rule:** Clear, concise, imperative mood.

**Format:**

```
<type>: <subject>

<optional body>
```

**Examples:**

```
feat: add session creation form with Zod validation

Implements the session creation flow with form validation, error handling,
and integration with useSessions hook. Includes tests for validation logic.
```

```
fix: prevent auth redirect loop on protected routes

Adds a check for existing session before redirecting to avoid infinite loops.
```

**DO NOT:**

- Add `🤖 Generated with Claude Code` (per user's global instructions)
- Add `Co-Authored-By: Claude` (per user's global instructions)
- Add `Test Plan` sections (per user's global instructions)

### 8.3 Never Commit Directly to Main

**Rule:** ALL changes go through branches and PRs.

**Workflow:**

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes, commit to branch
3. Push branch: `git push -u origin feat/my-feature`
4. Create PR on GitHub
5. Review, merge to main

**Never:**

```bash
git checkout main
git commit -m "quick fix"  # WRONG
```

---

## Step 9: PR Sizing Rules

**Rule:** Keep PRs small and focused. Large PRs are hard to review and prone to bugs.

**Guidelines:**

- **Ideal PR:** < 200 lines changed, single feature/fix
- **Acceptable PR:** 200-500 lines, cohesive change
- **Too large:** > 500 lines (split into multiple PRs)

**How to split large PRs:**

1. **Infrastructure first:** Create base types, adapters, database schema
2. **Core logic second:** Implement data layer functions
3. **UI last:** Build components and pages

**Example (session creation):**

- PR 1: Add `sessions` table schema, migration
- PR 2: Implement `createSession` service, tests
- PR 3: Build `SessionForm` component
- PR 4: Integrate form into journal page

**Benefits:**

- Easier to review
- Faster feedback
- Less merge conflicts
- Safer to roll back if needed

---

## Step 10: Final Checklist

Before you commit, verify:

- [ ] ✅ All automated checks pass (build, test, lint)
- [ ] ✅ Architecture rules followed (no layer skipping)
- [ ] ✅ Bento Box compliance (files < 250 lines, focused modules)
- [ ] ✅ TypeScript strict (no `any`, no `@ts-ignore`)
- [ ] ✅ Code quality (naming, patterns, error handling)
- [ ] ✅ Tests written (data layer, hooks, edge cases)
- [ ] ✅ PLAN.md updated (tasks marked done)
- [ ] ✅ Commit message written (clear, imperative)
- [ ] ✅ On a feature branch (not main)
- [ ] ✅ PR is reasonably sized (< 500 lines if possible)

**If all checked:** Commit and push.

**If any unchecked:** Fix it, then commit.

---

## No Ignoring Failures

**CRITICAL RULE:** Do not bypass this checklist.

**Never do this:**

```bash
git commit --no-verify  # WRONG - bypasses pre-commit hooks
pnpm test || true       # WRONG - ignores test failures
# @ts-ignore            // WRONG - hides TypeScript errors
```

**Why:**

- Broken code wastes other developers' time
- Failing tests indicate real bugs
- TypeScript errors prevent runtime crashes
- Skipping architecture checks leads to technical debt

**If a check fails:** Fix the root cause. Don't work around it.

---

## Summary

This checklist ensures:

1. Code works (automated checks)
2. Code is maintainable (architecture, Bento Box)
3. Code is safe (TypeScript, tests)
4. Code is documented (PLAN.md, commit messages)
5. Code is reviewable (branch workflow, PR sizing)

**Follow this checklist on every commit. No exceptions.**
