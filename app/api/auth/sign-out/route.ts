import { NextRequest, NextResponse } from 'next/server';
import { signOutAccount } from '@/lib/appwrite/user';

export async function POST(request: NextRequest) {
  try {
    await signOutAccount();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign out' },
      { status: 500 }
    );
  }
}

