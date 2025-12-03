import { NextRequest, NextResponse } from 'next/server';
import { createUserAccount } from '@/lib/appwrite/user';
import { getErrorMessage, isErrorType } from '@/lib/utils/errors';

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

    // ⚠️ SECURITY WARNING: SSN is stored in plain text
    // CRITICAL: This is a security risk. SSN encryption MUST be implemented before production.
    // See SECURITY.md for implementation guidance and security considerations.
    if (ssn && typeof ssn === 'string') {
      // Basic SSN format validation (XXX-XX-XXXX or XXXXXXXXX)
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      if (!ssnRegex.test(ssn.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: 'Invalid SSN format' },
          { status: 400 }
        );
      }
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
  } catch (error) {
    const errorMsg = getErrorMessage(error, 'Failed to create account');
    
    // Return detailed error messages for schema/configuration issues
    if (isErrorType(error, 'Schema Error') || isErrorType(error, 'Unknown attribute')) {
      return NextResponse.json(
        { 
          error: errorMsg + '\n\nSee README_SCHEMA.md for complete schema documentation.'
        },
        { status: 500 }
      );
    }
    
    if (isErrorType(error, 'Collection Error') || isErrorType(error, 'Collection not found')) {
      return NextResponse.json(
        { 
          error: errorMsg + '\n\nPlease verify your Appwrite configuration in .env.local. See ENV_SETUP.md for setup instructions.'
        },
        { status: 500 }
      );
    }
    
    if (isErrorType(error, 'Missing required environment variable')) {
      return NextResponse.json(
        { 
          error: errorMsg + '\n\nSee ENV_SETUP.md for complete setup instructions.'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

