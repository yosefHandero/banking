"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getAccounts } from "@/lib/appwrite/account";
import PaymentTransferForm from "@/components/PaymentTransferForm";
import HeaderBox from "@/components/HeaderBox";
import LoadingBar from "@/components/LoadingBar";
import { Account } from "@/types";
import { generateMockBankAccounts } from "@/lib/mock/bankData";

export default function PaymentTransferPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
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
        const mockAccounts: Account[] = generatedAccounts.map(
          (acc: any, index: number) => ({
            ...acc,
            id: `mock-${index + 1}`,
            appwriteItemId: `mock-item-${index + 1}`,
            sharableId: `mock-share-${index + 1}`,
            userId: userInfo.userId,
          })
        );
        setAccounts(mockAccounts);
      } else {
        setAccounts(accountsData);
      }
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return <LoadingBar />;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Transfer Funds"
        subtext="Move money between your accounts"
      />

      {accounts.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#001122] rounded-lg shadow-form border border-gray-700">
          <p className="text-16 text-gray-300 mb-4">
            You need at least 2 accounts to make transfers
          </p>
          <p className="text-14 text-gray-400">
            Connect more bank accounts to get started
          </p>
        </div>
      ) : (
        <div className="max-w-2xl">
          <PaymentTransferForm accounts={accounts} />
        </div>
      )}
    </div>
  );
}
