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
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
}

