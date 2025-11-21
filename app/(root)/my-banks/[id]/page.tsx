"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { getAccount } from "@/lib/appwrite/account";
import { getTransactionsByBankId } from "@/lib/appwrite/transaction";
import { formatAmount, formatDateTime } from "@/lib/utils";
import HeaderBox from "@/components/HeaderBox";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Account } from "@/types";
import { Transaction } from "@/types";
import { generateMockBankAccounts } from "@/lib/mock/bankData";
import { generateMockTransactions } from "@/lib/mock/transactions";
import { getMockBankDetails } from "@/lib/mock/bankDetails";

export default function BankAccountPage() {
  const router = useRouter();
  const params = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

      const accountId = params.id as string;
      
      // Check if it's a mock account ID (slugified name)
      if (accountId.includes('-')) {
        // Generate mock data on the fly to match the ID
        // In a real app, we'd fetch by ID, but for mock we regenerate and find the matching one
        // or just generate one that matches the ID structure
        const allMockAccounts = generateMockBankAccounts(userInfo.userId, 5);
        const mockAccount = allMockAccounts.find(acc => 
          acc.name.toLowerCase().replace(/\s+/g, '-') === accountId
        );

        if (mockAccount) {
          const fullMockAccount: Account = {
            ...mockAccount,
            id: accountId,
            appwriteItemId: 'mock-item-id',
            sharableId: 'mock-share-id',
            userId: userInfo.userId
          };
          
          setAccount(fullMockAccount);
          
          // Generate mock transactions
          const mockTransactions = generateMockTransactions(userInfo.userId, accountId, 20);
          const formattedMockTransactions: Transaction[] = mockTransactions.map((tx: any, index: number) => ({
            ...tx,
            id: `tx-${index + 1}`,
            $id: `tx-${index + 1}`,
            $createdAt: new Date().toISOString(),
            paymentChannelType: 'online'
          }));
          
          setTransactions(formattedMockTransactions);
          setLoading(false);
          return;
        }
      }

      const accountData = await getAccount(accountId);

      if (!accountData) {
        router.push("/my-banks");
        return;
      }

      if (accountData.userId !== userInfo.userId) {
        router.push("/my-banks");
        return;
      }

      const transactionsData = await getTransactionsByBankId(
        accountData.id,
        userInfo.userId
      );

      setAccount(accountData);
      setTransactions(transactionsData);
      setLoading(false);
    }

    loadData();
  }, [router, params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-16 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/my-banks">
          <Button variant="ghost" className="flex items-center gap-2">
            <Image
              src="/icons/arrow-left.svg"
              width={20}
              height={20}
              alt="back"
            />
            Back
          </Button>
        </Link>
        <HeaderBox
          type="title"
          title={account.name}
          subtext={`Account ending in ${account.mask}`}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-form">
            <p className="text-14 text-gray-600">Current Balance</p>
            <p className="text-24 font-semibold text-gray-900">
              {formatAmount(account.currentBalance)}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-form">
            <p className="text-14 text-gray-600">Available Balance</p>
            <p className="text-24 font-semibold text-gray-900">
              {formatAmount(account.availableBalance)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
           <h2 className="text-18 font-semibold text-gray-900">Bank Details</h2>
           <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
              <div className="flex flex-col gap-1">
                <p className="text-14 font-medium text-gray-700">Bank Address</p>
                <p className="text-14 text-gray-600">{getMockBankDetails(account.institutionId).bankAddress}</p>
              </div>
              
              <div className="flex gap-8">
                <div className="flex flex-col gap-1">
                  <p className="text-14 font-medium text-gray-700">Routing Number</p>
                  <p className="text-14 text-gray-600">{getMockBankDetails(account.institutionId).routingNumber}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-14 font-medium text-gray-700">Account Number</p>
                  <p className="text-14 text-gray-600">{getMockBankDetails(account.institutionId).accountNumber}</p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex flex-col gap-1">
                  <p className="text-14 font-medium text-gray-700">Customer Service</p>
                  <p className="text-14 text-gray-600">{getMockBankDetails(account.institutionId).customerService}</p>
                </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-20 font-semibold text-gray-900">
            Recent Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-14 text-gray-600">No transactions found</p>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-form"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                      <Image
                        src="/icons/transaction.svg"
                        width={20}
                        height={20}
                        alt="transaction"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-14 font-semibold text-gray-900">
                        {transaction.name}
                      </p>
                      <p className="text-12 text-gray-600">
                        {formatDateTime(transaction.date).dateOnly} •{" "}
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-16 font-semibold ${
                      transaction.amount > 0
                        ? "text-success-700"
                        : "text-gray-900"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
