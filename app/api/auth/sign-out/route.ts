import { NextRequest, NextResponse } from 'next/server';
import { signOutAccount } from '@/lib/appwrite/user';
import { getErrorMessage } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    await signOutAccount();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to sign out') },
      { status: 500 }
    );
  }
}

