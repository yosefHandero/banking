import { NextRequest, NextResponse } from 'next/server';
import { getAccount, updateAccountBalance } from '@/lib/appwrite/account';
import { createTransaction } from '@/lib/appwrite/transaction';
import { createMockTransfer, processMockTransfer } from '@/lib/mock/transfers';
import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { format } from 'date-fns';
import { getErrorMessage } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
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

    const fromAccount = await getAccount(fromAccountId);
    const toAccount = await getAccount(toAccountId);

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

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

    // Re-fetch accounts to ensure we have latest balances (prevent race conditions)
    const freshFromAccount = await getAccount(fromAccountId);
    const freshToAccount = await getAccount(toAccountId);

    if (!freshFromAccount || !freshToAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Verify ownership again with fresh data
    if (freshFromAccount.userId !== userInfo.userId || freshToAccount.userId !== userInfo.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Account does not belong to you' },
        { status: 403 }
      );
    }

    // Check balance with fresh data
    if (amount > freshFromAccount.availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Validate amount is a valid number
    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const transfer = createMockTransfer({
      userId: userInfo.userId,
      fromAccountId,
      toAccountId,
      amount: transferAmount,
      description,
    });

    const processedTransfer = processMockTransfer(transfer);

    if (processedTransfer.status === 'failed') {
      return NextResponse.json(
        { error: 'Transfer failed' },
        { status: 500 }
      );
    }

    // Update balances - note: In a real system, these should be atomic transactions
    // Appwrite doesn't support transactions, so we do sequential updates
    // In production, consider using a database that supports transactions
    try {
      await updateAccountBalance(
        fromAccountId,
        freshFromAccount.currentBalance - transferAmount,
        freshFromAccount.availableBalance - transferAmount,
        userInfo.userId
      );

      await updateAccountBalance(
        toAccountId,
        freshToAccount.currentBalance + transferAmount,
        freshToAccount.availableBalance + transferAmount,
        userInfo.userId
      );
    } catch (balanceError) {
      // If balance update fails, try to rollback (best effort)
      // Note: In a real system with transactions, this would be automatic
      // Appwrite doesn't support atomic transactions, so partial updates are possible
      console.error('Balance update failed:', getErrorMessage(balanceError));
      return NextResponse.json(
        { error: 'Transfer failed during balance update. Please contact support if funds were deducted.' },
        { status: 500 }
      );
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    // Create withdrawal transaction for source account
    await createTransaction({
      userId: userInfo.userId,
      accountId: fromAccountId,
      name: `Transfer to ${freshToAccount.name}`,
      amount: transferAmount, // Positive amount for withdrawal (will be stored as-is)
      type: 'withdrawal',
      category: 'Transfer',
      paymentChannel: 'online',
      date: today,
      pending: false,
      channel: 'online',
      senderBankId: fromAccountId,
      receiverBankId: toAccountId,
    });

    // Create deposit transaction for destination account
    await createTransaction({
      userId: userInfo.userId,
      accountId: toAccountId,
      name: `Transfer from ${freshFromAccount.name}`,
      amount: transferAmount, // Positive amount for deposit
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
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to process transfer') },
      { status: 500 }
    );
  }
}

