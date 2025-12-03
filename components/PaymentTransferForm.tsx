"use client";

import { useState } from "react";
import { Account } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import BankDropdown from "./BankDropdown";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo/demoContext";

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Source account is required"),
  toAccountId: z.string().min(1, "Destination account is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
});

interface PaymentTransferFormProps {
  accounts: Account[];
}

export default function PaymentTransferForm({
  accounts,
}: PaymentTransferFormProps) {
  const router = useRouter();
  const { isDemoMode } = useDemo();
  const [isTransferring, setIsTransferring] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(transferSchema),
  });

  const fromAccountId = watch("fromAccountId");
  const selectedFromAccount = accounts.find((acc) => acc.id === fromAccountId);

  const onSubmit = async (data: any) => {
    if (data.fromAccountId === data.toAccountId) {
      toast.error("Source and destination accounts must be different");
      return;
    }

    const fromAccount = accounts.find((acc) => acc.id === data.fromAccountId);
    if (fromAccount && data.amount > fromAccount.availableBalance) {
      toast.error("Insufficient funds");
      return;
    }

    // In demo mode, simulate transfer without writing to database
    if (isDemoMode) {
      setIsTransferring(true);
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        `Demo Mode: Transfer of $${data.amount.toFixed(2)} simulated successfully! (No actual transfer occurred)`
      );
      reset();
      setIsTransferring(false);
      return;
    }

    setIsTransferring(true);
    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          amount: data.amount,
          description: data.description || "Transfer",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Transfer failed");
      }

      toast.success("Transfer completed successfully!");
      reset();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete transfer");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <BankDropdown
        accounts={accounts}
        value={fromAccountId}
        onChange={(id) => setValue("fromAccountId", id)}
        label="From Account"
      />
      {errors.fromAccountId && (
        <p className="form-message">{errors.fromAccountId.message as string}</p>
      )}

      {selectedFromAccount && (
        <div className="p-4 bg-[#001122] rounded-lg border border-gray-700">
          <p className="text-14 text-gray-300">Available Balance</p>
          <p className="text-18 font-semibold text-white">
            ${selectedFromAccount.availableBalance.toFixed(2)}
          </p>
        </div>
      )}

      <BankDropdown
        accounts={accounts}
        value={watch("toAccountId")}
        onChange={(id) => setValue("toAccountId", id)}
        label="To Account"
        excludeAccountId={fromAccountId}
      />
      {errors.toAccountId && (
        <p className="form-message">{errors.toAccountId.message as string}</p>
      )}

      <div className="flex flex-col gap-2">
        <label className="form-label">Amount</label>
        <input
          type="number"
          step="0.01"
          className="input-class"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="form-message">{errors.amount.message as string}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="form-label">Description (Optional)</label>
        <input
          type="text"
          className="input-class"
          placeholder="e.g., Monthly savings transfer"
          {...register("description")}
        />
      </div>

      <Button type="submit" className="form-btn" disabled={isTransferring}>
        {isTransferring ? "Processing..." : "Transfer Funds"}
      </Button>
    </form>
  );
}
