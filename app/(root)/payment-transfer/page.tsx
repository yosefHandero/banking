import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccounts } from '@/lib/appwrite/account';
import PaymentTransferForm from '@/components/PaymentTransferForm';
import HeaderBox from '@/components/HeaderBox';
import { redirect } from 'next/navigation';

export default async function PaymentTransferPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  const accounts = await getAccounts(userInfo.userId);

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Transfer Funds"
        subtext="Move money between your accounts"
      />

      {accounts.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-form">
          <p className="text-16 text-gray-600 mb-4">
            You need at least 2 accounts to make transfers
          </p>
          <p className="text-14 text-gray-500">
            Connect more bank accounts to get started
          </p>
        </div>
      ) : (
        <div className="max-w-2xl">
          <PaymentTransferForm accounts={accounts} userId={userInfo.userId} />
        </div>
      )}
    </div>
  );
}

