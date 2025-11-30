import { NextRequest, NextResponse } from 'next/server';
import { getFinancialSuggestions } from '@/lib/ai/suggestions';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';
import { getAccounts } from '@/lib/appwrite/account';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';

interface CacheEntry {
  suggestions: string[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;
const pendingRequests = new Map<string, Promise<string[]>>();

function getCacheKey(userId: string): string {
  return `suggestions:${userId}`;
}

function getCachedSuggestions(userId: string): string[] | null {
  const key = getCacheKey(userId);
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.suggestions;
}

function setCachedSuggestions(userId: string, suggestions: string[]): void {
  const key = getCacheKey(userId);
  cache.set(key, {
    suggestions,
    timestamp: Date.now(),
  });
}

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

    const cachedSuggestions = getCachedSuggestions(userInfo.userId);
    if (cachedSuggestions) {
      console.log(`[CACHE HIT] Returning cached suggestions for user ${userInfo.userId}`);
      return NextResponse.json({ suggestions: cachedSuggestions });
    }

    const staleCache = cache.get(getCacheKey(userInfo.userId));
    
    let pendingRequest = pendingRequests.get(userInfo.userId);
    if (pendingRequest) {
      console.log(`[PENDING] Waiting for existing request for user ${userInfo.userId}`);
      try {
        const suggestions = await pendingRequest;
        return NextResponse.json({ suggestions });
      } catch (error) {
        if (staleCache) {
          console.warn(`[FALLBACK] Pending request failed, returning stale cache for user ${userInfo.userId}`);
          return NextResponse.json({ suggestions: staleCache.suggestions });
        }
        throw error;
      }
    }

    let resolvePromise!: (value: string[]) => void;
    let rejectPromise!: (error: any) => void;
    const placeholderPromise = new Promise<string[]>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    
    pendingRequests.set(userInfo.userId, placeholderPromise);

    (async () => {
      try {
        console.log(`[API CALL] Making Groq API request for user ${userInfo.userId}`);
        const transactions = await getTransactions(userInfo.userId);
        const budgets = await getBudgets(userInfo.userId);
        const goals = await getSavingsGoals(userInfo.userId);
        const accounts = await getAccounts(userInfo.userId);
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

        const suggestions = await getFinancialSuggestions(transactions, budgets, goals, totalBalance);

        setCachedSuggestions(userInfo.userId, suggestions);
        console.log(`[SUCCESS] Cached new suggestions for user ${userInfo.userId}`);

        resolvePromise(suggestions);
      } catch (apiError: any) {
        const isQuotaExceeded = apiError?.message?.toLowerCase().includes('quota') ||
                               apiError?.message?.toLowerCase().includes('billing');
        
        if (!isQuotaExceeded) {
          console.error(`[ERROR] API call failed for user ${userInfo.userId}:`, apiError.message);
        }
        
        const isRateLimit = !isQuotaExceeded && (
          apiError?.message?.includes('rate limit') || 
          apiError?.message?.includes('429') ||
          apiError?.status === 429
        );
        
        if (isRateLimit && staleCache) {
          console.warn(`[RATE LIMIT] Returning stale cached suggestions for user ${userInfo.userId}`);
          const cachedResult = staleCache.suggestions;
          resolvePromise(cachedResult);
          return;
        }
        
        rejectPromise(apiError);
      } finally {
        pendingRequests.delete(userInfo.userId);
      }
    })();

    try {
      const suggestions = await placeholderPromise;
      return NextResponse.json({ suggestions });
    } catch (error) {
      throw error;
    }
  } catch (error: any) {
    const isQuotaExceeded = error?.message?.toLowerCase().includes('quota') ||
                           error?.message?.toLowerCase().includes('billing');
    
    if (!isQuotaExceeded) {
      console.error('API Error in suggestions route:', error.message);
    }
    const isRateLimit = error?.message?.includes('rate limit') || 
                       error?.message?.includes('429');
    
    let statusCode = 500;
    if (isQuotaExceeded || isRateLimit) {
      statusCode = 429;
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get suggestions',
        errorType: isQuotaExceeded ? 'quota_exceeded' : isRateLimit ? 'rate_limit' : 'unknown'
      },
      { status: statusCode }
    );
  }
}
