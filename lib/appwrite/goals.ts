"use server";

import { createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { stringToInteger } from '../utils';

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
    const { databases } = await createSessionClient();
    const startDate = new Date().toISOString();
    const endDate = goalData.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const goal = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      ID.unique(),
      {
        goalId: Math.floor(Math.random() * 1000000),
        userId: stringToInteger(goalData.userId),
        goalName: goalData.name,
        targetAmount: goalData.targetAmount,
        currentAmount: 0,
        startDate: startDate,
        endDate: endDate,
      }
    );

    return goal;
  } catch (error) {
    throw error;
  }
}

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided to getSavingsGoals:', userId);
      return [];
    }

    const { databases } = await createSessionClient();
    const userIdInt = stringToInteger(userId);
    const goals = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      [Query.equal('userId', userIdInt)]
    );

    return goals.documents.map((doc: any) => ({
      $id: doc.$id,
      userId: userId, // Return original string ID
      name: doc.goalName || '',
      targetAmount: doc.targetAmount || 0,
      currentAmount: doc.currentAmount || 0,
      targetDate: doc.endDate || '',
      description: '',
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
    const { databases } = await createSessionClient();

    if (userId) {
      const goal = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SAVINGS_GOALS,
        goalId
      );
      const userIdInt = stringToInteger(userId);
      if (goal.userId !== userIdInt) {
        throw new Error('Unauthorized: Savings goal does not belong to you');
      }
    }

    const appwriteUpdates: any = {};
    if (updates.currentAmount !== undefined) appwriteUpdates.currentAmount = updates.currentAmount;
    if (updates.targetAmount !== undefined) appwriteUpdates.targetAmount = updates.targetAmount;
    if (updates.name !== undefined) appwriteUpdates.goalName = updates.name;
    if (updates.targetDate !== undefined) appwriteUpdates.endDate = updates.targetDate;

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SAVINGS_GOALS,
      goalId,
      appwriteUpdates
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteSavingsGoal(goalId: string, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const goal = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SAVINGS_GOALS,
        goalId
      );
      const userIdInt = stringToInteger(userId);
      if (goal.userId !== userIdInt) {
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
