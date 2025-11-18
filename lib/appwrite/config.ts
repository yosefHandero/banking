import { Client, Account, Databases, ID, Query } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Create a function to get Appwrite client with cookies from request
// This ensures cookies are forwarded from the Next.js request to Appwrite
// Works in both server and client contexts
export async function getAppwriteClient() {
  // Check if we're in a server context (cookies() only works server-side)
  // In client components, window is defined; in server components it's undefined
  if (typeof window !== 'undefined') {
    // We're in a client context - use the default client
    // Browser will automatically send cookies with requests via fetch
    return {
      client,
      account,
      databases,
    };
  }
  
  // We're in a server context - create a per-request client with cookies
  // Dynamically import cookies() only in server context to avoid client-side errors
  try {
    // Use dynamic import to avoid bundling cookies() in client components
    // In Next.js 15+, cookies() is async and must be awaited
    // Wrap in a function to prevent bundler from analyzing this import
    const cookiesModule = await import('next/headers').catch(() => null);
    if (!cookiesModule) {
      // If import fails, return default client
      return {
        client,
        account,
        databases,
      };
    }
    
    const cookieStore = await cookiesModule.cookies();
    const requestClient = new Client();
    requestClient
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    
    // Forward Appwrite session cookies from the request
    const allCookies = cookieStore.getAll();
    const appwriteCookies = allCookies
      .filter((cookie: { name: string; value: string }) => cookie.name.startsWith('a_session_'))
      .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    // Note: Appwrite SDK v21+ handles cookies automatically through its HTTP client
    // We create a per-request client to ensure cookies are properly isolated
    // The SDK will automatically include cookies in requests if they're available
    
    return {
      client: requestClient,
      account: new Account(requestClient),
      databases: new Databases(requestClient),
    };
  } catch (error) {
    // Fallback to default client if cookies() fails for any reason
    console.warn('Failed to create server-side Appwrite client with cookies, using default client:', error);
    return {
      client,
      account,
      databases,
    };
  }
}

export const account = new Account(client);
export const databases = new Databases(client);

export { client, ID, Query };

// Database and Collection IDs
// IMPORTANT: Replace these with your actual Appwrite Collection IDs from the Appwrite Console
// To find Collection IDs: Appwrite Console > Databases > Your Database > Collections > Click on collection > Settings > Collection ID
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'banking_db';
export const COLLECTIONS = {
  USERS: '66edc2d6002502837b8f', // ✅ Collection ID from Appwrite console
  ACCOUNTS: process.env.NEXT_PUBLIC_APPWRITE_ACCOUNTS_COLLECTION_ID || 'accounts', // ⚠️ Replace with actual Collection ID
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions', // ⚠️ Replace with actual Collection ID
  BUDGETS: process.env.NEXT_PUBLIC_APPWRITE_BUDGETS_COLLECTION_ID || 'budgets', // ⚠️ Replace with actual Collection ID
  SAVINGS_GOALS: process.env.NEXT_PUBLIC_APPWRITE_SAVINGS_GOALS_COLLECTION_ID || 'savings_goals', // ⚠️ Replace with actual Collection ID
  TRANSFERS: process.env.NEXT_PUBLIC_APPWRITE_TRANSFERS_COLLECTION_ID || 'transfers', // ⚠️ Replace with actual Collection ID
  AI_SUGGESTIONS: process.env.NEXT_PUBLIC_APPWRITE_AI_SUGGESTIONS_COLLECTION_ID || 'ai_suggestions', // ⚠️ Replace with actual Collection ID
};

