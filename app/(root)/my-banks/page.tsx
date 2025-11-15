import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccounts } from '@/lib/appwrite/account';
import BankAccountList from '@/components/BankAccountList';
import { redirect } from 'next/navigation';

export default async function MyBanksPage() {
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
      <BankAccountList accounts={accounts} userId={userInfo.userId} />
    </div>
  );
}

