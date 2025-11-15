import { NextRequest, NextResponse } from 'next/server';
import { getFinancialSuggestions } from '@/lib/openai/suggestions';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';
import { getAccounts } from '@/lib/appwrite/account';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transactions = await getTransactions(userId);
    const budgets = await getBudgets(userId);
    const goals = await getSavingsGoals(userId);
    const accounts = await getAccounts(userId);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

    const suggestions = await getFinancialSuggestions(transactions, budgets, goals, totalBalance);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

