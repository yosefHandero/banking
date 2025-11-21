"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getAccounts } from "@/lib/appwrite/account";
import { getTransactions } from "@/lib/appwrite/transaction";
import { getBudgets } from "@/lib/appwrite/budget";
import { getSavingsGoals } from "@/lib/appwrite/goals";
import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import RecentTransactions from "@/components/RecentTransactions";
import FinancialSummary from "@/components/FinancialSummary";
import AIInsightsWidget from "@/components/AIInsightsWidget";
import { Account } from "@/types";
import { Transaction } from "@/types";
import { Budget } from "@/lib/appwrite/budget";
import { SavingsGoal } from "@/lib/appwrite/goals";
import { generateMockBankAccounts } from "@/lib/mock/bankData";
import { generateMockTransactions } from "@/lib/mock/transactions";

export default function Home() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser || !currentUser.$id) {
          router.push("/sign-in");
          return;
        }

        const user = await getUserInfo(currentUser.$id);
        if (!user || !user.userId) {
          router.push("/sign-in");
          return;
        }

        setUserInfo(user);

        const [accountsData, transactionsData, budgetsData, goalsData] =
          await Promise.all([
            getAccounts(user.userId),
            getTransactions(user.userId),
            getBudgets(user.userId),
            getSavingsGoals(user.userId),
          ]);

        // Use mock data if real data is empty (for demonstration)
        if (accountsData.length === 0) {
           const generatedAccounts = generateMockBankAccounts(user.userId, 2);
           const mockAccounts: Account[] = generatedAccounts.map((acc: any, index: number) => ({
             ...acc,
             id: `mock-${index + 1}`,
             appwriteItemId: `mock-item-${index + 1}`,
             sharableId: `mock-share-${index + 1}`,
             userId: user.userId
           }));
           setAccounts(mockAccounts);
        } else {
           setAccounts(accountsData);
        }

        if (transactionsData.length === 0) {
           // Generate transactions for the first mock account if available, otherwise just random
           const accountId = accountsData.length > 0 ? accountsData[0].id : 'mock-1';
           const generatedTransactions = generateMockTransactions(user.userId, accountId, 10);
           
           const mockTransactions: Transaction[] = generatedTransactions.map((tx: any, index: number) => ({
             ...tx,
             id: `tx-${index + 1}`,
             $id: `tx-${index + 1}`,
             $createdAt: new Date().toISOString(),
             paymentChannelType: 'online' // Ensure this required field is present if not in generator
           }));
           setTransactions(mockTransactions);
        } else {
           setTransactions(transactionsData);
        }

        if (budgetsData.length === 0) {
           const mockBudgets: Budget[] = [
             {
               $id: 'budget-1',
               userId: user.userId,
               category: 'Food and Drink',
               limit: 500,
               period: 'monthly',
               currentSpending: 150.25,
               month: new Date().getMonth() + 1,
               year: new Date().getFullYear()
             },
             {
               $id: 'budget-2',
               userId: user.userId,
               category: 'Bills',
               limit: 1000,
               period: 'monthly',
               currentSpending: 120.50,
               month: new Date().getMonth() + 1,
               year: new Date().getFullYear()
             }
           ];
           setBudgets(mockBudgets);
        } else {
           setBudgets(budgetsData);
        }

        if (goalsData.length === 0) {
           const mockGoals: SavingsGoal[] = [
             {
               $id: 'goal-1',
               userId: user.userId,
               name: 'New Car',
               targetAmount: 25000,
               currentAmount: 5000,
               targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
               description: 'Saving for a Tesla'
             },
             {
               $id: 'goal-2',
               userId: user.userId,
               name: 'Vacation',
               targetAmount: 3000,
               currentAmount: 1200,
               targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
               description: 'Trip to Japan'
             }
           ];
           setGoals(mockGoals);
        } else {
           setGoals(goalsData);
        }

      } catch (error) {
        console.error("Error loading data:", error);
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bank-gradient">
        <p className="text-20 text-white font-semibold">Loading...</p>
      </div>
    );
  }

  const totalCurrentBalance = accounts.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0
  );

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={userInfo?.firstName || "Guest"}
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
            <AIInsightsWidget userId={userInfo?.userId || ""} />
          </div>
        </div>
      </div>
    </section>
  );
}
