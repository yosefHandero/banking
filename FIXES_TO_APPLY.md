# Code Fixes to Apply

This document contains the exact code changes needed to fix all identified issues.

---

## 🔴 CRITICAL FIXES

### Fix #1: Remove userId from PaymentTransferForm API Request

**File:** `components/PaymentTransferForm.tsx`

**Change:**
```typescript
// Line 20-23: Remove userId from interface
interface PaymentTransferFormProps {
  accounts: Account[];
  // Remove: userId: string;
}

// Line 25: Remove userId from destructuring
export default function PaymentTransferForm({ accounts }: PaymentTransferFormProps) {
  // Remove userId from destructuring

  // Line 59-65: Remove userId from request body
  const response = await fetch('/api/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Remove: userId,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      description: data.description || 'Transfer',
    }),
  });
```

**Also update:** `app/(root)/payment-transfer/page.tsx` line 40 - remove `userId` prop:
```typescript
// Change from:
<PaymentTransferForm accounts={accounts} userId={userInfo.userId} />

// To:
<PaymentTransferForm accounts={accounts} />
```

---

### Fix #2: Remove userId Query Parameter from AI Suggestions

**File:** `app/(root)/ai-insights/page.tsx`

**Change:**
```typescript
// Line 36: Remove userId from query string
// Change from:
const response = await fetch(`/api/ai/suggestions?userId=${userInfo.userId}`);

// To:
const response = await fetch(`/api/ai/suggestions`);
```

**Also update:** `components/AIInsightsWidget.tsx` line 22 - remove userId from query:
```typescript
// Change from:
const response = await fetch(`/api/ai/suggestions?userId=${userId}`);

// To:
const response = await fetch(`/api/ai/suggestions`);
```

---

## 🟠 MAJOR FIXES

### Fix #3: Convert Transaction History to Server Component

**File:** `app/(root)/transaction-history/page.tsx`

**Replace entire file with:**
```typescript
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getTransactions } from '@/lib/appwrite/transaction';
import { Transaction } from '@/types';
import HeaderBox from '@/components/HeaderBox';
import TransactionCard from '@/components/TransactionCard';
import TransactionFilters from '@/components/TransactionFilters';
import { redirect } from 'next/navigation';

export default async function TransactionHistoryPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  const transactions = await getTransactions(userInfo.userId);

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Transaction History"
        subtext="View and manage all your transactions"
      />

      <TransactionFiltersWrapper transactions={transactions} />

      <div className="flex flex-col gap-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-16 text-gray-600">No transactions found</p>
          </div>
        ) : (
          <>
            <p className="text-14 text-gray-600">
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-2">
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Create a separate client component for filters
'use client';

import { useState, useEffect } from 'react';
import TransactionFilters from '@/components/TransactionFilters';
import { Transaction } from '@/types';

function TransactionFiltersWrapper({ transactions }: { transactions: Transaction[] }) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.search) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return <TransactionFilters onFilterChange={handleFilterChange} />;
}
```

**Note:** This is a simplified version. You may need to adjust based on how TransactionFilters works. If filtering needs to be client-side, keep the filtering logic in a client component but fetch data server-side.

---

### Fix #4: Create Standardized Error Handling

**File:** `lib/api/errors.ts` (NEW FILE)

**Create:**
```typescript
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code 
      },
      { status: error.statusCode }
    );
  }
  
  // Don't leak internal error details in production
  const isDev = process.env.NODE_ENV === 'development';
  return NextResponse.json(
    { 
      error: isDev ? (error as Error).message : 'An error occurred',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}
```

**Update API routes to use this:**

**File:** `app/api/transfers/route.ts`
```typescript
import { handleApiError, UnauthorizedError, NotFoundError, ValidationError } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    // ... existing code ...
  } catch (error: any) {
    return handleApiError(error);
  }
}
```

---

### Fix #5: Add Input Validation Schemas

**File:** `lib/validation/transfers.ts` (NEW FILE)

**Create:**
```typescript
import { z } from 'zod';

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Source account is required'),
  toAccountId: z.string().min(1, 'Destination account is required'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount exceeds maximum limit')
    .refine((val) => {
      // Check decimal places (max 2)
      return val === Math.round(val * 100) / 100;
    }, 'Amount can have at most 2 decimal places'),
  description: z.string().max(500, 'Description too long').optional(),
});
```

