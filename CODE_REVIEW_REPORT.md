# Comprehensive Code Review Report

**Generated:** $(date)
**Project:** Banking Application (Next.js + Appwrite)

---

## Executive Summary

This banking application has **critical security vulnerabilities** that must be addressed immediately, particularly around authorization, data protection, and input validation. The codebase shows good structure but needs significant security hardening before production use.

---

## 🔴 CRITICAL ISSUES

### 1. **Missing Authorization Checks in API Routes**

**Severity:** CRITICAL  
**Files:**

- `app/api/transfers/route.ts`
- `app/api/ai/suggestions/route.ts`
- `app/api/ai/chat/route.ts`

**Issue:** API routes accept `userId` from request body without verifying the authenticated user matches. An attacker can manipulate any user's data.

**Example:**

```typescript
// app/api/transfers/route.ts:10
const { userId, fromAccountId, toAccountId, amount, description } = body;
// No check that userId matches the authenticated user!
```

**Fix:**

```typescript
// Add to all API routes:
import { getCurrentUser } from "@/lib/appwrite/user";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  // Use currentUser.$id instead of body.userId
  const userId = currentUser.$id;
  // ... rest of code
}
```

---

### 2. **Account Access Control Missing**

**Severity:** CRITICAL  
**Files:**

- `app/(root)/my-banks/[id]/page.tsx:27`
- `lib/appwrite/account.ts:70-95`

**Issue:** Any authenticated user can access any account by guessing/using another user's account ID. No verification that the account belongs to the user.

**Example:**

```typescript
// app/(root)/my-banks/[id]/page.tsx:27
const account = await getAccount(params.id);
// No check: if (account.userId !== userInfo.userId)
```

**Fix:**

```typescript
// In app/(root)/my-banks/[id]/page.tsx
const account = await getAccount(params.id);
if (!account || account.userId !== userInfo.userId) {
  redirect('/my-banks');
}

// In lib/appwrite/account.ts - add userId check
export async function getAccount(accountId: string, userId?: string): Promise<Account | null> {
  const account = await databases.getDocument(...);
  if (userId && account.userId !== userId) {
    return null; // Or throw unauthorized error
  }
  return account;
}
```

---

### 3. **SSN Stored in Plain Text**

**Severity:** CRITICAL  
**Files:**

- `lib/appwrite/user.ts:30`
- `types/index.d.ts:41`

**Issue:** Social Security Numbers are stored unencrypted in the database. This violates PCI-DSS and GDPR requirements.

**Fix:**

```typescript
// Use encryption before storing:
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString("hex");
}
```

---

### 4. **Incorrect Database Client Usage**

**Severity:** CRITICAL  
**Files:**

- `lib/appwrite/account.ts`
- `lib/appwrite/budget.ts`
- `lib/appwrite/goals.ts`
- `lib/appwrite/transaction.ts`

**Issue:** These files use the global `databases` export instead of `getAppwriteClient()`, breaking server-side cookie handling and session management.

**Example:**

```typescript
// lib/appwrite/account.ts:17
const account = await databases.createDocument(...);
// Should use: const { databases } = await getAppwriteClient();
```

**Fix:** Replace all `databases` imports with `getAppwriteClient()` calls:

```typescript
import { getAppwriteClient, ID, Query, COLLECTIONS, DATABASE_ID } from './config';

export async function createBankAccount(...) {
  const { databases } = await getAppwriteClient();
  const account = await databases.createDocument(...);
}
```

---

### 5. **Missing Input Validation on Server**

**Severity:** CRITICAL  
**Files:**

- `app/api/auth/sign-up/route.ts`
- `app/api/transfers/route.ts`

**Issue:** Server-side validation is minimal. No SSN format validation, email format validation, or amount limits.

**Fix:**

```typescript
// Add validation schemas
import { z } from "zod";

const ssnSchema = z
  .string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX");
const amountSchema = z
  .number()
  .positive()
  .max(1000000, "Amount exceeds maximum");

// In sign-up route:
const validatedData = signUpSchema.parse(body);
// In transfers route:
if (amount > 1000000) {
  return NextResponse.json(
    { error: "Amount exceeds maximum" },
    { status: 400 }
  );
}
```

---

## 🟠 MAJOR ISSUES

### 6. **No Rate Limiting**

**Severity:** MAJOR  
**Files:** All API routes

**Issue:** API endpoints can be abused with unlimited requests, leading to DoS or brute force attacks.

**Fix:** Implement rate limiting middleware:

