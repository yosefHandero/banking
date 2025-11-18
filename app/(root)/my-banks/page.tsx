"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccounts } from '@/lib/appwrite/account';
import BankAccountList from '@/components/BankAccountList';
import { useRouter } from 'next/navigation';
import { User, Account } from '@/types';

export default function MyBanksPage() {
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
      <BankAccountList accounts={accounts} userId={userInfo.userId} />
    </div>
  );
}

