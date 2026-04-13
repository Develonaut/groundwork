# test-review - Test Review Skill

**Status:** Active
**Purpose:** Review test quality, coverage, and effectiveness

---

## What This Skill Does

The **test-review** skill audits tests for quality and coverage:

1. Identifies test files
2. Checks test coverage
3. Audits test quality (assertions, naming, independence)
4. Identifies missing tests
5. Suggests improvements

---

## Usage

```bash
/test-review              # Review all test files
/test-review <file-path>  # Review specific test file
```

---

## Test Quality Checklist

### 1. Test Coverage

**Check:**

- [ ] Line coverage > 80%
- [ ] Branch coverage > 80%
- [ ] Function coverage > 90%
- [ ] Critical paths covered
- [ ] Edge cases covered

**Run:**

```bash
pnpm test --coverage
```

**Violations:**

- ❌ Coverage < 80%
- ❌ Critical functions not tested
- ❌ Edge cases missing

### 2. Test Independence

**Check:**

- [ ] Tests don't depend on each other
- [ ] Tests can run in any order
- [ ] No shared state between tests
- [ ] Each test sets up its own data

**Violations:**

- ❌ Test depends on previous test passing
- ❌ Tests share mutable state
- ❌ Tests modify global state without cleanup

**Example (bad):**

```typescript
// ❌ Tests depend on each other
let userId: string;

it("creates user", () => {
  userId = createUser(); // Sets global state
});

it("gets user", () => {
  const user = getUser(userId); // Depends on previous test
});
```

**Example (good):**

```typescript
// ✅ Tests are independent
it("creates user", () => {
  const userId = createUser();
  expect(userId).toBeDefined();
});

it("gets user", () => {
  const userId = createUser(); // Creates own data
  const user = getUser(userId);
  expect(user).toBeDefined();
});
```

### 3. Test Naming

**Check:**

- [ ] Descriptive test names
- [ ] Names describe behavior (not implementation)
- [ ] Consistent naming convention

**Good names:**

- ✅ `it('returns null if session does not exist')`
- ✅ `it('throws error for invalid input')`
- ✅ `it('filters sessions by user ID')`

**Bad names:**

- ❌ `it('works')`
- ❌ `it('test1')`
- ❌ `it('should work correctly')`

### 4. Assertions

**Check:**

- [ ] Specific assertions (not just `.toBeTruthy()`)
- [ ] Tests actually test behavior
- [ ] Each test has at least one assertion

**Good assertions:**

```typescript
expect(session.title).toBe("Test Session");
expect(sessions).toHaveLength(2);
expect(error).toBeInstanceOf(ZodError);
expect(result).toEqual({ id: "1", name: "Test" });
```

**Bad assertions:**

```typescript
expect(result).toBeTruthy(); // ❌ Not specific
expect(result).toBeDefined(); // ❌ Too vague
```

### 5. Edge Cases

**Check:**

- [ ] Empty arrays tested
- [ ] Null/undefined tested
- [ ] Invalid input tested
- [ ] Boundary conditions tested

**Example:**

```typescript
describe("getSessions", () => {
  it("returns empty array if user has no sessions", async () => {
    const sessions = await getSessions("user-1");
    expect(sessions).toEqual([]);
  });

  it("handles null userId gracefully", async () => {
    await expect(getSessions(null as any)).rejects.toThrow();
  });
});
```

### 6. Error Cases

**Check:**

- [ ] Error scenarios tested
- [ ] Error messages validated
- [ ] Error types validated

**Example:**

```typescript
it("throws ZodError for invalid input", async () => {
  const input = { title: "", notes: "Notes" };

  await expect(createSession(input, "user-1")).rejects.toThrow(ZodError);
});

it("throws error for unauthorized access", async () => {
  const session = await createSession({ title: "Test", notes: "Notes" }, "user-1");

  await expect(getSession(session.id, "user-2")).rejects.toThrow("Unauthorized");
});
```

### 7. Security Tests

**Check:**

- [ ] Authorization tested (user isolation)
- [ ] Input validation tested
- [ ] SQL injection prevention tested (implicitly via ORM)

**Example:**

```typescript
it("prevents access to other users sessions", async () => {
  const session = await createSession({ title: "Test", notes: "Notes" }, "user-1");

  const result = await getSession(session.id, "user-2");

  expect(result).toBeNull();
});
```

### 8. Test Organization

