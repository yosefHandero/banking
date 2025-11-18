import { account, databases, ID, Query, COLLECTIONS, DATABASE_ID, getAppwriteClient } from './config';
import { User, SignUpParams } from '@/types';

export async function createUserAccount(userData: SignUpParams) {
  let user = null;
  try {
    const { account: requestAccount, databases: requestDatabases } = await getAppwriteClient();
    
    // Create auth account first
    user = await requestAccount.create(ID.unique(), userData.email, userData.password, userData.firstName + ' ' + userData.lastName);
    
    // Create user document in database
    // If this fails, we need to rollback the auth account to maintain data consistency
    let userDoc = null;
    try {
      userDoc = await requestDatabases.createDocument(
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
    } catch (dbError: any) {
      // Rollback: Attempt to delete the auth account if database document creation fails
      // This prevents orphaned accounts and maintains data consistency
      // Note: Deleting a user account requires admin SDK or the user to be authenticated
      // Since we just created the account, we can't delete it without admin privileges
      // This is a known limitation - manual cleanup may be required for orphaned accounts
      if (user) {
        // Log the orphaned account for potential admin cleanup
        console.error(
          `ORPHANED ACCOUNT CREATED: Auth account created but database document failed. ` +
          `User ID: ${user.$id}, Email: ${userData.email}. ` +
          `Error: ${dbError.message || 'Unknown error'}. ` +
          `Manual cleanup may be required in Appwrite console.`
        );
        // Note: To properly rollback, you would need Admin SDK:
        // const admin = new Admin(client);
        // await admin.users.delete(user.$id);
      }
      
      // Check if the error is specifically about a missing collection
      const errorMessage = dbError.message || dbError.toString() || 'Unknown database error';
      const isCollectionError = 
        errorMessage.includes('Collection') && 
        (errorMessage.includes('not found') || errorMessage.includes('could not be found'));
      
      if (isCollectionError) {
        // Collection-specific error
        throw new Error(
          `Collection "${COLLECTIONS.USERS}" not found in database "${DATABASE_ID}". ` +
          `Please create this collection in your Appwrite console with the required attributes.`
        );
      } else {
        // Other database errors (permissions, validation, network, etc.)
        // Preserve the original error message for better debugging
        throw new Error(
          `Failed to create user document in database: ${errorMessage}. ` +
          `Please check your Appwrite collection configuration, permissions, and network connection.`
        );
      }
    }

    return { user, userDoc };
  } catch (error) {
    throw error;
  }
}

export async function signInAccount(email: string, password: string) {
  try {
    const { account: requestAccount } = await getAppwriteClient();
    const session = await requestAccount.createEmailPasswordSession({ email, password });
    return session;
  } catch (error) {
    throw error;
  }
}

export async function signOutAccount() {
  try {
    const { account: requestAccount } = await getAppwriteClient();
    await requestAccount.deleteSession({ sessionId: 'current' });
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { account: requestAccount } = await getAppwriteClient();
    const currentAccount = await requestAccount.get();
    return currentAccount;
  } catch (error) {
    return null;
  }
}

export async function getUserInfo(userId: string): Promise<User | null> {
  try {
    const { databases: requestDatabases } = await getAppwriteClient();
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

