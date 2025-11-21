import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/openai/suggestions';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userInfo = await getUserInfo(currentUser.$id);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const transactions = await getTransactions(userInfo.userId);
    const budgets = await getBudgets(userInfo.userId);
    const goals = await getSavingsGoals(userInfo.userId);

    const response = await chatWithAI(question, {
      transactions: transactions.slice(0, 10),
      budgets,
      goals,
    });

    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get AI response' },
      { status: 500 }
    );
  }
}

