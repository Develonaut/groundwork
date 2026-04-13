# pre-commit - Pre-Commit Checklist

**Status:** Active
**Purpose:** Automated pre-commit verification to catch issues before they enter the codebase

---

## What This Skill Does

The **pre-commit** skill runs a comprehensive checklist before creating a commit:

1. Reads standards and architectural rules
2. Identifies changed files
3. Runs automated checks (build, test, lint, format)
4. Performs code review on changed files
5. Provides proof of work summary
6. Optionally creates the commit
7. Optionally auto-merges to main (with `-m` flag)

---

## Usage

```bash
/pre-commit             # Run checklist, present findings
/pre-commit -r          # Run checklist + code review
/pre-commit -m          # Run checklist + auto-commit + auto-merge
```

**Flags:**

- `-r` - Run code review on changed files (thorough)
- `-m` - Auto-merge to main after commit (use with caution)

---

## Step 1: Read Standards

Read the following files:

**Always:**

- `.claude/rules/code-standards.md`
- `.claude/rules/architecture.md`
- `.claude/CLAUDE.md`

**If changes in specific packages:**

| Package          | Additional Files to Read                                    |
| ---------------- | ----------------------------------------------------------- |
| `apps/web`       | `rules/components.md`, `rules/pages.md`, `rules/theming.md` |
| `packages/core`  | `rules/core-api.md`, `rules/architecture.md`                |
| `@groundwork/ui` | `rules/components.md`, `rules/theming.md`                   |

---

## Step 2: Identify Changed Files

Run:

```bash
git status
git diff
git diff --staged
```

**Categorize changes:**

```markdown
## Changed Files

**[web]**

- apps/web/src/app/page.tsx
- apps/web/src/components/SessionCard.tsx

**[core]**

- packages/core/src/services/sessions.ts
- packages/core/src/adapters/turso-adapter.ts

**[ui]**

- packages/ui/src/button.tsx

**[infra]**

- package.json
- turbo.json

**[docs]**

- .claude/PLAN.md
- README.md
```

---

## Step 3: Run Automated Checks

Run the following commands and capture output:

### Build Check

```bash
pnpm build
```

**Expected:** ✅ All packages build successfully

**If fails:**

- ❌ Fix TypeScript errors
- ❌ Fix build configuration issues
- **STOP** - Do not proceed until build passes

### Test Check

```bash
pnpm test
```

**Expected:** ✅ All tests pass

**If fails:**

- ❌ Fix failing tests
- ❌ Update tests if behavior changed intentionally
- **STOP** - Do not proceed until tests pass

**Coverage check:**

- If new logic added, ensure test coverage exists
- If test coverage < 80% for changed files, flag for review

### Lint Check

```bash
pnpm lint
```

**Expected:** ✅ No linting errors

**If fails:**

- ❌ Fix linting errors
- ❌ Run `pnpm lint --fix` for auto-fixable issues
- **STOP** - Do not proceed until lint passes

### Format Check

```bash
pnpm format:check
```

**Expected:** ✅ All files formatted correctly

**If fails:**

- Run `pnpm format` to auto-format
- Re-run `pnpm format:check` to verify
- **STOP** - Do not proceed until format passes

---

## Step 4: Standards Audit

For each changed file, audit against standards:

### Architecture Compliance

**Check:**

- [ ] Respects layered architecture (Apps → @groundwork/core → Database)
- [ ] No layer-skipping (UI never calls database directly)
- [ ] @groundwork/core uses service/adapter pattern
- [ ] Adapters implement transport interface
- [ ] UI uses React Query hooks from @groundwork/core

**Common violations:**

- ❌ `apps/web` importing from `@turso/client` (should use @groundwork/core)
- ❌ `@groundwork/core` importing from `next` (core must be framework-agnostic)
- ❌ Direct database queries in UI components

### Bento Box Principle

**Check:**

- [ ] File size < 250 lines
- [ ] Function size < 20 lines (avg), max 30 lines
- [ ] One clear purpose per file
- [ ] No `utils.ts` grab bags
- [ ] Clear, descriptive file names

