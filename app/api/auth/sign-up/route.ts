import { NextRequest, NextResponse } from 'next/server';
import { createUserAccount } from '@/lib/appwrite/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, address1, city, state, postalCode, dateOfBirth, ssn } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createUserAccount({
      email,
      password,
      firstName,
      lastName,
      address1: address1 || '',
      city: city || '',
      state: state || '',
      postalCode: postalCode || '',
      dateOfBirth: dateOfBirth || '',
      ssn: ssn || '',
    });

    return NextResponse.json({ success: true, user: result.user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

