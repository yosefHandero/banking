import { databases, ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { Account } from '@/types';

export async function createBankAccount(accountData: {
  userId: string;
  name: string;
  officialName: string;
  mask: string;
  type: string;
  subtype: string;
  currentBalance: number;
  availableBalance: number;
  institutionId: string;
  institutionName: string;
}) {
  try {
    const account = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      ID.unique(),
      {
        userId: accountData.userId,
        name: accountData.name,
        officialName: accountData.officialName,
        mask: accountData.mask,
        type: accountData.type,
        subtype: accountData.subtype,
        currentBalance: accountData.currentBalance,
        availableBalance: accountData.availableBalance,
        institutionId: accountData.institutionId,
        institutionName: accountData.institutionName,
        appwriteItemId: ID.unique(),
        sharableId: ID.unique(),
      }
    );

    return account;
  } catch (error) {
    throw error;
  }
}

export async function getAccounts(userId: string): Promise<Account[]> {
  try {
    const accounts = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      [Query.equal('userId', userId)]
    );

    return accounts.documents.map((doc) => ({
      id: doc.$id,
      availableBalance: doc.availableBalance,
      currentBalance: doc.currentBalance,
      officialName: doc.officialName,
      mask: doc.mask,
      institutionId: doc.institutionId,
      name: doc.name,
      type: doc.type,
      subtype: doc.subtype,
      appwriteItemId: doc.appwriteItemId,
      sharableId: doc.sharableId,
    }));
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

export async function getAccount(accountId: string): Promise<Account | null> {
  try {
    const account = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId
    );

    return {
      id: account.$id,
      availableBalance: account.availableBalance,
      currentBalance: account.currentBalance,
      officialName: account.officialName,
      mask: account.mask,
      institutionId: account.institutionId,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      appwriteItemId: account.appwriteItemId,
      sharableId: account.sharableId,
    };
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}

export async function deleteBankAccount(accountId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId
    );
  } catch (error) {
    throw error;
  }
}

export async function updateAccountBalance(accountId: string, currentBalance: number, availableBalance: number) {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId,
      {
        currentBalance,
        availableBalance,
      }
    );
  } catch (error) {
    throw error;
  }
}

