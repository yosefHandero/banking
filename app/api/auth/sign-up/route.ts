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
    if (error.message && error.message.includes('Collection')) {
      return NextResponse.json(
        { 
          error: 'Database collection not found. Please create a "users" collection in your Appwrite database with the following attributes: userId (string), email (string), firstName (string), lastName (string), address1 (string), city (string), state (string), postalCode (string), dateOfBirth (string), ssn (string), dwollaCustomerId (string), dwollaCustomerUrl (string)' 
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