**Common violations:**

- ❌ Files > 250 lines (split into multiple files)
- ❌ Functions > 30 lines (extract helper functions)
- ❌ Multiple unrelated exports in one file

### Component Standards (if `[web]` or `[ui]`)

**Check:**

- [ ] Uses shadcn/ui primitives (not custom components from scratch)
- [ ] Applies Swiss Design styling (typography-first, high contrast)
- [ ] Mobile-first responsive design
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Server Components by default (Client Components only when needed)

**Common violations:**

- ❌ `"use client"` without justification
- ❌ Inline styles instead of Tailwind classes
- ❌ Missing ARIA labels on interactive elements
- ❌ Non-responsive layouts

### TypeScript Standards

**Check:**

- [ ] No `any` types (use `unknown` if truly unknown)
- [ ] Proper type inference (don't over-annotate)
- [ ] Exported types from @groundwork/core for shared contracts
- [ ] Zod schemas for runtime validation

**Common violations:**

- ❌ `any` types
- ❌ `@ts-ignore` or `@ts-expect-error` without explanation
- ❌ Missing return type annotations on public functions

### Data Fetching (if `[web]`)

**Check:**

- [ ] Uses React Query hooks from @groundwork/core
- [ ] Server Components fetch directly (no React Query)
- [ ] Client Components use hooks (React Query)
- [ ] No direct database calls from UI

**Common violations:**

- ❌ `fetch()` calls in Client Components (use hooks)
- ❌ React Query in Server Components (not needed)

### Performance

**Check:**

- [ ] Images use Next.js `<Image>` component
- [ ] Dynamic imports for large components
- [ ] No unnecessary `"use client"` directives
- [ ] Database queries use indexes

**Common violations:**

- ❌ `<img>` instead of `<Image>`
- ❌ Large libraries imported in Server Components

### Gotchas (Next.js 15 / React 19)

**Check:**

- [ ] No `useEffect` with async functions (use separate async function)
- [ ] No mutations in Server Components (use Server Actions)
- [ ] No `JSON.stringify()` on Server Component props (use serializable data)
- [ ] Proper error boundaries for async components

**Common violations:**

- ❌ `useEffect(async () => ...)` (async not allowed)
- ❌ Passing non-serializable props to Client Components

### Code Quality

**Check:**

- [ ] No commented-out code
- [ ] No debug `console.log()` statements
- [ ] No hardcoded values (use constants/env vars)
- [ ] Proper error handling (try/catch, error boundaries)

**Common violations:**

- ❌ `console.log()` in production code
- ❌ Commented-out code blocks
- ❌ Hardcoded API URLs

### Test Coverage

**Check:**

- [ ] Tests exist for new logic/services
- [ ] Tests cover edge cases
- [ ] Tests use proper matchers (not just `.toBeTruthy()`)
- [ ] Integration tests for service/adapter contracts

**Common violations:**

- ❌ No tests for new services
- ❌ Tests that don't actually test behavior

### Stale Artifacts

**Check:**

- [ ] No unused imports
- [ ] No unused variables
- [ ] No unused files (orphaned components)

**Common violations:**

- ❌ Unused imports (ESLint should catch these)
- ❌ Old component files not deleted after refactor

---

## Step 5: Code Review (if `-r` flag)

If the `-r` flag is provided, run a detailed code review on each changed file.

**For each file:**

1. Read the file: `Read <file>`
2. Apply standards audit (Step 4)
3. Check for logic bugs, edge cases, performance issues
4. Suggest improvements (optional, not blocking)

**Output format:**

```markdown
## Code Review

| File                                   | Status  | Issues Found                  | Suggestions                               |
| -------------------------------------- | ------- | ----------------------------- | ----------------------------------------- |
| apps/web/src/app/page.tsx              | ✅ Pass | None                          | Consider extracting SessionList component |
| packages/core/src/services/sessions.ts | ❌ Fail | Missing error handling on L45 | Add try/catch around database call        |
```

**If any failures:**

- Fix the issues immediately
- Re-run the checks
- Do not proceed until all pass

---

## Step 6: Proof of Work Summary

Output a summary of the pre-commit checks:

```markdown
## Pre-Commit Summary

### Changed Files

- [web] 2 files
- [core] 3 files
- [docs] 1 file

### Automated Checks

- [x] Build passes
- [x] Tests pass (12 tests, 100% pass rate)
- [x] Lint passes
- [x] Format passes

### Standards Audit

- [x] Architecture compliance
- [x] Bento Box Principle
- [x] Component standards
- [x] TypeScript standards
- [x] Data fetching patterns
- [x] Performance best practices
- [x] No gotchas detected
- [x] Code quality
- [x] Test coverage
- [x] No stale artifacts

### Code Review (if -r flag)

- [x] All files reviewed
- [x] No blocking issues

### Ready to Commit: ✅ YES
```

---

## Step 7: Commit Workflow

If all checks pass:

### Without `-m` flag (default)

**Present findings and ask:**

```markdown
All checks pass. Ready to commit.

Suggested commit message:
```

<type>: <short description>

<optional longer explanation>
```

Proceed with commit? (yes/no)

````

**If user says yes:**

```bash
git add <changed-files>
git commit -m "<user-approved-message>"
````

### With `-m` flag (auto-merge)

**Automatically:**

1. Create commit with suggested message
2. Push to current branch
3. Merge to main:

```bash
git add <changed-files>
git commit -m "<suggested-message>"
git push
git checkout main
git pull
git merge <feature-branch>
git push
git branch -d <feature-branch>
```

**Output:**

```markdown
## Auto-Merge Complete

- Committed to: <branch-name>
- Merged to: main
- Branch deleted: <branch-name>
```

---

## Error Recovery

**If any check fails:**

1. **STOP** - Do not proceed
2. Output the failure details
3. Suggest fixes (if obvious)
4. Wait for fixes, then re-run `/pre-commit`

**If code review finds issues (`-r` flag):**

1. Fix issues immediately (if `-r` is active, fix in-place)
2. Re-run checks
3. Do not proceed until clean

---

## Notes

- **Run before every commit** - Catches issues early
- **`-r` flag for rigor** - Use when you want thorough review
- **`-m` flag for speed** - Use when confident (post-review)
- **Standards are non-negotiable** - All checks must pass

---

## Related Skills

- `/code-review` - Detailed code review (standalone)
- `/pickup` - Task execution workflow (includes pre-commit in Step 6)
- `/merge-pr` - PR merge workflow

---

## Example

**User:** `/pre-commit -r`

**Agent:**

[Runs Steps 1-6]

```markdown
## Pre-Commit Summary

### Changed Files

- [web] apps/web/src/app/page.tsx
- [core] packages/core/src/services/sessions.ts
- [core] packages/core/src/adapters/turso-adapter.ts

### Automated Checks

- [x] Build passes
- [x] Tests pass (15 tests, 100% pass rate)
- [x] Lint passes
- [x] Format passes

### Standards Audit

- [x] Architecture compliance
- [x] Bento Box Principle
- [x] Component standards
- [x] TypeScript standards
- [x] Data fetching patterns
- [x] Performance best practices
- [x] No gotchas detected
- [x] Code quality
- [x] Test coverage
- [x] No stale artifacts

### Code Review

| File                                        | Status  | Issues Found | Suggestions                    |
| ------------------------------------------- | ------- | ------------ | ------------------------------ |
| apps/web/src/app/page.tsx                   | ✅ Pass | None         | None                           |
| packages/core/src/services/sessions.ts      | ✅ Pass | None         | Consider adding JSDoc comments |
| packages/core/src/adapters/turso-adapter.ts | ✅ Pass | None         | None                           |

### Ready to Commit: ✅ YES

Suggested commit message:
```

feat: add session creation flow

- Create sessions service in @groundwork/core
- Add Turso adapter for session persistence
- Wire up session form in web app

```

Proceed with commit? (yes/no)
```

---

**End of pre-commit skill**
