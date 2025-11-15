import OpenAI from 'openai';
import { Transaction } from '@/types';
import { Budget } from '@/lib/appwrite/budget';
import { SavingsGoal } from '@/lib/appwrite/goals';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getFinancialSuggestions(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  totalBalance: number
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    // Return mock suggestions if API key is not configured
    return [
      'Consider setting up automatic transfers to your savings account each month.',
      'Your spending on dining out has increased this month. Consider meal planning to save money.',
      'You\'re on track with your budget goals! Keep up the good work.',
      'Consider reviewing your subscriptions - you might have unused services.',
      'Your emergency fund is growing well. Aim for 3-6 months of expenses.',
    ];
  }

  try {
    const spendingByCategory = transactions.reduce((acc, t) => {
      if (t.amount < 0) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    const prompt = `Based on the following financial data, provide 5 personalized financial tips and suggestions:

Total Balance: $${totalBalance.toFixed(2)}
Spending by Category: ${JSON.stringify(spendingByCategory)}
Budgets: ${JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.currentSpending })))}
Savings Goals: ${JSON.stringify(goals.map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })))}

Provide 5 concise, actionable financial tips. Format as a JSON array of strings.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial advisor. Provide practical, actionable financial advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, split by lines or return as single suggestion
      return response.split('\n').filter((line) => line.trim().length > 0).slice(0, 5);
    }

    return [response];
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [
      'Unable to generate AI suggestions at this time. Please try again later.',
    ];
  }
}

export async function chatWithAI(question: string, context?: {
  transactions?: Transaction[];
  budgets?: Budget[];
  goals?: SavingsGoal[];
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'AI features require an OpenAI API key to be configured. Please set OPENAI_API_KEY in your environment variables.';
  }

  try {
    const contextPrompt = context
      ? `User's financial context:
- Recent transactions: ${context.transactions?.length || 0}
- Active budgets: ${context.budgets?.length || 0}
- Savings goals: ${context.goals?.length || 0}
`
      : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful financial advisor. ${contextPrompt}Provide clear, practical financial advice.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return 'I apologize, but I encountered an error. Please try again later.';
  }
}

