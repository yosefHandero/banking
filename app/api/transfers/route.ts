import { NextRequest, NextResponse } from 'next/server';
import { getAccount, updateAccountBalance } from '@/lib/appwrite/account';
import { createTransaction } from '@/lib/appwrite/transaction';
import { createMockTransfer, processMockTransfer } from '@/lib/mock/transfers';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fromAccountId, toAccountId, amount, description } = body;

    if (!userId || !fromAccountId || !toAccountId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get accounts
    const fromAccount = await getAccount(fromAccountId);
    const toAccount = await getAccount(toAccountId);

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (amount > fromAccount.availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Create mock transfer
    const transfer = createMockTransfer({
      userId,
      fromAccountId,
      toAccountId,
      amount,
      description,
    });

    // Process transfer (mock)
    const processedTransfer = processMockTransfer(transfer);

    if (processedTransfer.status === 'failed') {
      return NextResponse.json(
        { error: 'Transfer failed' },
        { status: 500 }
      );
    }

    // Update account balances
    await updateAccountBalance(
      fromAccountId,
      fromAccount.currentBalance - amount,
      fromAccount.availableBalance - amount
    );

    await updateAccountBalance(
      toAccountId,
      toAccount.currentBalance + amount,
      toAccount.availableBalance + amount
    );

    // Create transaction records
    const today = format(new Date(), 'yyyy-MM-dd');

    // Outgoing transaction
    await createTransaction({
      userId,
      accountId: fromAccountId,
      name: `Transfer to ${toAccount.name}`,
      amount: -amount,
      type: 'withdrawal',
      category: 'Transfer',
      paymentChannel: 'online',
      date: today,
      pending: false,
      channel: 'online',
      senderBankId: fromAccountId,
      receiverBankId: toAccountId,
    });

    // Incoming transaction
    await createTransaction({
      userId,
      accountId: toAccountId,
      name: `Transfer from ${fromAccount.name}`,
      amount: amount,
      type: 'deposit',
      category: 'Transfer',
      paymentChannel: 'online',
      date: today,
      pending: false,
      channel: 'online',
      senderBankId: fromAccountId,
      receiverBankId: toAccountId,
    });

    return NextResponse.json({
      success: true,
      transfer: processedTransfer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process transfer' },
      { status: 500 }
    );
  }
}

