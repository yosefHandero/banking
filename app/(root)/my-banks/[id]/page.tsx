import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccount } from '@/lib/appwrite/account';
import { getTransactionsByBankId } from '@/lib/appwrite/transaction';
import { formatAmount, formatDateTime } from '@/lib/utils';
import HeaderBox from '@/components/HeaderBox';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface BankAccountPageProps {
  params: { id: string };
}

export default async function BankAccountPage({ params }: BankAccountPageProps) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  const account = await getAccount(params.id);
  if (!account) {
    redirect('/my-banks');
  }

  // CRITICAL SECURITY CHECK: Verify account belongs to user
  if (account.userId !== userInfo.userId) {
    redirect('/my-banks');
  }

  // Pass userId for additional security filtering
  const transactions = await getTransactionsByBankId(account.id, userInfo.userId);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/my-banks">
          <Button variant="ghost" className="flex items-center gap-2">
            <Image src="/icons/arrow-left.svg" width={20} height={20} alt="back" />
            Back
          </Button>
        </Link>
        <HeaderBox
          type="title"
          title={account.name}
          subtext={`Account ending in ${account.mask}`}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-form">
            <p className="text-14 text-gray-600">Current Balance</p>
            <p className="text-24 font-semibold text-gray-900">
              {formatAmount(account.currentBalance)}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-form">
            <p className="text-14 text-gray-600">Available Balance</p>
            <p className="text-24 font-semibold text-gray-900">
              {formatAmount(account.availableBalance)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-20 font-semibold text-gray-900">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-14 text-gray-600">No transactions found</p>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-form"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                      <Image
                        src="/icons/transaction.svg"
                        width={20}
                        height={20}
                        alt="transaction"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-14 font-semibold text-gray-900">
                        {transaction.name}
                      </p>
                      <p className="text-12 text-gray-600">
                        {formatDateTime(transaction.date).dateOnly} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-16 font-semibold ${
                      transaction.amount > 0 ? 'text-success-700' : 'text-gray-900'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

