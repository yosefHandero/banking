import { Transaction } from '@/types';
import { Budget } from '@/lib/appwrite/budget';
import { SavingsGoal } from '@/lib/appwrite/goals';

interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  totalBalance: number;
}

export function buildFinancialSuggestionsPrompt(data: FinancialData): string {
  const { transactions, budgets, goals, totalBalance } = data;

  const spendingByCategory = transactions.reduce((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  const recentTransactions = transactions.slice(0, 10).map(t => ({
    name: t.name,
    amount: t.amount,
    category: t.category,
    date: t.date,
  }));

  const totalSpending = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const budgetStatus = budgets.map(b => {
    const percentage = b.limit > 0 ? (b.currentSpending / b.limit) * 100 : 0;
    return {
      category: b.category,
      limit: b.limit,
      spent: b.currentSpending,
      remaining: b.limit - b.currentSpending,
      percentageUsed: percentage.toFixed(1),
      status: percentage > 90 ? 'over_budget' : percentage > 75 ? 'warning' : 'on_track',
    };
  });

  const goalsProgress = goals.map(g => {
    const percentage = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
    return {
      name: g.name,
      target: g.targetAmount,
      current: g.currentAmount,
      remaining: g.targetAmount - g.currentAmount,
      percentageComplete: percentage.toFixed(1),
    };
  });

  const topSpendingCategories = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  return `You are a professional financial advisor analyzing a user's financial situation. Provide personalized, actionable financial advice based on the following comprehensive data:

FINANCIAL OVERVIEW:
- Total Account Balance: $${totalBalance.toFixed(2)}
- Total Spending This Period: $${totalSpending.toFixed(2)}
- Number of Transactions: ${transactions.length}
- Number of Active Budgets: ${budgets.length}
- Number of Savings Goals: ${goals.length}

SPENDING ANALYSIS:
Top Spending Categories:
${topSpendingCategories.map((item, i) => `${i + 1}. ${item.category}: $${item.amount.toFixed(2)}`).join('\n')}

All Category Spending:
${JSON.stringify(spendingByCategory, null, 2)}

BUDGET STATUS:
${budgetStatus.length > 0 ? budgetStatus.map(b => `- ${b.category}: Spent $${b.spent.toFixed(2)} of $${b.limit.toFixed(2)} (${b.percentageUsed}%) - ${b.status === 'over_budget' ? 'OVER BUDGET' : b.status === 'warning' ? 'NEAR LIMIT' : 'ON TRACK'}`).join('\n') : 'No budgets set'}

SAVINGS GOALS PROGRESS:
${goalsProgress.length > 0 ? goalsProgress.map(g => `- ${g.name}: $${g.current.toFixed(2)} saved of $${g.target.toFixed(2)} goal (${g.percentageComplete}% complete) - $${g.remaining.toFixed(2)} remaining`).join('\n') : 'No savings goals set'}

RECENT TRANSACTIONS (Last 10):
${recentTransactions.length > 0 ? recentTransactions.map((t, i) => `${i + 1}. ${t.name} - $${Math.abs(t.amount).toFixed(2)} (${t.category}) on ${t.date}`).join('\n') : 'No recent transactions'}

INSTRUCTIONS:
Analyze this financial data and provide exactly 5 personalized, specific, and actionable financial tips. Each tip should:
1. Be specific to the user's actual financial situation (reference specific categories, budgets, or goals)
2. Be actionable with clear next steps
3. Be concise but informative (1-2 sentences)
4. Address the most important financial opportunities or concerns visible in their data
5. Be written in a friendly, encouraging tone

CRITICAL: Return ONLY a valid JSON array of exactly 5 strings. Do NOT include markdown code blocks, explanations, or any other text. Return ONLY the JSON array.

Example format: ["Tip 1 text here", "Tip 2 text here", "Tip 3 text here", "Tip 4 text here", "Tip 5 text here"]`;
}

export function getFinancialSuggestionsSystemPrompt(): string {
  return 'You are an expert financial advisor. Analyze financial data and provide specific, actionable advice. Always return responses as valid JSON arrays when requested. Never include markdown code blocks or explanations - only return the requested JSON format.';
}

