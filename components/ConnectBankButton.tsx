'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEMO_BANKS } from '@/lib/mock/bankData';
import { createBankAccount } from '@/lib/appwrite/account';
import { generateMockBankAccount } from '@/lib/mock/bankData';
import { generateMockTransactions } from '@/lib/mock/transactions';
import { createTransaction } from '@/lib/appwrite/transaction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ConnectBankButtonProps {
  userId: string;
  variant?: 'primary' | 'ghost';
}

export default function ConnectBankButton({ userId, variant = 'primary' }: ConnectBankButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const handleConnectBank = async () => {
    setIsConnecting(true);
    try {
      // Simulate bank connection flow
      const selectedBank = DEMO_BANKS[Math.floor(Math.random() * DEMO_BANKS.length)];
      
      // Generate mock account
      const mockAccount = generateMockBankAccount(userId);
      
      // Create account in database
      const account = await createBankAccount({
        userId,
        name: mockAccount.name,
        officialName: mockAccount.officialName,
        mask: mockAccount.mask,
        type: mockAccount.type,
        subtype: mockAccount.subtype,
        currentBalance: mockAccount.currentBalance,
        availableBalance: mockAccount.availableBalance,
        institutionId: mockAccount.institutionId,
        institutionName: selectedBank.name,
      });

      // Generate and create mock transactions
      const mockTransactions = generateMockTransactions(userId, account.$id, 30, 90);
      for (const transaction of mockTransactions) {
        await createTransaction({
          userId,
          accountId: account.$id,
          name: transaction.name,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          paymentChannel: transaction.paymentChannel,
          date: transaction.date,
          pending: transaction.pending,
          image: transaction.image,
          channel: transaction.channel,
          senderBankId: transaction.senderBankId,
          receiverBankId: transaction.receiverBankId,
        });
      }

      toast.success(`${selectedBank.name} connected successfully!`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect bank');
    } finally {
      setIsConnecting(false);
    }
  };

  const buttonClass = variant === 'primary' 
    ? 'plaidlink-primary' 
    : 'plaidlink-ghost';

  return (
    <Button
      onClick={handleConnectBank}
      disabled={isConnecting}
      className={buttonClass}
    >
      {isConnecting ? 'Connecting...' : 'Connect Bank'}
    </Button>
  );
}

