import { Transaction } from "@/types";
import { formatAmount, formatDateTime } from "@/lib/utils";
import CategoryBadge from "./CategoryBadge";
import Image from "next/image";

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-[#001122] rounded-lg shadow-form hover:shadow-md transition-shadow border border-gray-700">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${
            isPositive ? "bg-success-600/20" : "bg-gray-700"
          }`}
        >
          <Image
            src="/icons/transaction.svg"
            width={20}
            height={20}
            alt="transaction"
            className="invert"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-14 font-semibold text-white">{transaction.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-12 text-gray-300">
              {formatDateTime(transaction.date).dateOnly}
            </p>
            <span className="text-gray-500">•</span>
            <CategoryBadge category={transaction.category} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p
          className={`text-16 font-semibold ${
            isPositive ? "text-green-400" : "text-white"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatAmount(transaction.amount)}
        </p>
        {transaction.pending && (
          <span className="text-12 text-gray-400">Pending</span>
        )}
      </div>
    </div>
  );
}
