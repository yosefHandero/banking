# Environment Setup Guide

This guide will help you set up your `.env.local` file for the banking application.

## Step 1: Create .env.local File

Create a file named `.env.local` in the root directory of your project (same level as `package.json`).

## Step 2: Get Your Appwrite Credentials

1. **Sign up/Login to Appwrite:**
   - Go to https://cloud.appwrite.io
   - Create an account or sign in

2. **Create a Project:**
   - Click "Create Project"
   - Give it a name (e.g., "Banking App")
   - Copy the Project ID

3. **Create a Database:**
   - In your project, go to "Databases"
   - Click "Create Database"
   - Give it a name (e.g., "BankingDB")
   - Copy the Database ID

4. **Create Collections:**
   - Follow the schema in `APPWRITE_SCHEMA.md`
   - For each collection, copy the Collection ID

5. **Create API Key:**
   - Go to "Settings" → "API Keys"
   - Click "Create API Key"
   - Give it a name (e.g., "Server Key")
   - Select "Full Access" or appropriate scopes
   - Copy the API Key (you'll only see it once!)

## Step 3: Configure .env.local

Copy this template into your `.env.local` file and fill in your values:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_URL=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
APPWRITE_API_KEY=your_api_key_here

# Collection IDs (optional - defaults are provided, but recommended to set explicitly)
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_users_collection_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
NEXT_PUBLIC_APPWRITE_ACCOUNTS_COLLECTION_ID=your_accounts_collection_id
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=your_transactions_collection_id
NEXT_PUBLIC_APPWRITE_BUDGETS_COLLECTION_ID=your_budgets_collection_id
NEXT_PUBLIC_APPWRITE_SAVINGS_GOALS_COLLECTION_ID=your_goals_collection_id
NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID=your_transfers_collection_id
NEXT_PUBLIC_APPWRITE_AI_SUGGESTIONS_COLLECTION_ID=your_ai_suggestions_collection_id
NEXT_PUBLIC_APPWRITE_BANKS_COLLECTION_ID=your_banks_collection_id
```

## Step 4: Verify Setup

1. Restart your development server after creating `.env.local`
2. Try to sign up or connect a bank account
3. If you get errors, check:
   - All environment variables are set correctly
   - Collection IDs match your Appwrite collections
   - Collection schemas match `APPWRITE_SCHEMA.md`
   - API key has proper permissions

## Troubleshooting

### Error: "Missing required environment variable"
- Make sure `.env.local` exists in the root directory
- Check that variable names match exactly (case-sensitive)
- Restart your development server after changes

### Error: "Collection not found"
- Verify collection IDs in `.env.local` match your Appwrite collections
- Check that collections exist in your Appwrite database

### Error: "Unknown attribute"
- Check `APPWRITE_SCHEMA.md` for required attributes
- Ensure all attributes exist in your Appwrite collection schema
- Verify attribute types match (String, Integer, Double, DateTime, Enum)

### Error: "No session"
- Make sure you're signed in
- Check that cookies are enabled in your browser
- Verify session cookie is being set correctly

## Security Notes

- **Never commit `.env.local` to git** - it's already in `.gitignore`
- **Never share your API key** publicly
- **Use different API keys** for development and production
- **Rotate API keys** if they're accidentally exposed