**File:** `lib/validation/auth.ts` (NEW FILE)

**Create:**
```typescript
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
```

**File:** `lib/validation/ai.ts` (NEW FILE)

**Create:**
```typescript
import { z } from 'zod';

export const chatSchema = z.object({
  question: z.string()
    .min(1, 'Question is required')
    .max(1000, 'Question is too long'),
});
```

**Update API routes:**

**File:** `app/api/transfers/route.ts`
```typescript
import { transferSchema } from '@/lib/validation/transfers';
import { ValidationError } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    // ... auth checks ...
    
    const body = await request.json();
    
    // Validate input
    const validationResult = transferSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.errors);
    }
    
    const { fromAccountId, toAccountId, amount, description } = validationResult.data;
    
    // ... rest of code ...
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 🟡 MINOR FIXES

### Fix #6: Remove Unused userId Prop

**Already covered in Fix #1** - removing userId from PaymentTransferForm interface and usage.

---

### Fix #7: Create requireAuth Utility

**File:** `lib/auth/requireAuth.ts` (NEW FILE)

**Create:**
```typescript
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { redirect } from 'next/navigation';
import { User } from '@/types';

export async function requireAuth(): Promise<{ currentUser: any; userInfo: User }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  return { currentUser, userInfo };
}
```

**Update pages to use it:**

**Example:** `app/(root)/page.tsx`
```typescript
import { requireAuth } from '@/lib/auth/requireAuth';

export default async function Home() {
  const { userInfo } = await requireAuth();
  
  // ... rest of code using userInfo ...
}
```

---

### Fix #8: Add Loading States

**File:** `app/(root)/my-banks/loading.tsx` (NEW FILE)

**Create:**
```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
```

**Create similar files for:**
- `app/(root)/transaction-history/loading.tsx`
- `app/(root)/payment-transfer/loading.tsx`
- `app/(root)/budget/loading.tsx`
- `app/(root)/savings-goals/loading.tsx`
- `app/(root)/ai-insights/loading.tsx`
- `app/(root)/settings/loading.tsx`

---

### Fix #9: Image Path Consistency

**Status:** ✅ Already consistent - no changes needed

---

### Fix #10: Add Error Boundaries

**File:** `app/(root)/error.tsx` (NEW FILE)

**Create:**
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-24 font-semibold text-gray-900">Something went wrong!</h2>
      <p className="text-14 text-gray-600">{error.message}</p>
      <button 
        onClick={reset} 
        className="form-btn"
      >
        Try again
      </button>
    </div>
  );
}
```

**File:** `app/(auth)/error.tsx` (NEW FILE)

**Create similar error boundary for auth routes.**

---

## 📋 SUMMARY OF FILES TO MODIFY

### Files to Modify:
1. `components/PaymentTransferForm.tsx` - Remove userId prop and usage
2. `app/(root)/payment-transfer/page.tsx` - Remove userId prop
3. `app/(root)/ai-insights/page.tsx` - Remove userId from query
4. `components/AIInsightsWidget.tsx` - Remove userId from query
5. `app/(root)/transaction-history/page.tsx` - Convert to server component (or hybrid)

### Files to Create:
1. `lib/api/errors.ts` - Error handling utilities
2. `lib/validation/transfers.ts` - Transfer validation schema
3. `lib/validation/auth.ts` - Auth validation schemas
4. `lib/validation/ai.ts` - AI validation schema
5. `lib/auth/requireAuth.ts` - Auth utility function
6. `app/(root)/error.tsx` - Error boundary
7. `app/(auth)/error.tsx` - Error boundary
8. Multiple `loading.tsx` files for routes

### Files to Update (with new utilities):
- All API route files to use error handling and validation
- All page files to use `requireAuth()` utility

---

## ✅ TESTING CHECKLIST

After applying fixes, test:

1. ✅ Payment transfer works without userId in request
2. ✅ AI suggestions work without userId in query
3. ✅ All pages still authenticate correctly
4. ✅ Error handling works consistently
5. ✅ Input validation catches invalid data
6. ✅ Loading states appear during page loads
7. ✅ Error boundaries catch and display errors gracefully

---

**Note:** Some fixes (like converting to server components) may require more careful consideration based on the specific interactive features needed. Review each page individually before making changes.

