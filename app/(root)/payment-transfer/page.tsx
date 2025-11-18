"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccounts } from '@/lib/appwrite/account';
import PaymentTransferForm from '@/components/PaymentTransferForm';
import HeaderBox from '@/components/HeaderBox';
import { useRouter } from 'next/navigation';
import { User, Account } from '@/types';

export default function PaymentTransferPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
        const accountsData = await getAccounts(user.userId);
        setAccounts(accountsData);
      } catch (error) {
        console.error('Error loading data:', error);
        router.replace('/sign-in');
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

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Transfer Funds"
        subtext="Move money between your accounts"
      />

      {accounts.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-form">
          <p className="text-16 text-gray-600 mb-4">
            You need at least 2 accounts to make transfers
          </p>
          <p className="text-14 text-gray-500">
            Connect more bank accounts to get started
          </p>
        </div>
      ) : (
        <div className="max-w-2xl">
          <PaymentTransferForm accounts={accounts} userId={userInfo.userId} />
        </div>
      )}
    </div>
  );
}

