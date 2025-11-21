"use server";

import { createAdminClient, createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { User, SignUpParams } from '@/types';
import { cookies } from "next/headers";

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
      secure: true,
    });

    const newUser = await database.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      ID.unique(),
      {
        userId: newUserAccount.$id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        address1: userData.address1,
        city: userData.city,
        state: userData.state,
        postalCode: userData.postalCode,
        dateOfBirth: userData.dateOfBirth,
        ssn: userData.ssn,
        dwollaCustomerId: '',
        dwollaCustomerUrl: '',
      }
    );

    return parseStringify(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
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
      secure: true,
    });

    return parseStringify(session);
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
}

export async function signOutAccount() {
  try {
    const { account } = await createSessionClient();

    cookies().delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
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

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));
