# security-review - Security Review Skill

**Status:** Active
**Purpose:** Perform comprehensive security audit on code changes

---

## What This Skill Does

The **security-review** skill audits code for security vulnerabilities:

1. Identifies security-sensitive files
2. Checks authentication and authorization
3. Validates input validation (Zod)
4. Checks for SQL injection vectors
5. Checks for XSS vulnerabilities
6. Audits environment variable usage
7. Fixes violations immediately

---

## Usage

```bash
/security-review              # Review all changed files
/security-review <file-path>  # Review specific file
```

---

## Security Checklist

### 1. Authentication

**Check:**

- [ ] Protected routes call `auth()` from NextAuth
- [ ] Redirect if `userId` is null
- [ ] API routes check `auth()` and return 401 if unauthorized
- [ ] Server Actions check `auth()` and throw if unauthorized

**Violations:**

- ❌ Route renders without auth check
- ❌ API route doesn't check auth
- ❌ Server Action doesn't check auth

### 2. Authorization

**Check:**

- [ ] All service functions take `userId` parameter
- [ ] All database queries filter by `userId`
- [ ] Users can only access their own data
- [ ] No IDOR vulnerabilities (Insecure Direct Object Reference)

**Violations:**

- ❌ Query without `userId` filter
- ❌ Service function missing `userId` parameter
- ❌ User can access other users' data

### 3. Input Validation

**Check:**

- [ ] All user input validated with Zod schemas
- [ ] Validation at trust boundaries (service layer)
- [ ] Max length limits on strings (prevent DoS)
- [ ] Proper types (no `any`)

**Violations:**

- ❌ No Zod schema for user input
- ❌ Validation skipped
- ❌ No max length on strings

### 4. SQL Injection

**Check:**

- [ ] Uses Drizzle ORM (parameterized queries)
- [ ] No raw SQL with string interpolation
- [ ] If raw SQL, uses `sql` tagged template

**Violations:**

- ❌ Raw SQL with string interpolation: `SELECT * FROM table WHERE id = '${id}'`
- ❌ `db.execute()` with concatenated strings

### 5. XSS (Cross-Site Scripting)

**Check:**

- [ ] React auto-escaping used (default)
- [ ] No `dangerouslySetInnerHTML` with user input
- [ ] If Markdown, uses DOMPurify

**Violations:**

- ❌ `dangerouslySetInnerHTML` with user content
- ❌ Unsanitized HTML rendering

### 6. CSRF (Cross-Site Request Forgery)

**Check:**

- [ ] Using NextAuth (CSRF protection built-in)
- [ ] Server Actions used (CSRF-protected by default)
- [ ] No custom session management

**Violations:**

- ❌ Custom session cookies without CSRF tokens
- ❌ Bypassing NextAuth's session validation

### 7. Environment Variables

**Check:**

- [ ] No hardcoded secrets in code
- [ ] Secrets in `.env.local` (gitignored)
- [ ] Public variables prefixed with `NEXT_PUBLIC_`
- [ ] Private variables never exposed to client

**Violations:**

- ❌ Hardcoded API keys
- ❌ Secret in client code
- ❌ `.env` file committed

### 8. Mass Assignment

**Check:**

- [ ] Only validated fields inserted into database
- [ ] `userId` always set by server (never from input)
- [ ] No spreading of raw user input into database operations

**Violations:**

- ❌ `db.insert(table).values(userInput)`
- ❌ User can set `userId` via input

### 9. Rate Limiting (Future)

**Check:**

- [ ] Rate limiting on auth endpoints (NextAuth handles)
- [ ] Rate limiting on API routes (future)

### 10. Logging

**Check:**

- [ ] No sensitive data logged (passwords, tokens)
- [ ] No PII logged without consent
- [ ] Error messages don't reveal system details

**Violations:**

- ❌ Logging passwords or tokens
- ❌ Error messages with stack traces to users

---

## Review Output

```markdown
## Security Review Summary

### Files Reviewed: 3

| File                                        | Auth | Authz | Input Val | SQL Inj | XSS | CSRF | Env Vars | Mass Assign | Status  |
| ------------------------------------------- | ---- | ----- | --------- | ------- | --- | ---- | -------- | ----------- | ------- |
| apps/web/src/app/sessions/page.tsx          | ✅   | ✅    | N/A       | N/A     | ✅  | ✅   | ✅       | N/A         | ✅ PASS |
| packages/core/src/services/sessions.ts      | N/A  | ✅    | ✅        | N/A     | N/A | N/A  | ✅       | ✅          | ✅ PASS |
| packages/core/src/adapters/turso-adapter.ts | N/A  | ✅    | N/A       | ✅      | N/A | N/A  | ✅       | N/A         | ✅ PASS |

### Overall: ✅ SECURE

### Vulnerabilities Found: 0

### Vulnerabilities Fixed: 0

### Recommendations:

- Consider adding rate limiting to API routes (future)
```

---

## Common Vulnerabilities & Fixes

### IDOR (Insecure Direct Object Reference)

**Vulnerability:**

```typescript
// ❌ User can access any session
async getSession(id: string) {
  return db.select().from(sessions).where(eq(sessions.id, id))
}
```

**Fix:**

```typescript
// ✅ User can only access their own sessions
async getSession(id: string, userId: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .where(eq(sessions.userId, userId))
}
```

### Missing Input Validation

**Vulnerability:**

```typescript
// ❌ No validation
async createSession(input: any, userId: string) {
  return adapter.createSession(input, userId)
}
```

**Fix:**

```typescript
// ✅ Validated input
import { CreateSessionInputSchema } from '../types/session'

async createSession(input: CreateSessionInput, userId: string) {
  const validated = CreateSessionInputSchema.parse(input)
  return adapter.createSession(validated, userId)
}
```

### SQL Injection

**Vulnerability:**

```typescript
// ❌ SQL injection vector
const query = `SELECT * FROM sessions WHERE id = '${id}'`;
await db.execute(query);
```

**Fix:**

```typescript
// ✅ Parameterized query
const sessions = await db.select().from(sessions).where(eq(sessions.id, id));
```

---

## Related Skills

- `/security-engineer` - Security persona
- `/code-review` - Includes security checks
- `/pre-commit` - Includes security audit

---

**End of security-review skill**
