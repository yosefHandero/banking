import { databases, ID, Query, COLLECTIONS, DATABASE_ID } from './config';
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
    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: transactionData.userId,
        accountId: transactionData.accountId,
        name: transactionData.name,
        amount: transactionData.amount,
        type: transactionData.type,
        category: transactionData.category,
        paymentChannel: transactionData.paymentChannel,
        date: transactionData.date,
        pending: transactionData.pending,
        image: transactionData.image || '',
        channel: transactionData.channel || transactionData.paymentChannel,
        senderBankId: transactionData.senderBankId || '',
        receiverBankId: transactionData.receiverBankId || '',
      }
    );

    return transaction;
  } catch (error) {
    throw error;
  }
}

export async function getTransactions(userId: string, accountId?: string): Promise<Transaction[]> {
  try {
    const queries = [Query.equal('userId', userId)];
    
    if (accountId) {
      queries.push(Query.equal('accountId', accountId));
    }

    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      queries,
      [Query.orderDesc('date')]
    );

    return transactions.documents.map((doc) => ({
      id: doc.$id,
      $id: doc.$id,
      name: doc.name,
      paymentChannel: doc.paymentChannel,
      type: doc.type,
      accountId: doc.accountId,
      amount: doc.amount,
      pending: doc.pending,
      category: doc.category,
      date: doc.date,
      image: doc.image || '',
      $createdAt: doc.$createdAt,
      channel: doc.channel || doc.paymentChannel,
      senderBankId: doc.senderBankId || '',
      receiverBankId: doc.receiverBankId || '',
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
}

export async function getTransactionsByBankId(bankId: string): Promise<Transaction[]> {
  try {
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [Query.equal('accountId', bankId)],
      [Query.orderDesc('date')]
    );

    return transactions.documents.map((doc) => ({
      id: doc.$id,
      $id: doc.$id,
      name: doc.name,
      paymentChannel: doc.paymentChannel,
      type: doc.type,
      accountId: doc.accountId,
      amount: doc.amount,
      pending: doc.pending,
      category: doc.category,
      date: doc.date,
      image: doc.image || '',
      $createdAt: doc.$createdAt,
      channel: doc.channel || doc.paymentChannel,
      senderBankId: doc.senderBankId || '',
      receiverBankId: doc.receiverBankId || '',
    }));
  } catch (error) {
    console.error('Error getting transactions by bank ID:', error);
    return [];
  }
}

