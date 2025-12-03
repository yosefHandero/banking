"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getTransactions } from "@/lib/appwrite/transaction";
import { useDemo } from "@/lib/demo/demoContext";
import { Transaction } from "@/types";
import HeaderBox from "@/components/HeaderBox";
import TransactionCard from "@/components/TransactionCard";
import TransactionFilters from "@/components/TransactionFilters";
import LoadingBar from "@/components/LoadingBar";
import { useRouter } from "next/navigation";

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { isDemoMode, demoUser, demoTransactions } = useDemo();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const applyFilters = useCallback(
    (transactionsToFilter: Transaction[], currentFilters: typeof filters) => {
      // If no transactions loaded yet, return empty array
      if (transactionsToFilter.length === 0) {
        return [];
      }

      let filtered = [...transactionsToFilter];

      // Category filter - only filter if category is set and not "All"
      if (
        currentFilters.category &&
        currentFilters.category !== "All" &&
        currentFilters.category !== ""
      ) {
        filtered = filtered.filter((t) => {
          return t.category === currentFilters.category;
        });
      }

      // Date filters - handle both ISO date strings and yyyy-MM-dd format
      if (currentFilters.dateFrom) {
        filtered = filtered.filter((t) => {
          try {
            // Handle different date formats
            let transactionDate: Date;
            if (t.date) {
              transactionDate = new Date(t.date);
            } else if (t.$createdAt) {
              transactionDate = new Date(t.$createdAt);
            } else {
              return true; // Include if no date available
            }

            // Check if date is valid
            if (isNaN(transactionDate.getTime())) {
              return true; // Include if invalid date
            }

            // Convert to yyyy-MM-dd format for comparison
            const transactionDateStr = transactionDate
              .toISOString()
              .split("T")[0];
            const filterDateStr = currentFilters.dateFrom;

            // Compare date strings (yyyy-MM-dd format)
            return transactionDateStr >= filterDateStr;
          } catch (error) {
            console.error("Error comparing dateFrom:", error, t.date);
            return true; // Include transaction if date parsing fails
          }
        });
      }

      if (currentFilters.dateTo) {
        filtered = filtered.filter((t) => {
          try {
            // Handle different date formats
            let transactionDate: Date;
            if (t.date) {
              transactionDate = new Date(t.date);
            } else if (t.$createdAt) {
              transactionDate = new Date(t.$createdAt);
            } else {
              return true; // Include if no date available
            }

            // Check if date is valid
            if (isNaN(transactionDate.getTime())) {
              return true; // Include if invalid date
            }

            // Convert to yyyy-MM-dd format for comparison
            const transactionDateStr = transactionDate
              .toISOString()
              .split("T")[0];
            const filterDateStr = currentFilters.dateTo;

            // Compare date strings (yyyy-MM-dd format)
            return transactionDateStr <= filterDateStr;
          } catch (error) {
            console.error("Error comparing dateTo:", error, t.date);
            return true; // Include transaction if date parsing fails
          }
        });
      }

      return filtered;
    },
    []
  );

  // Memoize filtered transactions for performance
  const filteredTransactions = useMemo(() => {
    return applyFilters(transactions, filters);
  }, [transactions, filters, applyFilters]);

  const loadTransactions = async () => {
    try {
      setError(null);
      setLoading(true);

      // If in demo mode, use demo data
      if (isDemoMode && demoUser && demoTransactions) {
        setTransactions(demoTransactions || []);
        setLoading(false);
        return;
      }

      // Otherwise, load real data
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push("/");
        return;
      }

      const allTransactions = await getTransactions(userInfo.userId);
      setTransactions(allTransactions || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return <LoadingBar />;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Transaction History"
        subtext="View and manage all your transactions"
      />

      <TransactionFilters onFilterChange={handleFilterChange} />

      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-16 text-red-400 font-medium">{error}</p>
          <button
            onClick={loadTransactions}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {!error && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-16 text-gray-300">No transactions found</p>
            <p className="text-14 text-gray-400 mt-2">
              Connect a bank account to see your transactions
            </p>
          </div>
        ) : !error && filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-16 text-gray-300">
              No transactions match your filters
            </p>
            <p className="text-14 text-gray-400 mt-2">
              {transactions.length} total transaction
              {transactions.length !== 1 ? "s" : ""} available
            </p>
          </div>
        ) : !error ? (
          <>
            <p className="text-14 text-gray-300">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transaction
              {transactions.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-2">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id || transaction.$id}
                  transaction={transaction}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
