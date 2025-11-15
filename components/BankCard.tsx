import { Account } from '@/types';
import { formatAmount } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface BankCardProps {
  account: Account;
}

export default function BankCard({ account }: BankCardProps) {
  return (
    <Link href={`/my-banks/${account.id}`} className="flex gap-4">
      <div className="flex w-full xl:max-w-[380px]">
        <div className="relative flex size-full max-w-[304px] items-end justify-between rounded-[20px] border border-bankGradient/20 bg-bank-gradient px-5 py-8 shadow-creditCard backdrop-blur-[6px]">
          <div>
            <div className="flex-center flex-col gap-2">
              <div className="flex size-full max-w-[24px] items-center justify-center rounded-full bg-white/30">
                <Image
                  src="/icons/connect-bank.svg"
                  width={20}
                  height={20}
                  alt="connect"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-16 font-semibold text-white">
                  {account.name}
                </h1>
                <p className="text-14 font-normal text-white/80">
                  {account.officialName}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-14 font-medium text-white/60">
                {account.type} •••• {account.mask}
              </p>
              <p className="text-24 font-semibold text-white">
                {formatAmount(account.currentBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

