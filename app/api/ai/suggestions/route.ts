import { NextRequest, NextResponse } from 'next/server';
import { getFinancialSuggestions } from '@/lib/openai/suggestions';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';
import { getAccounts } from '@/lib/appwrite/account';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';

export async function GET(request: NextRequest) {
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

    const transactions = await getTransactions(userInfo.userId);
    const budgets = await getBudgets(userInfo.userId);
    const goals = await getSavingsGoals(userInfo.userId);
    const accounts = await getAccounts(userInfo.userId);
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

