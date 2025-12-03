# Plaid Integration Setup Guide

This guide will help you set up Plaid for real bank connections in your banking application.

## Step 1: Get Plaid Credentials

1. **Sign up for Plaid:**
   - Go to https://dashboard.plaid.com/signup
   - Create an account (free tier available for development)

2. **Get your API keys:**
   - Log into the Plaid Dashboard
   - Go to "Team Settings" → "Keys"
   - Copy your:
     - `Client ID` (starts with `client_id_...`)
     - `Sandbox Secret` (for development)
     - `Development Secret` (for development)
     - `Production Secret` (for production - only after approval)

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox
```

**Environment Options:**
- `sandbox` - For testing with fake bank accounts
- `development` - For testing with real bank accounts (limited)
- `production` - For live production use (requires approval)

## Step 3: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Click "Connect Bank" button:**
   - The Plaid Link modal should open
   - In sandbox mode, use test credentials:
     - Username: `user_good`
     - Password: `pass_good`
   - Select a test institution (e.g., "First Platypus Bank")

3. **Verify connection:**
   - After connecting, your bank account should appear in the dashboard
   - Transactions should be synced automatically

## Step 4: Sandbox Test Credentials

Plaid provides test credentials for sandbox mode:

**Standard Test User:**
- Username: `user_good`
- Password: `pass_good`
- MFA: `1234` (if prompted)

**Error Scenarios (for testing):**
- Username: `user_bad` - Invalid credentials
- Username: `user_locked` - Account locked
- Username: `user_mfa` - Requires MFA (use `1234`)

**Test Institutions:**
- First Platypus Bank
- Bank of America (test)
- Chase (test)
- Wells Fargo (test)

## Step 5: Production Setup

Before going to production:

1. **Submit for Production Access:**
   - Go to Plaid Dashboard → "Access"
   - Complete the production access form
   - Wait for approval (usually 1-2 business days)

2. **Update Environment Variables:**
   ```env
   PLAID_ENV=production
   PLAID_SECRET=your_production_secret_here
   ```

3. **Update Webhook URLs:**
   - Configure webhooks in Plaid Dashboard
   - Set up endpoint to handle webhook events

## Troubleshooting

### Error: "Plaid is not configured"
- Check that `PLAID_CLIENT_ID` and `PLAID_SECRET` are set in `.env.local`
- Restart your development server after adding environment variables

### Error: "Failed to create link token"
- Verify your Plaid credentials are correct
- Check that `PLAID_ENV` matches your secret type (sandbox/development/production)

### Error: "Invalid public_token"
- Make sure you're using the correct environment
- Token expires after 4 hours - try connecting again

### Link Modal Not Opening
- Check browser console for errors
- Verify `react-plaid-link` is installed: `npm install react-plaid-link`
- Ensure Plaid script is loading correctly

## Security Notes

- **Never commit `.env.local`** - it's already in `.gitignore`
- **Never share your Plaid secrets** publicly
- **Use different secrets** for development and production
- **Rotate secrets** if they're accidentally exposed
- **Use environment-specific secrets** (sandbox vs production)

## Additional Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Link React Component](https://github.com/plaid/react-plaid-link)
- [Plaid API Reference](https://plaid.com/docs/api/)

