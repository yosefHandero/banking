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
  // Use bankIndex to deterministically select type and subtype
  const type = ACCOUNT_TYPES[bankIndex % ACCOUNT_TYPES.length];
  const subtype = ACCOUNT_SUBTYPES[bankIndex % ACCOUNT_SUBTYPES.length];

  // Generate deterministic balance based on account type and index
  let balance = 0;
  const seed = (bankIndex + 1) * 12345; // Simple seed

  if (type === 'depository') {
    balance = (seed % 50000) + 1000;
  } else if (type === 'credit') {
    balance = -((seed % 10000) + 500);
  } else if (type === 'loan') {
    balance = -((seed % 200000) + 10000);
  } else {
    balance = (seed % 100000) + 5000;
  }

  const mask = String((seed % 9000) + 1000); // 4-digit mask

  return {
    name: `${subtype.charAt(0).toUpperCase() + subtype.slice(1)} ••••${mask}`, // Match format from real accounts
    officialName: `${bank.name} - ${subtype}`,
    mask,
    type,
    subtype,
    currentBalance: Math.round(balance * 100) / 100,
    availableBalance: type === 'credit'
      ? Math.round((Math.abs(balance) * 0.3) * 100) / 100 // 30% credit available
      : Math.round(balance * 100) / 100,
    institutionId: bank.id,
    userId,
    // Add institutionName for logo lookup
    institutionName: bank.name,
  } as Omit<Account, 'id' | 'appwriteItemId' | 'sharableId'> & { institutionName?: string };
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

