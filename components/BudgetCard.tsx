import { Budget } from "@/lib/appwrite/budget";
import { formatAmount } from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";

interface BudgetCardProps {
  budget: Budget;
  onDelete?: (budgetId: string) => void;
}

export default function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const percentage =
    budget.limit > 0 ? (budget.currentSpending / budget.limit) * 100 : 0;
  const isOverBudget = percentage > 100;
  const remaining = budget.limit - budget.currentSpending;

  const styles =
    transactionCategoryStyles[
      budget.category as keyof typeof transactionCategoryStyles
    ] || transactionCategoryStyles.default;

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-full ${styles.chipBackgroundColor}`}
          >
            <p className={`text-14 font-semibold ${styles.textColor}`}>
              {budget.category.charAt(0)}
            </p>
          </div>
          <div>
            <p className="text-16 font-semibold text-gray-900">
              {budget.category}
            </p>
            <p className="text-12 text-gray-600">
              {budget.period === "monthly" ? "Monthly" : "Yearly"} Budget
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(budget.$id)}
            className="text-14 text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-14 text-gray-600">Spent</p>
          <p
            className={`text-16 font-semibold ${
              isOverBudget ? "text-red-600" : "text-gray-900"
            }`}
          >
            {formatAmount(budget.currentSpending)} /{" "}
            {formatAmount(budget.limit)}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isOverBudget
                ? "bg-red-600"
                : styles.backgroundColor || "bg-blue-600"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-12 text-gray-600">
            {isOverBudget ? "Over budget by" : "Remaining"}
          </p>
          <p
            className={`text-14 font-medium ${
              isOverBudget ? "text-red-600" : "text-success-700"
            }`}
          >
            {formatAmount(Math.abs(remaining))}
          </p>
        </div>
      </div>
    </div>
  );
}
