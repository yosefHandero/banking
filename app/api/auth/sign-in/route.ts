import { NextRequest, NextResponse } from 'next/server';
import { signInAccount } from '@/lib/appwrite/user';
import { getErrorMessage } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Basic password length validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const session = await signInAccount(email, password);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: true, session });
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to sign in');
    // Don't expose internal error details in production
    const publicMessage = process.env.NODE_ENV === 'development' 
      ? errorMessage
      : 'Failed to sign in. Please check your credentials.';
    
    const status = errorMessage.includes('Invalid') || errorMessage.includes('401') ? 401 : 500;
    
    return NextResponse.json(
      { error: publicMessage },
      { status }
    );
  }
}

