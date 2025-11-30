import { Account } from "@/types";
import { Budget } from "@/lib/appwrite/budget";
import { SavingsGoal } from "@/lib/appwrite/goals";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";

interface FinancialSummaryProps {
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
}

export default function FinancialSummary({
  accounts,
  budgets,
  goals,
}: FinancialSummaryProps) {
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0
  );
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpending, 0);
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-6 bg-[#001122] rounded-lg shadow-form">
        <p className="text-14 text-gray-300 mb-2">Total Balance</p>
        <p className="text-24 font-semibold text-white">
          {formatAmount(totalBalance)}
        </p>
        <Link
          href="/my-banks"
          className="text-12 text-blue-400 mt-2 inline-block"
        >
          View Accounts →
        </Link>
      </div>

      <div className="p-6 bg-[#001122] rounded-lg shadow-form">
        <p className="text-14 text-gray-300 mb-2">Budget Status</p>
        <p className="text-24 font-semibold text-white">
          {formatAmount(totalSpent)} / {formatAmount(totalBudget)}
        </p>
        <Link
          href="/budget"
          className="text-12 text-blue-400 mt-2 inline-block"
        >
          Manage Budget →
        </Link>
      </div>

      <div className="p-6 bg-[#001122] rounded-lg shadow-form">
        <p className="text-14 text-gray-300 mb-2">Savings Goals</p>
        <p className="text-24 font-semibold text-white">
          {formatAmount(totalGoalProgress)} / {formatAmount(totalGoalTarget)}
        </p>
        <Link
          href="/savings-goals"
          className="text-12 text-blue-400 mt-2 inline-block"
        >
          View Goals →
        </Link>
      </div>

      <div className="p-6 bg-[#001122] rounded-lg shadow-form">
        <p className="text-14 text-gray-300 mb-2">Connected Banks</p>
        <p className="text-24 font-semibold text-white">{accounts.length}</p>
        <Link
          href="/my-banks"
          className="text-12 text-blue-400 mt-2 inline-block"
        >
          Manage Banks →
        </Link>
      </div>
    </div>
  );
}
