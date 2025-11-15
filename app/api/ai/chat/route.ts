import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/openai/suggestions';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userId } = body;

    if (!question || !userId) {
      return NextResponse.json(
        { error: 'Question and user ID are required' },
        { status: 400 }
      );
    }

    const transactions = await getTransactions(userId);
    const budgets = await getBudgets(userId);
    const goals = await getSavingsGoals(userId);

    const response = await chatWithAI(question, {
      transactions: transactions.slice(0, 10), // Recent transactions
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

