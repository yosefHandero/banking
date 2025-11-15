import { Transaction } from '@/types';
import { formatAmount, formatDateTime } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import Image from 'next/image';

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-form hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`flex size-10 items-center justify-center rounded-full ${
          isPositive ? 'bg-success-100' : 'bg-gray-100'
        }`}>
          <Image
            src="/icons/transaction.svg"
            width={20}
            height={20}
            alt="transaction"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-14 font-semibold text-gray-900">
            {transaction.name}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-12 text-gray-600">
              {formatDateTime(transaction.date).dateOnly}
            </p>
            <span className="text-gray-400">•</span>
            <CategoryBadge category={transaction.category} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p
          className={`text-16 font-semibold ${
            isPositive ? 'text-success-700' : 'text-gray-900'
          }`}
        >
          {isPositive ? '+' : ''}
          {formatAmount(transaction.amount)}
        </p>
        {transaction.pending && (
          <span className="text-12 text-gray-500">Pending</span>
        )}
      </div>
    </div>
  );
}

