"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccounts } from '@/lib/appwrite/account';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';
import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import FinancialSummary from '@/components/FinancialSummary';
import AIInsightsWidget from '@/components/AIInsightsWidget';
import { useRouter } from 'next/navigation';
import { User, Account, Transaction } from '@/types';
import { Budget } from '@/lib/appwrite/budget';
import { SavingsGoal } from '@/lib/appwrite/goals';

export default function Home() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          router.replace('/sign-in');
          return;
        }

        const user = await getUserInfo(currentUser.$id);
        if (!user) {
          router.replace('/sign-in');
          return;
        }

        setUserInfo(user);

        const [accountsData, transactionsData, budgetsData, goalsData] = await Promise.all([
          getAccounts(user.userId),
          getTransactions(user.userId),
          getBudgets(user.userId),
          getSavingsGoals(user.userId),
        ]);

        setAccounts(accountsData);
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setGoals(goalsData);
      } catch (error: any) {
        console.error('Error loading data:', error);
        // Only redirect if it's an auth error, not a data loading error
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('session')) {
          router.replace('/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading || !userInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-16 text-gray-600">Loading...</p>
      </div>
    );
  }

  const totalCurrentBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={userInfo.firstName || 'Guest'}
            subtext="Access and manage your account and transactions"
          />
          <TotalBalanceBox
            accounts={accounts}
            totalBanks={accounts.length}
            totalCurrentBalance={totalCurrentBalance}
          />
        </header>

        <div className="home-content-grid">
          <div className="flex flex-col gap-6">
            <FinancialSummary
              accounts={accounts}
              budgets={budgets}
              goals={goals}
            />
            <RecentTransactions transactions={transactions} />
          </div>

          <div className="flex flex-col gap-6">
            <AIInsightsWidget userId={userInfo.userId} />
          </div>
        </div>
      </div>
    </section>
  );
}