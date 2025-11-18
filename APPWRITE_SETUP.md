# Appwrite Collection Setup Guide

## Issue: Collection IDs Not Found (404 Errors)

The console is showing 404 errors because the collection IDs in `lib/appwrite/config.ts` are using collection names instead of actual Appwrite Collection IDs.

## How to Fix

### Step 1: Get Your Collection IDs from Appwrite Console

1. Go to your [Appwrite Console](https://cloud.appwrite.io)
2. Navigate to **Databases** > Select your database
3. Click on each collection (accounts, budgets, transactions, etc.)
4. Go to **Settings** tab
5. Copy the **Collection ID** (it looks like: `66edc2d6002502837b8f`)

### Step 2: Update Collection IDs

You have two options:

#### Option A: Update Environment Variables (Recommended)

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_APPWRITE_ACCOUNTS_COLLECTION_ID=your_accounts_collection_id_here
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=your_transactions_collection_id_here
NEXT_PUBLIC_APPWRITE_BUDGETS_COLLECTION_ID=your_budgets_collection_id_here
NEXT_PUBLIC_APPWRITE_SAVINGS_GOALS_COLLECTION_ID=your_savings_goals_collection_id_here
NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID=your_transfers_collection_id_here
NEXT_PUBLIC_APPWRITE_AI_SUGGESTIONS_COLLECTION_ID=your_ai_suggestions_collection_id_here
```

#### Option B: Update `lib/appwrite/config.ts` Directly

Replace the collection names with actual IDs:

```typescript
export const COLLECTIONS = {
  USERS: '66edc2d6002502837b8f', // ✅ Already correct
  ACCOUNTS: 'your_accounts_collection_id_here', // Replace this
  TRANSACTIONS: 'your_transactions_collection_id_here', // Replace this
  BUDGETS: 'your_budgets_collection_id_here', // Replace this
  SAVINGS_GOALS: 'your_savings_goals_collection_id_here', // Replace this
  TRANSFERS: 'your_transfers_collection_id_here', // Replace this
  AI_SUGGESTIONS: 'your_ai_suggestions_collection_id_here', // Replace this
};
```

### Step 3: Create Missing Collections (If Needed)

If collections don't exist, create them in Appwrite Console with these attributes:

#### Accounts Collection
- `userId` (string)
- `name` (string)
- `officialName` (string)
- `mask` (string)
- `type` (string)
- `subtype` (string)
- `currentBalance` (double)
- `availableBalance` (double)
- `institutionId` (string)
- `institutionName` (string)
- `appwriteItemId` (string)
- `sharableId` (string)

#### Budgets Collection
- `userId` (string)
- `category` (string)
- `limit` (double)
- `period` (string)
- `currentSpending` (double)
- `month` (integer, optional)
- `year` (integer)

#### Transactions Collection
- `userId` (string)
- `accountId` (string)
- `name` (string)
- `amount` (double)
- `type` (string)
- `category` (string)
- `paymentChannel` (string)
- `date` (string)
- `pending` (boolean)
- `image` (string, optional)
- `channel` (string)
- `senderBankId` (string)
- `receiverBankId` (string)

#### Savings Goals Collection
- `userId` (string)
- `name` (string)
- `targetAmount` (double)
- `currentAmount` (double)
- `targetDate` (string, optional)
- `description` (string, optional)

### Step 4: Set Collection Permissions

Make sure each collection has the correct permissions:
- **Read**: Users can read their own documents (use `userId` filter)
- **Create**: Authenticated users
- **Update**: Users can update their own documents
- **Delete**: Users can delete their own documents

## After Setup

1. Restart your Next.js dev server
2. Refresh your browser
3. The 404 errors should be gone!

## Current Status

✅ **USERS** collection ID is correctly configured  
⚠️ **ACCOUNTS** collection ID needs to be updated  
⚠️ **BUDGETS** collection ID needs to be updated  
⚠️ **TRANSACTIONS** collection ID needs to be updated  
⚠️ **SAVINGS_GOALS** collection ID needs to be updated  
⚠️ **TRANSFERS** collection ID needs to be updated  
⚠️ **AI_SUGGESTIONS** collection ID needs to be updated  

