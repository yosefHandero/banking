import { Account } from '@/types';
import { formatAmount } from '@/lib/utils';

interface BankDropdownProps {
  accounts: Account[];
  value?: string;
  onChange?: (accountId: string) => void;
  label?: string;
  excludeAccountId?: string;
}

export default function BankDropdown({
  accounts,
  value,
  onChange,
  label = 'Select Account',
  excludeAccountId,
}: BankDropdownProps) {
  const filteredAccounts = excludeAccountId
    ? accounts.filter((acc) => acc.id !== excludeAccountId)
    : accounts;

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="form-label">{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="input-class"
      >
        <option value="">{label}</option>
        {filteredAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} - {formatAmount(account.currentBalance)}
          </option>
        ))}
      </select>
    </div>
  );
}

