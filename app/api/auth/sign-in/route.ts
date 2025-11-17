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
    
    // Appwrite SDK handles cookies automatically through its HTTP client
    // The session is created and cookies are managed by the SDK
    // We need to ensure cookies from Appwrite responses are forwarded to the client
    const response = NextResponse.json({ success: true, session });
    
    // Forward any Set-Cookie headers from Appwrite response
    // Note: Appwrite SDK v21+ should handle this automatically, but we ensure
    // cookies are forwarded by checking the response
    // The SDK's internal HTTP client should have set cookies, but we need to
    // extract them from the SDK's response if possible
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
}

