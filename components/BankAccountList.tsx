import { Account } from "@/types";
import BankCard from "./BankCard";
import ConnectBankButton from "./ConnectBankButton";
import HeaderBox from "./HeaderBox";

interface BankAccountListProps {
  accounts: Account[];
  userId: string;
}

export default function BankAccountList({
  accounts,
  userId,
}: BankAccountListProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <HeaderBox
          type="title"
          title="My Bank Accounts"
          subtext="Manage your connected bank accounts"
        />
        <ConnectBankButton userId={userId} variant="primary" />
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-16 font-medium text-gray-300">
            No bank accounts connected yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {accounts.map((account) => (
            <BankCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </section>
  );
}
