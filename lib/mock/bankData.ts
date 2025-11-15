import { Account } from '@/types';

const BANKS = [
  { name: 'Chase Bank', id: 'chase_001' },
  { name: 'Bank of America', id: 'bofa_001' },
  { name: 'Wells Fargo', id: 'wells_001' },
  { name: 'Citibank', id: 'citi_001' },
  { name: 'US Bank', id: 'usbank_001' },
];

const ACCOUNT_TYPES = ['depository', 'credit', 'loan', 'investment'];
const ACCOUNT_SUBTYPES = ['checking', 'savings', 'credit card', 'mortgage', 'investment'];

export function generateMockBankAccount(userId: string, bankIndex: number = 0): Omit<Account, 'id' | 'appwriteItemId' | 'sharableId'> {
  const bank = BANKS[bankIndex % BANKS.length];
  const type = ACCOUNT_TYPES[Math.floor(Math.random() * ACCOUNT_TYPES.length)];
  const subtype = ACCOUNT_SUBTYPES[Math.floor(Math.random() * ACCOUNT_SUBTYPES.length)];
  
  // Generate realistic balance based on account type
  let balance = 0;
  if (type === 'depository') {
    balance = Math.random() * 50000 + 1000; // $1,000 - $51,000
  } else if (type === 'credit') {
    balance = -(Math.random() * 10000 + 500); // -$500 to -$10,500 (credit card debt)
  } else if (type === 'loan') {
    balance = -(Math.random() * 200000 + 10000); // -$10,000 to -$210,000
  } else {
    balance = Math.random() * 100000 + 5000; // $5,000 - $105,000
  }

  const mask = String(Math.floor(Math.random() * 9000) + 1000); // 4-digit mask

  return {
    name: `${bank.name} ${subtype.charAt(0).toUpperCase() + subtype.slice(1)}`,
    officialName: `${bank.name} - ${subtype}`,
    mask,
    type,
    subtype,
    currentBalance: Math.round(balance * 100) / 100,
    availableBalance: type === 'credit' 
      ? Math.round((Math.abs(balance) * 0.3) * 100) / 100 // 30% credit available
      : Math.round(balance * 100) / 100,
    institutionId: bank.id,
  };
}

export function generateMockBankAccounts(userId: string, count: number = 3): Omit<Account, 'id' | 'appwriteItemId' | 'sharableId'>[] {
  const accounts: Omit<Account, 'id' | 'appwriteItemId' | 'sharableId'>[] = [];
  
  for (let i = 0; i < count; i++) {
    accounts.push(generateMockBankAccount(userId, i));
  }

  return accounts;
}

export const DEMO_BANKS = BANKS.map((bank, index) => ({
  ...bank,
  logo: `/icons/bank-${index + 1}.svg`, // Placeholder for bank logos
}));

