import { account, databases, ID, Query, COLLECTIONS, DATABASE_ID, getAppwriteClient } from './config';
import { User, SignUpParams } from '@/types';

export async function createUserAccount(userData: SignUpParams) {
  try {
    const { account: requestAccount, databases: requestDatabases } = getAppwriteClient();
    
    // Create auth account
    const user = await requestAccount.create(ID.unique(), userData.email, userData.password, userData.firstName + ' ' + userData.lastName);
    
    // Create user document in database
    const userDoc = await requestDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      ID.unique(),
      {
        userId: user.$id,
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

    return { user, userDoc };
  } catch (error) {
    throw error;
  }
}

export async function signInAccount(email: string, password: string) {
  try {
    const { account: requestAccount } = getAppwriteClient();
    const session = await requestAccount.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw error;
  }
}

export async function signOutAccount() {
  try {
    const { account: requestAccount } = getAppwriteClient();
    await requestAccount.deleteSession('current');
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { account: requestAccount } = getAppwriteClient();
    const currentAccount = await requestAccount.get();
    return currentAccount;
  } catch (error) {
    return null;
  }
}

export async function getUserInfo(userId: string): Promise<User | null> {
  try {
    const { databases: requestDatabases } = getAppwriteClient();
    const userDoc = await requestDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('userId', userId)]
    );

    if (userDoc.documents.length === 0) {
      return null;
    }

    const userData = userDoc.documents[0];
    return {
      $id: userData.$id,
      userId: userData.userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address1: userData.address1,
      city: userData.city,
      state: userData.state,
      postalCode: userData.postalCode,
      dateOfBirth: userData.dateOfBirth,
      ssn: userData.ssn,
      dwollaCustomerId: userData.dwollaCustomerId || '',
      dwollaCustomerUrl: userData.dwollaCustomerUrl || '',
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

