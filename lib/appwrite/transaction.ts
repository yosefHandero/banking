"use server";

import { createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { Transaction } from '@/types';

export async function createTransaction(transactionData: {
  userId: string;
  accountId: string;
  name: string;
  amount: number;
  type: string;
  category: string;
  paymentChannel: string;
  date: string;
  pending: boolean;
  image?: string;
  channel?: string;
  senderBankId?: string;
  receiverBankId?: string;
}) {
  try {
    const { databases } = await createSessionClient();
    // Validate amount is a valid number
    const amount = Number(transactionData.amount);
    if (isNaN(amount)) {
      throw new Error('Invalid transaction amount');
    }

    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        name: transactionData.name || '',
        amount: String(amount), // Appwrite may require string, but we validate as number first
        channel: transactionData.channel || transactionData.paymentChannel || 'other',
        category: transactionData.category || 'Other',
        senderId: transactionData.userId,
        receiverId: transactionData.userId,
        senderBankId: transactionData.senderBankId || transactionData.accountId || '',
        receiverBankId: transactionData.receiverBankId || '',
        email: '',
      }
    );

    return transaction;
  } catch (error: any) {
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('Unknown attribute')) {
      const missingAttr = errorMsg.match(/Unknown attribute: "([^"]+)"/)?.[1] || 'unknown';
      throw new Error(
        `Schema Error: The attribute "${missingAttr}" is missing from your Appwrite TRANSACTIONS collection.\n\n` +
        `Required attributes:\n` +
        `- name (String)\n` +
        `- amount (String)\n` +
        `- channel (String)\n` +
        `- category (String)\n` +
        `- senderId (String)\n` +
        `- receiverId (String)\n` +
        `- senderBankId (String)\n` +
        `- receiverBankId (String, Optional)\n` +
        `- email (String, Optional)\n\n` +
        `Please add the missing attribute "${missingAttr}" to your TRANSACTIONS collection.\n` +
        `See README_SCHEMA.md for complete schema documentation.`
      );
    }
    
    if (errorMsg.includes('Collection') || errorMsg.includes('not found')) {
      throw new Error(
        `Collection Error: The TRANSACTIONS collection (ID: ${COLLECTIONS.TRANSACTIONS}) was not found.\n\n` +
        `Please verify your Appwrite configuration in .env.local.`
      );
    }
    
    throw error;
  }
}

export async function getTransactions(userId: string, accountId?: string): Promise<Transaction[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided to getTransactions:', userId);
      return [];
    }

    const { databases } = await createSessionClient();
    const queries = [
      Query.or([
        Query.equal('senderId', userId),
        Query.equal('receiverId', userId)
      ])
    ];

    if (accountId) {
      queries.push(
        Query.or([
          Query.equal('senderBankId', accountId),
          Query.equal('receiverBankId', accountId)
        ])
      );
    }

    queries.push(Query.orderDesc('$createdAt'));

    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      queries
    );

    return transactions.documents.map((doc: any) => ({
      id: doc.$id,
      $id: doc.$id,
      name: doc.name || '',
      paymentChannel: doc.channel || '',
      type: 'transfer',
      accountId: doc.senderBankId || doc.receiverBankId || '',
      amount: parseFloat(doc.amount) || 0,
      pending: false,
      category: doc.category || '',
      date: doc.$createdAt || new Date().toISOString(),
      image: '',
      $createdAt: doc.$createdAt,
      channel: doc.channel || '',
      senderBankId: doc.senderBankId || '',
      receiverBankId: doc.receiverBankId || '',
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
}

export async function getTransactionsByBankId(bankId: string, userId?: string): Promise<Transaction[]> {
  try {
    const { databases } = await createSessionClient();
    const queries = [
      Query.or([
        Query.equal('senderBankId', bankId),
        Query.equal('receiverBankId', bankId)
      ]),
      Query.orderDesc('$createdAt')
    ];

    if (userId) {
      queries.unshift(
        Query.or([
          Query.equal('senderId', userId),
          Query.equal('receiverId', userId)
        ])
      );
    }

    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      queries
    );

    return transactions.documents.map((doc: any) => ({
      id: doc.$id,
      $id: doc.$id,
      name: doc.name || '',
      paymentChannel: doc.channel || '',
      type: 'transfer',
      accountId: doc.senderBankId || doc.receiverBankId || '',
      amount: parseFloat(doc.amount) || 0,
      pending: false,
      category: doc.category || '',
      date: doc.$createdAt || new Date().toISOString(),
      image: '',
      $createdAt: doc.$createdAt,
      channel: doc.channel || '',
      senderBankId: doc.senderBankId || '',
      receiverBankId: doc.receiverBankId || '',
    }));
  } catch (error) {
    console.error('Error getting transactions by bank ID:', error);
    return [];
  }
}

