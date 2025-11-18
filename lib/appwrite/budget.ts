import { getAppwriteClient, ID, Query, COLLECTIONS, DATABASE_ID } from './config';

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
    const { databases } = await getAppwriteClient();
    const budget = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      ID.unique(),
      {
        userId: budgetData.userId,
        category: budgetData.category,
        limit: budgetData.limit,
        period: budgetData.period,
        currentSpending: 0,
        month: budgetData.month,
        year: budgetData.year,
      }
    );

    return budget;
  } catch (error) {
    throw error;
  }
}

export async function getBudgets(userId: string, year?: number, month?: number): Promise<Budget[]> {
  try {
    const { databases } = await getAppwriteClient();
    const queries = [Query.equal('userId', userId)];
    
    if (year) {
      queries.push(Query.equal('year', year));
    }
    
    if (month !== undefined) {
      queries.push(Query.equal('month', month));
    }

    const budgets = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      queries
    );

    return budgets.documents.map((doc) => ({
      $id: doc.$id,
      userId: doc.userId,
      category: doc.category,
      limit: doc.limit,
      period: doc.period,
      currentSpending: doc.currentSpending || 0,
      month: doc.month,
      year: doc.year,
    }));
  } catch (error) {
    console.error('Error getting budgets:', error);
    return [];
  }
}

export async function updateBudgetSpending(budgetId: string, currentSpending: number, userId?: string) {
  try {
    const { databases } = await getAppwriteClient();
    
    // SECURITY: Verify ownership if userId is provided
    if (userId) {
      const budget = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        budgetId
      );
      if (budget.userId !== userId) {
        throw new Error('Unauthorized: Budget does not belong to you');
      }
    }
    
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.BUDGETS,
      budgetId,
      {
        currentSpending,
      }
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteBudget(budgetId: string, userId?: string) {
  try {
    const { databases } = await getAppwriteClient();
    
    // SECURITY: Verify ownership if userId is provided
    if (userId) {
      const budget = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BUDGETS,
        budgetId
      );
      if (budget.userId !== userId) {
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

