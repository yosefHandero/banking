"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getAccounts } from "@/lib/appwrite/account";
import { useDemo } from "@/lib/demo/demoContext";
import BankAccountList from "@/components/BankAccountList";
import LoadingBar from "@/components/LoadingBar";
import { Account } from "@/types";

export default function MyBanksPage() {
  const router = useRouter();
  const { isDemoMode, demoUser, demoAccounts } = useDemo();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // If in demo mode, use demo data
      if (isDemoMode && demoUser) {
        setAccounts(demoAccounts);
        setUserId(demoUser.userId);
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

      const accountsData = await getAccounts(userInfo.userId);
      setAccounts(accountsData);
      setUserId(userInfo.userId);
      setLoading(false);
    }

    loadData();
  }, [router, isDemoMode, demoUser, demoAccounts]);

  if (loading) {
    return <LoadingBar />;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <BankAccountList accounts={accounts} userId={userId} />
    </div>
  );
}
