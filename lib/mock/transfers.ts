import { ID } from '@/lib/appwrite/config';

export interface MockTransfer {
  $id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  scheduledFor?: string;
  description?: string;
}

export function createMockTransfer(data: {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  scheduledFor?: string;
  description?: string;
}): MockTransfer {
  return {
    $id: ID.unique(),
    userId: data.userId,
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    amount: data.amount,
    status: 'completed',
    createdAt: new Date().toISOString(),
    scheduledFor: data.scheduledFor,
    description: data.description || 'Transfer',
  };
}

export function processMockTransfer(transfer: MockTransfer): MockTransfer {
  // Simulate transfer processing
  if (transfer.status === 'pending') {
    // 95% success rate for mock transfers
    const success = Math.random() > 0.05;
    return {
      ...transfer,
      status: success ? 'completed' : 'failed',
    };
  }
  return transfer;
}

