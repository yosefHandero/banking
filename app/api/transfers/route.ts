import { NextRequest, NextResponse } from 'next/server';
import { getAccount, updateAccountBalance } from '@/lib/appwrite/account';
import { createTransaction } from '@/lib/appwrite/transaction';
import { createMockTransfer, processMockTransfer } from '@/lib/mock/transfers';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userInfo = await getUserInfo(currentUser.$id);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { fromAccountId, toAccountId, amount, description } = body;

    if (!fromAccountId || !toAccountId || !amount) {
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

    // Verify account ownership - CRITICAL SECURITY CHECK
    if (fromAccount.userId !== userInfo.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Source account does not belong to you' },
        { status: 403 }
      );
    }

    if (toAccount.userId !== userInfo.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Destination account does not belong to you' },
        { status: 403 }
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
      userId: userInfo.userId,
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

    // Update account balances (with userId verification for security)
    await updateAccountBalance(
      fromAccountId,
      fromAccount.currentBalance - amount,
      fromAccount.availableBalance - amount,
      userInfo.userId
    );

    await updateAccountBalance(
      toAccountId,
      toAccount.currentBalance + amount,
      toAccount.availableBalance + amount,
      userInfo.userId
    );

    // Create transaction records
    const today = format(new Date(), 'yyyy-MM-dd');

    // Outgoing transaction
    await createTransaction({
      userId: userInfo.userId,
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
      userId: userInfo.userId,
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

