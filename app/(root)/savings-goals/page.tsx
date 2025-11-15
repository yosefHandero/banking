"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  SavingsGoal,
} from "@/lib/appwrite/goals";
import HeaderBox from "@/components/HeaderBox";
import SavingsGoalCard from "@/components/SavingsGoalCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().min(1, "Target amount must be greater than 0"),
  targetDate: z.string().optional(),
  description: z.string().optional(),
});

export default function SavingsGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(goalSchema),
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push("/sign-in");
        return;
      }

      const allGoals = await getSavingsGoals(userInfo.userId);
      setGoals(allGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
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

      await createSavingsGoal({
        userId: userInfo.userId,
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate || undefined,
        description: data.description || undefined,
      });

      toast.success("Savings goal created successfully!");
      setShowForm(false);
      reset();
      loadGoals();
    } catch (error: any) {
      toast.error(error.message || "Failed to create goal");
    }
  };

  const handleUpdate = async (goalId: string, newAmount: number) => {
    try {
      await updateSavingsGoal(goalId, { currentAmount: newAmount });
      toast.success("Goal updated successfully!");
      loadGoals();
    } catch (error: any) {
      toast.error(error.message || "Failed to update goal");
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteSavingsGoal(goalId);
      toast.success("Goal deleted successfully!");
      loadGoals();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete goal");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-16 text-gray-600">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <HeaderBox
          type="title"
          title="Savings Goals"
          subtext="Track your progress toward financial goals"
        />
        <Button onClick={() => setShowForm(!showForm)} className="form-btn">
          {showForm ? "Cancel" : "Create Goal"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form"
        >
          <div className="flex flex-col gap-2">
            <label className="form-label">Goal Name</label>
            <input
              type="text"
              className="input-class"
              placeholder="e.g., Emergency Fund, Vacation"
              {...register("name")}
            />
            {errors.name && (
              <p className="form-message">{errors.name.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label">Target Amount</label>
            <input
              type="number"
              step="0.01"
              className="input-class"
              {...register("targetAmount", { valueAsNumber: true })}
            />
            {errors.targetAmount && (
              <p className="form-message">
                {errors.targetAmount.message as string}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label">Target Date (Optional)</label>
            <input
              type="date"
              className="input-class"
              {...register("targetDate")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="input-class"
              rows={3}
              {...register("description")}
            />
          </div>

          <Button type="submit" className="form-btn">
            Create Goal
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-16 text-gray-600">
              No savings goals created yet
            </p>
            <p className="text-14 text-gray-500">
              Create your first goal to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.$id}
                goal={goal}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
