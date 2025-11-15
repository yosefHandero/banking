import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import { getAccounts } from '@/lib/appwrite/account';
import { getTransactions } from '@/lib/appwrite/transaction';
import { getBudgets } from '@/lib/appwrite/budget';
import { getSavingsGoals } from '@/lib/appwrite/goals';
import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RecentTransactions from '@/components/RecentTransactions';
import FinancialSummary from '@/components/FinancialSummary';
import AIInsightsWidget from '@/components/AIInsightsWidget';
import { redirect } from 'next/navigation';

export default async function Home() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  const accounts = await getAccounts(userInfo.userId);
  const transactions = await getTransactions(userInfo.userId);
  const budgets = await getBudgets(userInfo.userId);
  const goals = await getSavingsGoals(userInfo.userId);

  const totalCurrentBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={userInfo.firstName || 'Guest'}
            subtext="Access and manage your account and transactions"
          />
          <TotalBalanceBox
            accounts={accounts}
            totalBanks={accounts.length}
            totalCurrentBalance={totalCurrentBalance}
          />
        </header>

        <div className="home-content-grid">
          <div className="flex flex-col gap-6">
            <FinancialSummary
              accounts={accounts}
              budgets={budgets}
              goals={goals}
            />
            <RecentTransactions transactions={transactions} />
          </div>

          <div className="flex flex-col gap-6">
            <AIInsightsWidget userId={userInfo.userId} />
          </div>
        </div>
      </div>
    </section>
  );
}