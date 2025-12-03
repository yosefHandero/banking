import { Transaction } from "@/types";
import { formatAmount, formatDateTime } from "@/lib/utils";
import CategoryBadge from "./CategoryBadge";
import Image from "next/image";

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isPositive = transaction.amount > 0;
  
  // Safely format date with error handling
  const formatDate = () => {
    try {
      if (!transaction.date && !transaction.$createdAt) {
        return "N/A";
      }
      const dateToFormat = transaction.date || transaction.$createdAt || new Date().toISOString();
      const formatted = formatDateTime(dateToFormat);
      return formatted.dateOnly;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
      <div className="flex items-center gap-3">
        <Image
          src="/icons/transaction.svg"
          width={16}
          height={16}
          alt="transaction"
          className="invert opacity-70"
        />
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-white">{transaction.name || "Unnamed Transaction"}</p>
          <div className="flex items-center gap-2">
            <p className="text-12 text-gray-400">
              {formatDate()}
            </p>
            {transaction.category && (
              <CategoryBadge category={transaction.category} />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <p
          className={`text-14 font-semibold ${
            isPositive ? "text-green-400" : "text-white"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatAmount(transaction.amount)}
        </p>
      </div>
    </div>
  );
}
