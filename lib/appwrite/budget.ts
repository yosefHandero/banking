"use server";

import { createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { stringToInteger } from '../utils';

export interface Budget {
  $id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  currentSpending: number;
  month?: number;
  year: number;
}

export async function createBudget(budgetData: {
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  month?: number;
  year: number;
}) {
  try {
    const { databases } = await createSessionClient();
    const startDate = new Date(budgetData.year, (budgetData.month || 1) - 1, 1);
    const endDate = new Date(budgetData.year, budgetData.month || 12, 0);

    const budget = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      ID.unique(),
      {
        budgetId: stringToInteger(ID.unique()),
        userId: stringToInteger(budgetData.userId),
        name: budgetData.category,
        startPeriod: startDate.toISOString(),
        endPeriod: endDate.toISOString(),
        totalAmount: budgetData.limit,
        categories: budgetData.category,
      }
    );

    return budget;
  } catch (error) {
    throw error;
  }
}

export async function getBudgets(userId: string, year?: number, month?: number): Promise<Budget[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided to getBudgets:', userId);
      return [];
    }

    const { databases } = await createSessionClient();
    const userIdInt = stringToInteger(userId);

    // Get all budgets for the user
    const budgets = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      [Query.equal('userId', userIdInt)]
    );

    // Get transactions to calculate spending
    const { getTransactions } = await import('./transaction');
    const transactions = await getTransactions(userId);

    return budgets.documents
      .map((doc: any): Budget | null => {
        const startDate = doc.startPeriod ? new Date(doc.startPeriod) : new Date();
        const endDate = doc.endPeriod ? new Date(doc.endPeriod) : new Date();
        const docYear = startDate.getFullYear();
        const docMonth = startDate.getMonth() + 1;

        if (year && docYear !== year) return null;
        if (month !== undefined && docMonth !== month) return null;

        const period: 'monthly' | 'yearly' = (endDate.getTime() - startDate.getTime()) < 32 * 24 * 60 * 60 * 1000 ? 'monthly' : 'yearly';
        
        const budgetCategory = doc.categories || doc.name || '';
        
        // Calculate current spending from transactions in the budget period
        const currentSpending = transactions
          .filter((t) => {
            const transactionDate = new Date(t.date);
            // Only count withdrawals (negative amounts or type 'withdrawal')
            const isWithdrawal = t.amount < 0 || t.type === 'withdrawal';
            // Match category
            const categoryMatch = t.category === budgetCategory || 
                                 t.category?.toLowerCase().includes(budgetCategory.toLowerCase()) ||
                                 budgetCategory.toLowerCase().includes(t.category?.toLowerCase() || '');
            // Check if transaction is within budget period
            const inPeriod = transactionDate >= startDate && transactionDate <= endDate;
            
            return isWithdrawal && categoryMatch && inPeriod;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          $id: doc.$id,
          userId: userId,
          category: budgetCategory,
          limit: doc.totalAmount || 0,
          period: period,
          currentSpending: currentSpending,
          month: docMonth,
          year: docYear,
        };
      })
      .filter((budget): budget is Budget => budget !== null);
  } catch (error) {
    console.error('Error getting budgets:', error);
    return [];
  }
}

export async function updateBudgetSpending(budgetId: string, currentSpending: number, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const budget = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        budgetId
      );
      const userIdInt = stringToInteger(userId);
      if (budget.userId !== userIdInt) {
        throw new Error('Unauthorized: Budget does not belong to you');
      }
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      budgetId,
      {
        totalAmount: currentSpending,
      }
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteBudget(budgetId: string, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const budget = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        budgetId
      );
      const userIdInt = stringToInteger(userId);
      if (budget.userId !== userIdInt) {
        throw new Error('Unauthorized: Budget does not belong to you');
      }
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      budgetId
    );
  } catch (error) {
    throw error;
  }
}
