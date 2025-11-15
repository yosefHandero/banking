'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getBudgets, createBudget, deleteBudget, Budget } from '@/lib/appwrite/budget';
import HeaderBox from '@/components/HeaderBox';
import BudgetCard from '@/components/BudgetCard';
import BudgetProgress from '@/components/BudgetProgress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().min(1, 'Limit must be greater than 0'),
  period: z.enum(['monthly', 'yearly']),
});

export default function BudgetPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(budgetSchema),
  });

  const categories = [
    'Food and Drink',
    'Travel',
    'Shopping',
    'Entertainment',
    'Bills',
    'Gas Stations',
    'Groceries',
    'Restaurants',
    'Healthcare',
    'Education',
    'Other',
  ];

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push('/sign-in');
        return;
      }

      const currentDate = new Date();
      const allBudgets = await getBudgets(
        userInfo.userId,
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      setBudgets(allBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) return;

      const currentDate = new Date();
      await createBudget({
        userId: userInfo.userId,
        category: data.category,
        limit: data.limit,
        period: data.period,
        month: data.period === 'monthly' ? currentDate.getMonth() : undefined,
        year: currentDate.getFullYear(),
      });

      toast.success('Budget created successfully!');
      setShowForm(false);
      reset();
      loadBudgets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create budget');
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      toast.success('Budget deleted successfully!');
      loadBudgets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-16 text-gray-600">Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <HeaderBox
          type="title"
          title="Budget Management"
          subtext="Create and track your spending budgets"
        />
        <Button onClick={() => setShowForm(!showForm)} className="form-btn">
          {showForm ? 'Cancel' : 'Create Budget'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
          <div className="flex flex-col gap-2">
            <label className="form-label">Category</label>
            <select className="input-class" {...register('category')}>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="form-message">{errors.category.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label">Budget Limit</label>
            <input
              type="number"
              step="0.01"
              className="input-class"
              {...register('limit', { valueAsNumber: true })}
            />
            {errors.limit && (
              <p className="form-message">{errors.limit.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label">Period</label>
            <select className="input-class" {...register('period')}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {errors.period && (
              <p className="form-message">{errors.period.message as string}</p>
            )}
          </div>

          <Button type="submit" className="form-btn">
            Create Budget
          </Button>
        </form>
      )}

      {budgets.length > 0 && <BudgetProgress budgets={budgets} />}

      <div className="flex flex-col gap-4">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-16 text-gray-600">No budgets created yet</p>
            <p className="text-14 text-gray-500">Create your first budget to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <BudgetCard key={budget.$id} budget={budget} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

