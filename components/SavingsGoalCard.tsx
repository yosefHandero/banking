import { SavingsGoal } from "@/lib/appwrite/goals";
import { formatAmount } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onUpdate?: (goalId: string, amount: number) => void;
  onDelete?: (goalId: string) => void;
}

export default function SavingsGoalCard({
  goal,
  onUpdate,
  onDelete,
}: SavingsGoalCardProps) {
  const percentage =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = percentage >= 100;

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#001122] rounded-lg shadow-form border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-18 font-semibold text-white">{goal.name}</h3>
          {goal.description && (
            <p className="text-14 text-gray-300">{goal.description}</p>
          )}
          {goal.targetDate && (
            <p className="text-12 text-gray-400">
              Target: {format(parseISO(goal.targetDate), "MMM dd, yyyy")}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(goal.$id)}
            className="text-14 text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-14 text-gray-300">Progress</p>
          <p
            className={`text-16 font-semibold ${
              isCompleted ? "text-green-400" : "text-white"
            }`}
          >
            {formatAmount(goal.currentAmount)} /{" "}
            {formatAmount(goal.targetAmount)}
          </p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompleted ? "bg-green-500" : "bg-bankGradient"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-12 text-gray-300">
            {isCompleted ? "Goal achieved!" : "Remaining"}
          </p>
          <p
            className={`text-14 font-medium ${
              isCompleted ? "text-green-400" : "text-white"
            }`}
          >
            {formatAmount(Math.abs(remaining))}
          </p>
        </div>
      </div>

      {onUpdate && !isCompleted && (
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Add amount"
            className="input-class flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const input = e.currentTarget as HTMLInputElement;
                const amount = parseFloat(input.value);
                if (amount > 0) {
                  onUpdate(goal.$id, goal.currentAmount + amount);
                  input.value = "";
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
