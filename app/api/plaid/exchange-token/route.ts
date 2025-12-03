import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode } from 'plaid';
import { createBankAccount } from '@/lib/appwrite/account';
import { createTransaction } from '@/lib/appwrite/transaction';
import { getCurrentUser } from '@/lib/appwrite/user';
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicToken } = body;

    if (!publicToken) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
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

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Fetch accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    
    // Check if Plaid returned any accounts
    if (!accounts || accounts.length === 0) {
      console.error('No accounts returned from Plaid');
      return NextResponse.json(
        { error: 'No accounts found. Please make sure you have accounts connected in Plaid.' },
        { status: 400 }
      );
    }

    const institution = accountsResponse.data.item.institution_id 
      ? await plaidClient.institutionsGetById({
          institution_id: accountsResponse.data.item.institution_id,
          country_codes: [CountryCode.Us],
        })
      : null;

    const institutionName = institution?.data.institution?.name || 'Unknown Bank';
    const institutionId = accountsResponse.data.item.institution_id || '';

    console.log(`Processing ${accounts.length} account(s) from ${institutionName} (institution_id: ${institutionId})`);

    // Create accounts in database
    const createdAccounts = [];
    const accountErrors: string[] = [];
    
    for (const account of accounts) {
      try {
        console.log(`Creating account: ${account.name} (${account.type}/${account.subtype})`);
        
        const bankAccount = await createBankAccount({
          userId,
          name: account.name,
          officialName: account.official_name || account.name,
          mask: account.mask || '',
          type: account.type || 'depository',
          subtype: account.subtype || 'checking',
          currentBalance: account.balances.current || 0,
          availableBalance: account.balances.available || account.balances.current || 0,
          institutionId,
          institutionName,
        });

        console.log(`✅ Successfully created account: ${bankAccount.$id}`);
        createdAccounts.push(bankAccount);

        // Fetch transactions for this account
        try {
          const transactionsResponse = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
            end_date: new Date().toISOString().split('T')[0],
            options: {
              account_ids: [account.account_id],
            },
          });

          const transactions = transactionsResponse.data.transactions || [];
          
          // Create transactions in database
          for (const transaction of transactions.slice(0, 100)) { // Limit to 100 transactions
            try {
              // Plaid amounts are positive for debits (money out) and negative for credits (money in)
              const amount = Math.abs(transaction.amount);
              const isDebit = transaction.amount > 0; // Positive = debit (money out)
              
              await createTransaction({
                userId,
                accountId: bankAccount.$id,
                name: transaction.name,
                amount,
                type: isDebit ? 'withdrawal' : 'deposit',
                category: transaction.category?.[0] || transaction.category?.[1] || 'Other',
                paymentChannel: transaction.payment_channel || 'other',
                date: transaction.date,
                pending: transaction.pending || false,
                image: '',
                channel: transaction.payment_channel || 'other',
                senderBankId: isDebit ? bankAccount.$id : '',
                receiverBankId: !isDebit ? bankAccount.$id : '',
              });
            } catch (txError) {
              console.warn('Failed to create transaction:', txError);
              // Continue with other transactions
            }
          }
        } catch (txError) {
          console.warn('Failed to fetch transactions:', getErrorMessage(txError));
          // Account was created but transactions failed - continue
        }
      } catch (accountError) {
        const errorMessage = getErrorMessage(accountError);
        console.error(`❌ Failed to create account "${account.name}":`, errorMessage);
        accountErrors.push(`${account.name}: ${errorMessage}`);
        // Continue with other accounts
      }
    }

    if (createdAccounts.length === 0) {
      const errorDetails = accountErrors.length > 0 
        ? ` Errors: ${accountErrors.join('; ')}`
        : ' No accounts were returned from Plaid.';
      
      console.error(`❌ No accounts created.${errorDetails}`);
      
      return NextResponse.json(
        { 
          error: `No accounts were created.${errorDetails} Please check your Appwrite configuration and account schema.`,
          details: accountErrors.length > 0 ? accountErrors : undefined
        },
        { status: 400 }
      );
    }
    
    // Log success
    console.log(`✅ Successfully created ${createdAccounts.length} out of ${accounts.length} account(s)`);

    return NextResponse.json({
      success: true,
      accountsCreated: createdAccounts.length,
      message: `${institutionName} connected successfully! ${createdAccounts.length} account(s) added.`,
    });
  } catch (error) {
    console.error('Error exchanging token:', getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to connect bank') },
      { status: 500 }
    );
  }
}

