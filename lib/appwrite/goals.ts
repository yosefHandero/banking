import { getAppwriteClient, ID, Query, COLLECTIONS, DATABASE_ID } from './config';

export interface SavingsGoal {
  $id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  description?: string;
}

export async function createSavingsGoal(goalData: {
  userId: string;
  name: string;
  targetAmount: number;
  targetDate?: string;
  description?: string;
}) {
  try {
    const { databases } = await getAppwriteClient();
    const goal = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      ID.unique(),
      {
        userId: goalData.userId,
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        currentAmount: 0,
        targetDate: goalData.targetDate,
        description: goalData.description || '',
      }
    );

    return goal;
  } catch (error) {
    throw error;
  }
}

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  try {
    const { databases } = await getAppwriteClient();
    const goals = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      [Query.equal('userId', userId)]
    );

    return goals.documents.map((doc) => ({
      $id: doc.$id,
      userId: doc.userId,
      name: doc.name,
      targetAmount: doc.targetAmount,
      currentAmount: doc.currentAmount || 0,
      targetDate: doc.targetDate,
      description: doc.description || '',
    }));
  } catch (error) {
    console.error('Error getting savings goals:', error);
    return [];
  }
}

export async function updateSavingsGoal(goalId: string, updates: {
  currentAmount?: number;
  targetAmount?: number;
  name?: string;
  targetDate?: string;
  description?: string;
}, userId?: string) {
  try {
    const { databases } = await getAppwriteClient();
    
    // SECURITY: Verify ownership if userId is provided
    if (userId) {
      const goal = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SAVINGS_GOALS,
        goalId
      );
      if (goal.userId !== userId) {
        throw new Error('Unauthorized: Savings goal does not belong to you');
      }
    }
    
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      goalId,
      updates
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteSavingsGoal(goalId: string, userId?: string) {
  try {
    const { databases } = await getAppwriteClient();
    
    // SECURITY: Verify ownership if userId is provided
    if (userId) {
      const goal = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SAVINGS_GOALS,
        goalId
      );
      if (goal.userId !== userId) {
        throw new Error('Unauthorized: Savings goal does not belong to you');
      }
    }
    
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      goalId
    );
  } catch (error) {
    throw error;
  }
}

