import Groq from 'groq-sdk';
import { Transaction } from '@/types';
import { Budget } from '@/lib/appwrite/budget';
import { SavingsGoal } from '@/lib/appwrite/goals';
import { buildFinancialSuggestionsPrompt, getFinancialSuggestionsSystemPrompt } from './prompts';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('[Groq] API key not found in environment variables');
    return null;
  }
  
  const trimmedKey = apiKey.trim();
  if (!trimmedKey.startsWith('gsk_')) {
    console.error('[Groq] Invalid API key format. Groq API keys should start with "gsk_"');
    return null;
  }
  
  try {
    const client = new Groq({ 
      apiKey: trimmedKey,
      timeout: 30000,
    });
    
    return client;
  } catch (error) {
    console.error('[Groq] Failed to initialize client:', error);
    return null;
  }
};

async function makeGroqCall<T>(
  apiCall: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    const status = error?.status || error?.statusCode || error?.response?.status;
    const isRateLimit = status === 429;
    
    if (isRateLimit && retries > 0) {
      const waitTime = delay * Math.pow(2, 2 - retries);
      console.log(`[Groq] Rate limit hit, retrying in ${waitTime}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return makeGroqCall(apiCall, retries - 1, delay);
    }
    
    throw error;
  }
}

export async function getFinancialSuggestions(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  totalBalance: number
): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[Groq] GROQ_API_KEY not found in environment variables');
    return [
      'Consider setting up automatic transfers to your savings account each month.',
      'Your spending on dining out has increased this month. Consider meal planning to save money.',
      'You\'re on track with your budget goals! Keep up the good work.',
      'Consider reviewing your subscriptions - you might have unused services.',
      'Your emergency fund is growing well. Aim for 3-6 months of expenses.',
    ];
  }

  console.log('[Groq] API key found:', apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4));

  try {
    const groq = getGroqClient();
    if (!groq) {
      throw new Error('Groq API key not configured or invalid. Please check your .env.local file.');
    }
    
    console.log('[Groq] Making API call for financial suggestions...');

    const prompt = buildFinancialSuggestionsPrompt({
      transactions,
      budgets,
      goals,
      totalBalance,
    });

    const completion = await makeGroqCall(
      () => groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: getFinancialSuggestionsSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    );

    let response = completion.choices[0]?.message?.content || '';
    
    if (!response.trim()) {
      console.warn('Empty response from Groq, returning fallback suggestions');
      return [
        'Consider setting up automatic transfers to your savings account each month.',
        'Review your monthly spending patterns to identify areas for improvement.',
        'Set up a budget for discretionary spending categories.',
        'Consider increasing your emergency fund contributions.',
        'Review and optimize your subscription services regularly.',
      ];
    }

    response = response.trim();
    
    if (response.startsWith('```json')) {
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (response.startsWith('```')) {
      response = response.replace(/```\n?/g, '').trim();
    }
    
    if (response.startsWith('[') && response.endsWith(']')) {
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((item: any) => typeof item === 'string' && item.trim().length > 0)
            .map((item: string) => item.trim())
            .slice(0, 5);
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON array, trying alternative parsing');
      }
    }
    
    if (response.startsWith('{') && response.endsWith('}')) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions
            .filter((item: any) => typeof item === 'string' && item.trim().length > 0)
            .map((item: string) => item.trim())
            .slice(0, 5);
        }
        if (parsed.tips && Array.isArray(parsed.tips)) {
          return parsed.tips
            .filter((item: any) => typeof item === 'string' && item.trim().length > 0)
            .map((item: string) => item.trim())
            .slice(0, 5);
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON object');
      }
    }
    
    const lines = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        return line.length > 0 && 
               !line.startsWith('```') && 
               !line.startsWith('[') && 
               !line.startsWith('{') &&
               !line.match(/^["']?tip["']?\s*:/i) &&
               !line.match(/^["']?suggestion["']?\s*:/i);
      });
    
    if (lines.length > 0) {
      return lines.slice(0, 5);
    }

    return [response].filter(s => s.length > 0);
  } catch (error: any) {
    const status = error?.status || error?.statusCode || error?.response?.status || error?.response?.statusCode;
    const errorCode = error?.code || error?.error?.code;
    const errorMessage = error?.message || error?.error?.message || 'Unknown error';
    
    console.error('[Groq Error]', {
      status,
      code: errorCode,
      message: errorMessage,
      type: error?.type,
      fullError: error,
    });
    
    const isQuotaExceeded = status === 429 && (
        errorCode === 'insufficient_quota' ||
        error?.code === 'insufficient_quota' ||
        error?.error?.code === 'insufficient_quota' ||
        errorMessage?.toLowerCase().includes('quota') ||
        errorMessage?.toLowerCase().includes('billing') ||
        errorMessage?.toLowerCase().includes('insufficient')
    );
    
    if (isQuotaExceeded) {
      console.error('[QUOTA EXCEEDED] Groq quota exceeded. Please check your Groq account limits.');
      throw new Error('Groq API quota exceeded. Please check your Groq account at https://console.groq.com/limits');
    }
    
    if (errorMessage?.includes('API key') || errorMessage?.includes('Invalid API key')) {
      throw new Error('Groq API key is invalid or missing. Please check your .env.local file and ensure the key starts with "gsk_".');
    }
    if (status === 401 || errorMessage?.includes('401') || errorCode === 'invalid_api_key') {
      throw new Error('Groq API key is invalid or expired. Please check your API key in .env.local and generate a new one at https://console.groq.com/keys if needed.');
    }
    
    const isRateLimit = status === 429 || 
        error?.statusCode === 429 ||
        error?.response?.status === 429 ||
        errorMessage?.toLowerCase().includes('429') || 
        errorMessage?.toLowerCase().includes('rate limit') ||
        errorMessage?.toLowerCase().includes('too many requests') ||
        errorCode === 'rate_limit_exceeded' ||
        error?.type === 'rate_limit_error';
    
    if (isRateLimit) {
      console.error('[RATE LIMIT DETECTED] Status:', status, 'Code:', errorCode, 'Message:', errorMessage);
      const retryAfter = error?.response?.headers?.['retry-after'] || error?.headers?.['retry-after'] || '60';
      throw new Error(`Groq API rate limit exceeded. Please wait ${retryAfter} seconds before trying again. Check your usage at https://console.groq.com/dashboard`);
    }
    
    if (errorMessage) {
      throw new Error(`Groq API error: ${errorMessage}`);
    }
    
    throw new Error('Unable to generate AI suggestions. Please check your API key and try again.');
  }
}

export async function chatWithAI(question: string, context?: {
  transactions?: Transaction[];
  budgets?: Budget[];
  goals?: SavingsGoal[];
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return 'AI features require a Groq API key to be configured. Please set GROQ_API_KEY in your environment variables.';
  }

  console.log('[Groq] API key found:', apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4));

  try {
    const groq = getGroqClient();
    if (!groq) {
      throw new Error('Groq API key not configured or invalid. Please check your .env.local file.');
    }
    
    console.log('[Groq] Making API call for chat...');

    const contextPrompt = context
      ? `User's financial context:
- Recent transactions: ${context.transactions?.length || 0}
- Active budgets: ${context.budgets?.length || 0}
- Savings goals: ${context.goals?.length || 0}
`
      : '';

    const completion = await makeGroqCall(
      () => groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
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
      })
    );

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error: any) {
    const status = error?.status || error?.statusCode || error?.response?.status || error?.response?.statusCode;
    const errorCode = error?.code || error?.error?.code;
    const errorMessage = error?.message || error?.error?.message || 'Unknown error';
    
    console.error('[Groq Chat Error]', {
      status,
      code: errorCode,
      message: errorMessage,
      type: error?.type,
    });
    
    const isQuotaExceeded = status === 429 && (
        errorCode === 'insufficient_quota' ||
        error?.code === 'insufficient_quota' ||
        error?.error?.code === 'insufficient_quota' ||
        errorMessage?.toLowerCase().includes('quota') ||
        errorMessage?.toLowerCase().includes('billing') ||
        errorMessage?.toLowerCase().includes('insufficient')
    );
    
    if (isQuotaExceeded) {
      throw new Error('Groq API quota exceeded. Please check your Groq account at https://console.groq.com/limits');
    }
    
    if (errorMessage?.includes('API key') || errorMessage?.includes('Invalid API key')) {
      throw new Error('Groq API key is invalid or missing. Please check your .env.local file and ensure the key starts with "gsk_".');
    }
    if (status === 401 || errorMessage?.includes('401') || errorCode === 'invalid_api_key') {
      throw new Error('Groq API key is invalid or expired. Please check your API key in .env.local and generate a new one at https://console.groq.com/keys if needed.');
    }
    
    const isRateLimit = status === 429 || 
        error?.statusCode === 429 ||
        error?.response?.status === 429 ||
        errorMessage?.toLowerCase().includes('429') || 
        errorMessage?.toLowerCase().includes('rate limit') ||
        errorMessage?.toLowerCase().includes('too many requests') ||
        errorCode === 'rate_limit_exceeded' ||
        error?.type === 'rate_limit_error';
    
    if (isRateLimit) {
      const retryAfter = error?.response?.headers?.['retry-after'] || error?.headers?.['retry-after'] || '60';
      throw new Error(`Groq API rate limit exceeded. Please wait ${retryAfter} seconds before trying again. Check your usage at https://console.groq.com/dashboard`);
    }
    
    if (errorMessage) {
      throw new Error(`Groq API error: ${errorMessage}`);
    }
    
    throw new Error('Unable to get AI response. Please check your API key and try again.');
  }
}