```typescript
// lib/rateLimit.ts
import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (request: NextRequest) => {
    const ip = request.ip || "unknown";
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (record.count >= maxRequests) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    record.count++;
    return null;
  };
}
```

---

### 7. **Missing Transaction Rollback**

**Severity:** MAJOR  
**Files:**

- `app/api/transfers/route.ts:64-109`

**Issue:** If balance update succeeds but transaction creation fails, accounts will be inconsistent.

**Fix:** Use database transactions or implement rollback logic:

```typescript
// Store original balances
const originalFromBalance = fromAccount.currentBalance;
const originalToBalance = toAccount.currentBalance;

try {
  await updateAccountBalance(...);
  await createTransaction(...);
} catch (error) {
  // Rollback
  await updateAccountBalance(fromAccountId, originalFromBalance, ...);
  await updateAccountBalance(toAccountId, originalToBalance, ...);
  throw error;
}
```

---

### 8. **No Pagination**

**Severity:** MAJOR  
**Files:**

- `lib/appwrite/transaction.ts:47-82`
- `lib/appwrite/account.ts:43-67`
- `lib/appwrite/budget.ts:44-76`

**Issue:** All list queries fetch all records, causing performance issues with large datasets.

**Fix:**

```typescript
export async function getTransactions(
  userId: string,
  accountId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: Transaction[]; total: number }> {
  const queries = [
    Query.equal('userId', userId),
    Query.limit(limit),
    Query.offset(offset),
  ];

  if (accountId) {
    queries.push(Query.equal('accountId', accountId));
  }

  const result = await databases.listDocuments(...);
  return {
    transactions: result.documents.map(...),
    total: result.total,
  };
}
```

---

### 9. **TypeScript Type Issues**

**Severity:** MAJOR  
**Files:**

- `types/index.d.ts`

**Issue:** Using `declare type` instead of proper TypeScript types/exports. This prevents proper type checking and IntelliSense.

**Fix:**

```typescript
// Replace declare type with export type/interface
export type SignUpParams = {
  firstName: string;
  lastName: string;
  // ...
};

export interface User {
  $id: string;
  email: string;
  // ...
}
```

---

### 10. **Inconsistent Error Handling**

**Severity:** MAJOR  
**Files:** Throughout codebase

**Issue:** Some functions return `null` on error, others throw, some return empty arrays. No standardized error handling.

**Fix:** Create error handling utilities:

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", 401, "UNAUTHORIZED");
  }
}
```

---

## 🟡 MINOR ISSUES

### 11. **Console.error Instead of Proper Logging**

**Severity:** MINOR  
**Files:** Multiple files

**Issue:** Using `console.error` instead of a proper logging library. No log levels, no structured logging.

**Fix:** Implement proper logging:

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
  },
});
```

---

### 12. **Duplicate Code in AuthForm**

**Severity:** MINOR  
**Files:**

- `components/AuthForm.tsx:50-81` and `96-123`

**Issue:** Session creation logic is duplicated between sign-in and sign-up flows.

**Fix:** Extract to helper function:

```typescript
async function createSession(email: string, password: string) {
  const client = new Client();
  client
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_URL || "https://cloud.appwrite.io/v1"
    )
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

  const account = new Account(client);

  try {
    await account.createEmailPasswordSession(email, password);
    return true;
  } catch (sessionError: any) {
    if (sessionError.message?.includes("session is active")) {
      try {
        await account.get();
        return true;
      } catch {
        await account.deleteSessions();
        await account.createEmailPasswordSession(email, password);
        return true;
      }
    }
    throw sessionError;
  }
}
```

---

### 13. **Missing Environment Variable Validation**

**Severity:** MINOR  
**Files:**

- `lib/appwrite/config.ts`
- `lib/openai/suggestions.ts`

**Issue:** Environment variables are used without validation, leading to runtime errors.

**Fix:**

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APPWRITE_URL: z.string().url(),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APPWRITE_URL: process.env.NEXT_PUBLIC_APPWRITE_URL,
  // ...
});
```

---

### 14. **Hardcoded Test Credentials**

**Severity:** MINOR  
**Files:**

- `constants/index.ts:24-50`

**Issue:** Test credentials and tokens are committed to the repository.

**Fix:** Move to `.env.local` and add to `.gitignore`.

---

### 15. **Missing Error Boundaries**

**Severity:** MINOR  
**Files:** All page components

**Issue:** No React error boundaries to catch and handle component errors gracefully.

**Fix:** Add error boundary component:

```typescript
// components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

---

### 16. **Duplicate Middleware Files**

