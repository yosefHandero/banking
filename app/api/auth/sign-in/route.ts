import { NextRequest, NextResponse } from 'next/server';
import { signInAccount } from '@/lib/appwrite/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const session = await signInAccount(email, password);
    
    // Appwrite SDK for Node.js creates sessions server-side, but cookies are managed internally
    // The SDK's HTTP client handles cookies automatically, but they need to be forwarded to the browser
    // For email/password sessions, the session object doesn't expose a secret property
    // The SDK handles session cookies through its internal HTTP client when making requests
    
    // Create response - the session is created successfully
    // Note: For proper cookie handling in Next.js with Appwrite, consider:
    // 1. Using client-side authentication (browser SDK) for sign-in
    // 2. Or ensuring Appwrite and Next.js share the same domain for automatic cookie forwarding
    const response = NextResponse.json({ success: true, session });
    
    // The Appwrite SDK manages cookies internally, but for server-side sessions,
    // cookies need to be properly configured in Appwrite settings (same domain/subdomain)
    // or handled through client-side authentication
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
}

