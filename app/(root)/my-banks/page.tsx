"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getAccounts } from "@/lib/appwrite/account";
import BankAccountList from "@/components/BankAccountList";
import { Account } from "@/types";
import { generateMockBankAccounts } from "@/lib/mock/bankData";

export default function MyBanksPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push("/sign-in");
        return;
      }

      const accountsData = await getAccounts(userInfo.userId);
      
      if (accountsData.length === 0) {
        const generatedAccounts = generateMockBankAccounts(userInfo.userId, 2);
        const mockAccounts: Account[] = generatedAccounts.map((acc: any, index: number) => ({
          ...acc,
          id: acc.name.toLowerCase().replace(/\s+/g, '-'),
          appwriteItemId: `mock-item-${index + 1}`,
          sharableId: `mock-share-${index + 1}`,
          userId: userInfo.userId
        }));
        setAccounts(mockAccounts);
      } else {
        setAccounts(accountsData);
      }
      
      setUserId(userInfo.userId);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-16 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <BankAccountList accounts={accounts} userId={userId} />
    </div>
  );
}