**Check:**

- [ ] Tests co-located with implementation (`<file>.test.ts`)
- [ ] Describe blocks for grouping
- [ ] Setup/teardown in `beforeEach`/`afterEach`

**Example:**

```typescript
describe("SessionsService", () => {
  let service: SessionsService;
  let adapter: SessionsAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
    service = createSessionsService(adapter);
  });

  describe("createSession", () => {
    it("creates a session with valid input", async () => {
      // Test
    });

    it("throws for invalid input", async () => {
      // Test
    });
  });
});
```

---

## Review Output

```markdown
## Test Review Summary

### Files Reviewed: 3

| File                  | Tests | Coverage | Independence | Naming | Assertions | Edge Cases | Errors | Security | Status  |
| --------------------- | ----- | -------- | ------------ | ------ | ---------- | ---------- | ------ | -------- | ------- |
| sessions.test.ts      | 12    | 95%      | ✅           | ✅     | ✅         | ✅         | ✅     | ✅       | ✅ PASS |
| turso-adapter.test.ts | 18    | 90%      | ✅           | ✅     | ✅         | ✅         | ✅     | ✅       | ✅ PASS |
| format-date.test.ts   | 3     | 100%     | ✅           | ✅     | ✅         | ✅         | N/A    | N/A      | ✅ PASS |

### Overall: ✅ HIGH QUALITY

### Total Tests: 33

### Average Coverage: 95%

### Flaky Tests: 0

### Issues Found: 0

### Recommendations:

- Consider adding performance tests for large datasets (future)
```

---

## Missing Test Detection

### Identify Untested Code

**Check for:**

- Functions without tests
- Services without tests
- Critical paths without coverage

**Example report:**

```markdown
## Missing Tests

### Untested Files:

- `services/analytics.ts` (0% coverage)

### Low Coverage:

- `adapters/cache-adapter.ts` (45% coverage)
  - Missing tests: `invalidateCache()`, `clearAll()`

### Untested Edge Cases:

- `services/sessions.ts`
  - Empty notes field (currently only tests with content)
  - Sessions with very long titles (max length boundary)
```

---

## Test Smells (Anti-Patterns)

### 1. Flaky Tests

**Symptom:** Tests pass sometimes, fail other times

**Causes:**

- Time-dependent code without mocking
- Async operations without proper awaits
- Shared state between tests

**Fix:**

```typescript
// ❌ Flaky (depends on timing)
it("creates session", () => {
  createSession({ title: "Test", notes: "Notes" }, "user-1");
  const sessions = getSessions("user-1");
  expect(sessions).toHaveLength(1);
});

// ✅ Not flaky (awaits async)
it("creates session", async () => {
  await createSession({ title: "Test", notes: "Notes" }, "user-1");
  const sessions = await getSessions("user-1");
  expect(sessions).toHaveLength(1);
});
```

### 2. Slow Tests

**Symptom:** Tests take > 1s per suite

**Causes:**

- Real database instead of in-memory
- No database cleanup between tests
- Too much setup

**Fix:**

```typescript
// ✅ Use in-memory database
beforeEach(() => {
  const turso = createClient({ url: ":memory:" });
  db = drizzle(turso);
});
```

### 3. Testing Implementation (Not Behavior)

**Symptom:** Tests break when refactoring

**Example (bad):**

```typescript
// ❌ Tests implementation
it("calls adapter.createSession", async () => {
  const spy = vi.spyOn(adapter, "createSession");
  await service.createSession(input, "user-1");
  expect(spy).toHaveBeenCalled();
});
```

**Example (good):**

```typescript
// ✅ Tests behavior
it("creates a session", async () => {
  const session = await service.createSession(input, "user-1");
  expect(session.title).toBe("Test Session");
});
```

---

## Checklist for Every Test File

- [ ] Co-located with implementation
- [ ] Uses `describe` blocks for organization
- [ ] Tests are independent
- [ ] Descriptive test names
- [ ] Specific assertions
- [ ] Edge cases covered
- [ ] Error cases covered
- [ ] Security tested (if applicable)
- [ ] Coverage > 80%
- [ ] All tests pass
- [ ] No flaky tests
- [ ] Tests are fast (< 1s per suite)

---

## Related Skills

- `/quality-engineer` - Testing strategy
- `/code-review` - Includes test coverage check
- `/pre-commit` - Runs tests before commit

---

**End of test-review skill**
