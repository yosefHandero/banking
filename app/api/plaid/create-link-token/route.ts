import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';
import { getErrorMessage } from '@/lib/utils/errors';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { getCurrentUser } = await import('@/lib/appwrite/user');
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use authenticated user's ID, not client-provided userId (security)
    const userId = currentUser.$id;

    // Validate Plaid environment variables
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return NextResponse.json(
        { 
          error: 'Plaid is not configured. Please add PLAID_CLIENT_ID and PLAID_SECRET to your .env.local file.' 
        },
        { status: 500 }
      );
    }

    // Create link token with authenticated user's ID
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: process.env.PLAID_CLIENT_NAME || 'Banking App',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return NextResponse.json({
      linkToken: linkTokenResponse.data.link_token,
    });
  } catch (error) {
    console.error('Error creating link token:', getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to create link token') },
      { status: 500 }
    );
  }
}

