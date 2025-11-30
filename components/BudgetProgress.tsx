import { Budget } from "@/lib/appwrite/budget";
import { formatAmount } from "@/lib/utils";

interface BudgetProgressProps {
  budgets: Budget[];
}

export default function BudgetProgress({ budgets }: BudgetProgressProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpending, 0);
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#001122] rounded-lg shadow-form border border-gray-700">
      <h3 className="text-18 font-semibold text-white">
        Overall Budget Status
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-14 text-gray-300">Total Spent</p>
          <p className="text-18 font-semibold text-white">
            {formatAmount(totalSpent)} / {formatAmount(totalBudget)}
          </p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              percentage > 100 ? "bg-red-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-12 text-gray-300">
          {percentage.toFixed(1)}% of total budget used
        </p>
      </div>
    </div>
  );
}
