"use server";

import { createAdminClient, createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { User, SignUpParams } from '@/types';
import { cookies } from "next/headers";
import { parseStringify } from '@/lib/utils';

export async function createUserAccount(userData: SignUpParams) {
  try {
    const { account, database } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      userData.email,
      userData.password,
      `${userData.firstName} ${userData.lastName}`
    );

    if (!newUserAccount) throw new Error('Error creating user');

    const session = await account.createEmailPasswordSession(userData.email, userData.password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // ⚠️ SECURITY WARNING: SSN is stored in plain text
    // CRITICAL: This is a security risk. SSN encryption MUST be implemented before production.
    // See SECURITY.md for implementation guidance and security considerations.
    // TODO: Implement SSN encryption using field-level encryption (AES-256-GCM recommended)
    const newUser = await database.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      ID.unique(),
      {
        userId: newUserAccount.$id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        address1: userData.address1 || '',
        city: userData.city || '',
        state: userData.state || '',
        postalCode: userData.postalCode || '',
        dateOfBirth: userData.dateOfBirth || '',
        ssn: userData.ssn || '', // ⚠️ Should be encrypted in production
        dwollaCustomerId: '',
        dwollaCustomerUrl: '',
      }
    );

    return parseStringify(newUser);
  } catch (error: any) {
    console.error('Error creating user:', error);
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('Unknown attribute')) {
      const missingAttr = errorMsg.match(/Unknown attribute: "([^"]+)"/)?.[1] || 'unknown';
      throw new Error(
        `Schema Error: The attribute "${missingAttr}" is missing from your Appwrite USERS collection.\n\n` +
        `Required attributes:\n` +
        `- userId (String)\n` +
        `- email (String)\n` +
        `- firstName (String)\n` +
        `- lastName (String)\n` +
        `- address1 (String, Optional)\n` +
        `- city (String, Optional)\n` +
        `- state (String, Optional)\n` +
        `- postalCode (String, Optional)\n` +
        `- dateOfBirth (String, Optional)\n` +
        `- ssn (String, Optional)\n` +
        `- dwollaCustomerId (String, Optional)\n` +
        `- dwollaCustomerUrl (String, Optional)\n\n` +
        `Please add the missing attribute "${missingAttr}" to your USERS collection.\n` +
        `See README_SCHEMA.md for complete schema documentation.`
      );
    }
    
    if (errorMsg.includes('Collection') || errorMsg.includes('not found')) {
      throw new Error(
        `Collection Error: The USERS collection (ID: ${COLLECTIONS.USERS}) was not found.\n\n` +
        `Please verify your Appwrite configuration in .env.local.`
      );
    }
    
    throw error; // Re-throw to handle in UI
  }
}

export async function signInAccount(email: string, password: string) {
  try {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify(session);
  } catch (error: any) {
    console.error('Error signing in:', error);
    // Provide more specific error messages
    const errorMsg = error?.message || '';
    if (errorMsg.includes('Invalid credentials') || errorMsg.includes('401')) {
      throw new Error('Invalid email or password');
    }
    if (errorMsg.includes('429')) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    throw new Error('Failed to sign in. Please try again.');
  }
}

export async function signOutAccount() {
  try {
    const { account } = await createSessionClient();

    // Delete the session on Appwrite side first
    try {
      await account.deleteSession("current");
    } catch (sessionError) {
      // Session might already be deleted or invalid, continue anyway
      console.warn('Session deletion warning:', sessionError);
    }

    // Properly clear the cookie by setting it to expired
    cookies().set("appwrite-session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Set to epoch time to expire immediately
      maxAge: 0, // Set maxAge to 0 to delete immediately
    });

    return true;
  } catch (error) {
    // Even if there's an error, try to clear the cookie
    try {
      cookies().set("appwrite-session", "", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        maxAge: 0,
      });
    } catch (cookieError) {
      console.error('Error clearing cookie:', cookieError);
    }
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export async function getUserInfo(userId: string) {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('userId', [userId])]
    );

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}
