import { Transaction } from "@/types";
import TransactionCard from "./TransactionCard";
import Link from "next/link";
import { Button } from "./ui/button";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#001122] rounded-lg shadow-form">
      <div className="flex items-center justify-between">
        <h2 className="text-18 font-semibold text-white">
          Recent Transactions
        </h2>
        <Link href="/transaction-history">
          <Button
            variant="ghost"
            className="text-14 text-gray-300 hover:text-white"
          >
            View All
          </Button>
        </Link>
      </div>
      {recentTransactions.length === 0 ? (
        <p className="text-14 text-gray-300">No recent transactions</p>
      ) : (
        <div className="flex flex-col gap-2">
          {recentTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
