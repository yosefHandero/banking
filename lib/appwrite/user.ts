import { account, databases, ID, COLLECTIONS, DATABASE_ID } from './config';
import { User, SignUpParams } from '@/types';

export async function createUserAccount(userData: SignUpParams) {
  try {
    // Create auth account
    const user = await account.create(ID.unique(), userData.email, userData.password, userData.firstName + ' ' + userData.lastName);
    
    // Create user document in database
    const userDoc = await databases.createDocument(
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
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw error;
  }
}

export async function signOutAccount() {
  try {
    await account.deleteSession('current');
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    return null;
  }
}

export async function getUserInfo(userId: string): Promise<User | null> {
  try {
    const userDoc = await databases.listDocuments(
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

