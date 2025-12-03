"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getAccounts } from "@/lib/appwrite/account";
import { getTransactions } from "@/lib/appwrite/transaction";
import { getBudgets } from "@/lib/appwrite/budget";
import { getSavingsGoals } from "@/lib/appwrite/goals";
import { useDemo } from "@/lib/demo/demoContext";
import HeaderBox from "@/components/HeaderBox";
import RecentTransactions from "@/components/RecentTransactions";
import FinancialSummary from "@/components/FinancialSummary";
import LoadingBar from "@/components/LoadingBar";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Account } from "@/types";
import { Transaction } from "@/types";
import { Budget } from "@/lib/appwrite/budget";
import { SavingsGoal } from "@/lib/appwrite/goals";

export default function Home() {
  const router = useRouter();
  const { isDemoMode, demoUser, demoAccounts, demoTransactions, demoBudgets, demoGoals, enterDemoMode } = useDemo();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // If in demo mode, proceed to load dashboard data
      if (isDemoMode) {
        setCheckingAuth(false);
        return;
      }

      // Check if user is authenticated
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setCheckingAuth(false);
        return;
      }

      setCheckingAuth(false);
    }

    checkAuth();
  }, [isDemoMode]);

  useEffect(() => {
    async function loadData() {
      if (checkingAuth) return;

      try {
        // If in demo mode, use demo data
        if (isDemoMode && demoUser) {
          setUserInfo(demoUser);
          setAccounts(demoAccounts);
          setTransactions(demoTransactions);
          setBudgets(demoBudgets);
          setGoals(demoGoals);
          setLoading(false);
          return;
        }

        // Otherwise, load real data
        const currentUser = await getCurrentUser();

        if (!currentUser || !currentUser.$id) {
          setLoading(false);
          return;
        }

        const user = await getUserInfo(currentUser.$id);
        if (!user || !user.userId) {
          setLoading(false);
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

        setAccounts(accountsData);
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setGoals(goalsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [checkingAuth, router, isDemoMode, demoUser, demoAccounts, demoTransactions, demoBudgets, demoGoals]);

  const handleDemoMode = () => {
    enterDemoMode();
    router.refresh();
  };

  // Show loading while checking auth
  if (checkingAuth || loading) {
    return <LoadingBar />;
  }

  // Show landing page if not authenticated and not in demo mode
  if (!isDemoMode && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001122] via-[#001a33] to-[#002244] flex flex-col">
        {/* Navigation Bar */}
        <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" width={34} height={34} alt="logo" />
            <h1 className="text-24 font-semibold text-white">xyz</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleDemoMode}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              Try Demo Mode
            </Button>
            <Link href="/sign-in">
              <Button className="px-6 py-2 bg-transparent border border-gray-600 hover:border-gray-500 text-white rounded-lg transition-all duration-200">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Modern Banking
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                Manage your finances with AI-powered insights, seamless transfers, and comprehensive transaction tracking.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={handleDemoMode}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Try Demo Mode
              </Button>
              <Link href="/sign-in">
                <Button className="px-8 py-4 text-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105">
                  Sign In / Get Started
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-gray-800">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-200 hover:scale-105">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/icons/dollar-circle.svg"
                    width={24}
                    height={24}
                    alt="Dashboard"
                    className="invert"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Dashboard
                </h3>
                <p className="text-gray-400 text-sm">
                  Get a comprehensive view of your finances with real-time balance tracking and financial summaries.
                </p>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-200 hover:scale-105">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/icons/money-send.svg"
                    width={24}
                    height={24}
                    alt="Transfers"
                    className="invert"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Transfer Funds
                </h3>
                <p className="text-gray-400 text-sm">
                  Seamlessly move money between your accounts with instant transfers and transaction tracking.
                </p>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-200 hover:scale-105">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/icons/monitor.svg"
                    width={24}
                    height={24}
                    alt="AI Insights"
                    className="invert"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI Insights
                </h3>
                <p className="text-gray-400 text-sm">
                  Get personalized financial advice powered by AI to help you make smarter money decisions.
                </p>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src="/icons/dollar-circle.svg"
                    width={20}
                    height={20}
                    alt="My Banks"
                    className="invert"
                  />
                  <h4 className="text-lg font-semibold text-white">My Banks</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Connect and manage multiple bank accounts in one place.
                </p>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src="/icons/transaction.svg"
                    width={20}
                    height={20}
                    alt="Transaction History"
                    className="invert"
                  />
                  <h4 className="text-lg font-semibold text-white">
                    Transaction History
                  </h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Track all your transactions with advanced filtering and search.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 xyz Banking. All rights reserved.
          </p>
        </footer>
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
        </header>

        <div className="flex flex-col gap-6">
          <FinancialSummary
            accounts={accounts}
            budgets={budgets}
            goals={goals}
            totalCurrentBalance={totalCurrentBalance}
            userId={userInfo?.userId || ""}
          />
          <RecentTransactions transactions={transactions} />
        </div>
      </div>
    </section>
  );
}
