'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getTransactions } from '@/lib/appwrite/transaction';
import { Transaction } from '@/types';
import HeaderBox from '@/components/HeaderBox';
import TransactionCard from '@/components/TransactionCard';
import TransactionFilters from '@/components/TransactionFilters';
import { useRouter } from 'next/navigation';

export default function TransactionHistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push('/sign-in');
        return;
      }

      const allTransactions = await getTransactions(userInfo.userId);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.search) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-16 text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Transaction History"
        subtext="View and manage all your transactions"
      />

      <TransactionFilters onFilterChange={handleFilterChange} />

      <div className="flex flex-col gap-4">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-16 text-gray-600">No transactions found</p>
          </div>
        ) : (
          <>
            <p className="text-14 text-gray-600">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-2">
              {filteredTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

