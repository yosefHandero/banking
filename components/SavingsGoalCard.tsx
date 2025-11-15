import { SavingsGoal } from '@/lib/appwrite/goals';
import { formatAmount } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onUpdate?: (goalId: string, amount: number) => void;
  onDelete?: (goalId: string) => void;
}

export default function SavingsGoalCard({ goal, onUpdate, onDelete }: SavingsGoalCardProps) {
  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = percentage >= 100;

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-18 font-semibold text-gray-900">{goal.name}</h3>
          {goal.description && (
            <p className="text-14 text-gray-600">{goal.description}</p>
          )}
          {goal.targetDate && (
            <p className="text-12 text-gray-500">
              Target: {format(parseISO(goal.targetDate), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(goal.$id)}
            className="text-14 text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-14 text-gray-600">Progress</p>
          <p className={`text-16 font-semibold ${isCompleted ? 'text-success-700' : 'text-gray-900'}`}>
            {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompleted ? 'bg-success-600' : 'bg-bankGradient'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-12 text-gray-600">
            {isCompleted ? 'Goal achieved!' : 'Remaining'}
          </p>
          <p className={`text-14 font-medium ${isCompleted ? 'text-success-700' : 'text-gray-900'}`}>
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
              if (e.key === 'Enter') {
                const input = e.currentTarget as HTMLInputElement;
                const amount = parseFloat(input.value);
                if (amount > 0) {
                  onUpdate(goal.$id, goal.currentAmount + amount);
                  input.value = '';
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

