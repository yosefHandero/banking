"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { Account } from "@/types";
import { Transaction } from "@/types";
import { Budget } from "@/lib/appwrite/budget";
import { SavingsGoal } from "@/lib/appwrite/goals";
import { generateMockBankAccounts } from "@/lib/mock/bankData";
import { generateMockTransactions } from "@/lib/mock/transactions";

// Mock user data for demo mode
const DEMO_USER: User = {
  $id: "demo-user-id",
  userId: "demo-user-id",
  email: "demo@example.com",
  firstName: "Yosef",
  lastName: "Demo",
  dwollaCustomerUrl: "",
  dwollaCustomerId: "",
  address1: "",
  city: "",
  state: "",
  postalCode: "",
  dateOfBirth: "",
  ssn: "",
};

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: User | null;
  demoAccounts: Account[];
  demoTransactions: Transaction[];
  demoBudgets: Budget[];
  demoGoals: SavingsGoal[];
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<Account[]>([]);
  const [demoTransactions, setDemoTransactions] = useState<Transaction[]>([]);
  const [demoBudgets, setDemoBudgets] = useState<Budget[]>([]);
  const [demoGoals, setDemoGoals] = useState<SavingsGoal[]>([]);
  const router = useRouter();

  // Initialize demo data
  const initializeDemoData = () => {
    // Generate mock accounts
    const generatedAccounts = generateMockBankAccounts(DEMO_USER.userId, 3);
    const accounts: (Account & { institutionName?: string })[] = generatedAccounts.map((acc: any, index: number) => ({
      ...acc,
      id: `demo-account-${index + 1}`,
      appwriteItemId: `demo-item-${index + 1}`,
      sharableId: `demo-share-${index + 1}`,
      userId: DEMO_USER.userId,
      institutionName: acc.institutionName, // Preserve institutionName from mock data
    }));
    setDemoAccounts(accounts);

    // Generate mock transactions
    const generatedTransactions = generateMockTransactions(
      DEMO_USER.userId,
      accounts[0]?.id || "demo-account-1",
      25
    );
    const transactions: Transaction[] = generatedTransactions.map(
      (tx: any, index: number) => ({
        ...tx,
        id: `demo-tx-${index + 1}`,
        $id: `demo-tx-${index + 1}`,
        $createdAt: new Date().toISOString(),
        paymentChannelType: tx.paymentChannel || "online",
      })
    );
    setDemoTransactions(transactions);

    // Generate mock budgets
    const budgets: Budget[] = [
      {
        $id: "demo-budget-1",
        userId: DEMO_USER.userId,
        category: "Food and Drink",
        limit: 500,
        period: "monthly",
        currentSpending: 245.75,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
      {
        $id: "demo-budget-2",
        userId: DEMO_USER.userId,
        category: "Bills",
        limit: 1000,
        period: "monthly",
        currentSpending: 650.5,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
      {
        $id: "demo-budget-3",
        userId: DEMO_USER.userId,
        category: "Shopping",
        limit: 300,
        period: "monthly",
        currentSpending: 120.25,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    ];
    setDemoBudgets(budgets);

    // Generate mock savings goals
    const goals: SavingsGoal[] = [
      {
        $id: "demo-goal-1",
        userId: DEMO_USER.userId,
        name: "New Car",
        targetAmount: 25000,
        currentAmount: 8500,
        targetDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toISOString(),
        description: "Saving for a Tesla Model 3",
      },
      {
        $id: "demo-goal-2",
        userId: DEMO_USER.userId,
        name: "Vacation",
        targetAmount: 3000,
        currentAmount: 1800,
        targetDate: new Date(
          new Date().setMonth(new Date().getMonth() + 6)
        ).toISOString(),
        description: "Trip to Japan",
      },
      {
        $id: "demo-goal-3",
        userId: DEMO_USER.userId,
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 6200,
        targetDate: new Date(
          new Date().setMonth(new Date().getMonth() + 8)
        ).toISOString(),
        description: "6 months of expenses",
      },
    ];
    setDemoGoals(goals);
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setDemoUser(DEMO_USER);
    initializeDemoData();
    // Store in sessionStorage to persist across page refreshes
    if (typeof window !== "undefined") {
      sessionStorage.setItem("demoMode", "true");
      // Set a cookie so middleware can detect demo mode
      document.cookie = "demo-mode=true; path=/; max-age=86400"; // 24 hours
    }
    router.push("/");
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setDemoUser(null);
    setDemoAccounts([]);
    setDemoTransactions([]);
    setDemoBudgets([]);
    setDemoGoals([]);
    // Clear sessionStorage and cookie
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("demoMode");
      document.cookie = "demo-mode=; path=/; max-age=0";
    }
    router.push("/");
  };

  // Check for demo mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("demoMode");
      if (stored === "true") {
        setIsDemoMode(true);
        setDemoUser(DEMO_USER);
        initializeDemoData();
        // Ensure cookie is set if demo mode is active
        document.cookie = "demo-mode=true; path=/; max-age=86400"; // 24 hours
      }
    }
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        demoUser,
        demoAccounts,
        demoTransactions,
        demoBudgets,
        demoGoals,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