**Severity:** MINOR  
**Files:**

- `middleware.ts`
- `lib/middleware.ts`

**Issue:** Two middleware files, one just re-exports the other.

**Fix:** Remove `lib/middleware.ts` and keep only `middleware.ts`.

---

### 17. **Missing Query Parameter Validation**

**Severity:** MINOR  
**Files:**

- `app/api/ai/suggestions/route.ts:11`

**Issue:** `userId` from query params is not validated (could be empty string, special chars, etc.).

**Fix:**

```typescript
const userId = searchParams.get("userId");
if (!userId || userId.trim().length === 0 || !/^[a-zA-Z0-9]+$/.test(userId)) {
  return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
}
```

---

### 18. **Inefficient Database Queries**

**Severity:** MINOR  
**Files:**

- `app/(root)/page.tsx:25-28`

**Issue:** Multiple sequential database calls that could be parallelized.

**Fix:**

```typescript
const [accounts, transactions, budgets, goals] = await Promise.all([
  getAccounts(userInfo.userId),
  getTransactions(userInfo.userId),
  getBudgets(userInfo.userId),
  getSavingsGoals(userInfo.userId),
]);
```

---

### 19. **Missing Type Exports**

**Severity:** MINOR  
**Files:**

- `lib/appwrite/budget.ts:3-12`
- `lib/appwrite/goals.ts:3-11`

**Issue:** Types are defined but not exported, making them unusable elsewhere.

**Fix:** Add `export` keyword to type definitions.

---

### 20. **Incorrect Query Syntax**

**Severity:** MINOR  
**Files:**

- `lib/appwrite/transaction.ts:55-59`

**Issue:** `Query.orderDesc` is passed as a separate array parameter, but Appwrite expects it in the queries array.

**Fix:**

```typescript
const transactions = await databases.listDocuments(
  DATABASE_ID,
  COLLECTIONS.TRANSACTIONS,
  [
    Query.equal("userId", userId),
    Query.orderDesc("date"),
    ...(accountId ? [Query.equal("accountId", accountId)] : []),
  ]
);
```

---

## 📁 FOLDER STRUCTURE SUGGESTIONS

### Current Structure Issues:

1. API routes mixed with pages
2. No separation between domain logic and infrastructure
3. Types in root instead of organized structure

### Recommended Structure:

```
app/
  (auth)/
  (root)/
  api/
    auth/
    transfers/
    ai/
lib/
  appwrite/
    config.ts
    user.ts
    account.ts
    transaction.ts
    budget.ts
    goals.ts
  openai/
  utils/
  errors/        # NEW: Error classes
  validation/    # NEW: Validation schemas
  logger.ts      # NEW: Logging utility
types/
  index.ts
  appwrite.ts    # NEW: Appwrite-specific types
  api.ts         # NEW: API request/response types
components/
  ui/
  forms/         # NEW: Form components
  layout/        # NEW: Layout components
```

---

## 🎯 PRIORITY ACTION ITEMS

### Immediate (This Week):

1. ✅ Fix authorization checks in all API routes
2. ✅ Add account ownership verification
3. ✅ Encrypt SSN storage
4. ✅ Fix database client usage (use getAppwriteClient everywhere)
5. ✅ Add server-side input validation

### Short-term (This Month):

6. Implement rate limiting
7. Add transaction rollback logic
8. Implement pagination
9. Fix TypeScript type definitions
10. Standardize error handling

### Long-term (Next Sprint):

11. Add proper logging
12. Refactor duplicate code
13. Add error boundaries
14. Optimize database queries
15. Improve folder structure

---

## 📊 METRICS

- **Total Issues Found:** 20
- **Critical:** 5
- **Major:** 5
- **Minor:** 10
- **Files Affected:** ~25
- **Estimated Fix Time:** 2-3 weeks

---

## 🔒 SECURITY CHECKLIST

- [ ] All API routes verify user identity
- [ ] Account access is restricted to owners
- [ ] Sensitive data (SSN) is encrypted
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CSRF protection added
- [ ] SQL injection prevention (N/A - using Appwrite)
- [ ] XSS prevention (React handles this)
- [ ] Environment variables validated
- [ ] Error messages don't leak sensitive info

---

## 📝 NOTES

- The codebase shows good understanding of Next.js App Router
- Appwrite integration is mostly correct but needs cookie handling fixes
- TypeScript usage could be more strict
- Consider adding unit tests for critical functions
- Consider adding integration tests for API routes

---

**Report Generated By:** AI Code Reviewer  
**Review Date:** $(date)
