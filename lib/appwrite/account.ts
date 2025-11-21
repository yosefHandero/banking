"use server";

import { createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
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
    const { databases } = await createSessionClient();
    const accountId = ID.unique();
    const accountNumber = accountData.mask || Math.random().toString().slice(2, 12);

    const account = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      ID.unique(),
      {
        accountId: accountId,
        accountNumber: accountNumber,
        accountOwnerId: accountData.userId,
        balance: accountData.currentBalance,
        accountType: accountData.type,
        interestRate: 0,
        createdDate: new Date().toISOString(),
      }
    );

    return { ...account, $id: account.$id };
  } catch (error) {
    throw error;
  }
}

export async function getAccounts(userId: string): Promise<Account[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided to getAccounts:', userId);
      return [];
    }

    const { databases } = await createSessionClient();

    let accounts;
    try {
      accounts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        [Query.equal('accountOwnerId', userId)]
      );
    } catch (queryError: any) {
      // If query fails, try getting all and filtering client-side
      console.warn('Query with accountOwnerId failed, trying without filter:', queryError.message);
      accounts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS
      );
    }

    return accounts.documents
      .filter((doc: any) => {
        // Filter by userId client-side if query didn't work
        const docUserId = doc.accountOwnerId || doc.userId || '';
        return docUserId === userId;
      })
      .map((doc: any) => ({
        id: doc.$id,
        availableBalance: doc.balance || 0,
        currentBalance: doc.balance || 0,
        officialName: doc.accountType || '',
        mask: doc.accountNumber || '',
        institutionId: doc.accountId || '',
        name: doc.accountType || 'Account',
        type: doc.accountType || '',
        subtype: '',
        appwriteItemId: doc.accountId || doc.$id,
        sharableId: doc.accountId || doc.$id,
        userId: doc.accountOwnerId || doc.userId || '',
      }));
  } catch (error: any) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

export async function getAccount(accountId: string): Promise<Account | null> {
  try {
    const { databases } = await createSessionClient();
    const account = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId
    );

    return {
      id: account.$id,
      availableBalance: account.balance || 0,
      currentBalance: account.balance || 0,
      officialName: account.accountType || '',
      mask: account.accountNumber || '',
      institutionId: account.accountId || '',
      name: account.accountType || 'Account',
      type: account.accountType || '',
      subtype: '',
      appwriteItemId: account.accountId || account.$id,
      sharableId: account.accountId || account.$id,
      userId: account.accountOwnerId || '',
    };
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}

export async function deleteBankAccount(accountId: string, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const account = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        accountId
      );
      if (account.accountOwnerId !== userId) {
        throw new Error('Unauthorized: Account does not belong to you');
      }
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId
    );
  } catch (error) {
    throw error;
  }
}

export async function updateAccountBalance(accountId: string, currentBalance: number, availableBalance: number, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const account = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        accountId
      );
      if (account.accountOwnerId !== userId) {
        throw new Error('Unauthorized: Account does not belong to you');
      }
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId,
      {
        balance: currentBalance,
      }
    );
  } catch (error) {
    throw error;
  }
}

