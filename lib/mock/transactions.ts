import { Transaction } from '@/types';
import { format, subDays, subMonths } from 'date-fns';

const TRANSACTION_CATEGORIES = [
  'Food and Drink',
  'Travel',
  'Transfer',
  'Payment',
  'Shopping',
  'Entertainment',
  'Gas Stations',
  'Groceries',
  'Restaurants',
  'Bills',
  'Bank Fees',
  'Healthcare',
  'Education',
  'Other',
];

const MERCHANT_NAMES = {
  'Food and Drink': ['Starbucks', 'McDonald\'s', 'Subway', 'Pizza Hut', 'Chipotle'],
  'Travel': ['United Airlines', 'Marriott Hotel', 'Hertz Car Rental', 'Expedia', 'Airbnb'],
  'Shopping': ['Amazon', 'Target', 'Walmart', 'Best Buy', 'Home Depot'],
  'Entertainment': ['Netflix', 'Spotify', 'AMC Theaters', 'Steam', 'PlayStation Store'],
  'Gas Stations': ['Shell', 'Exxon', 'BP', 'Chevron', 'Mobil'],
  'Groceries': ['Whole Foods', 'Kroger', 'Safeway', 'Trader Joe\'s', 'Costco'],
  'Restaurants': ['Olive Garden', 'Red Lobster', 'Outback Steakhouse', 'Applebees', 'TGI Fridays'],
  'Bills': ['Electric Company', 'Water Department', 'Internet Provider', 'Phone Company', 'Insurance'],
  'Healthcare': ['CVS Pharmacy', 'Walgreens', 'Hospital', 'Dentist', 'Doctor'],
  'Education': ['University', 'Textbook Store', 'Online Course', 'Tutoring', 'School Supplies'],
  'Payment': ['Credit Card Payment', 'Loan Payment', 'Mortgage Payment'],
  'Transfer': ['Bank Transfer', 'Venmo', 'PayPal', 'Zelle', 'Cash App'],
  'Bank Fees': ['Monthly Fee', 'ATM Fee', 'Overdraft Fee', 'Service Charge'],
  'Other': ['ATM Withdrawal', 'Cash Deposit', 'Miscellaneous'],
};

const PAYMENT_CHANNELS = ['in store', 'online', 'other', 'atm'];

function getRandomMerchant(category: string): string {
  const merchants = MERCHANT_NAMES[category as keyof typeof MERCHANT_NAMES] || MERCHANT_NAMES['Other'];
  return merchants[Math.floor(Math.random() * merchants.length)];
}

function generateTransactionAmount(category: string): number {
  const ranges: { [key: string]: [number, number] } = {
    'Food and Drink': [5, 50],
    'Restaurants': [20, 150],
    'Travel': [100, 2000],
    'Shopping': [10, 500],
    'Entertainment': [10, 100],
    'Gas Stations': [30, 80],
    'Groceries': [50, 300],
    'Bills': [50, 500],
    'Healthcare': [20, 500],
    'Education': [50, 1000],
    'Payment': [100, 2000],
    'Transfer': [50, 1000],
    'Bank Fees': [5, 50],
    'Other': [10, 200],
  };

  const [min, max] = ranges[category] || [10, 100];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function generateMockTransaction(
  userId: string,
  accountId: string,
  daysAgo: number = 0
): Omit<Transaction, 'id' | '$id' | '$createdAt'> {
  const category = TRANSACTION_CATEGORIES[Math.floor(Math.random() * TRANSACTION_CATEGORIES.length)];
  const merchant = getRandomMerchant(category);
  const amount = generateTransactionAmount(category);
  const type = category === 'Payment' || category === 'Transfer' ? 'deposit' : 'withdrawal';
  const paymentChannel = PAYMENT_CHANNELS[Math.floor(Math.random() * PAYMENT_CHANNELS.length)];
  const date = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
  const pending = daysAgo < 2 && Math.random() > 0.7; // 30% chance if recent

  return {
    name: merchant,
    paymentChannel,
    type,
    accountId,
    amount: type === 'deposit' ? amount : -amount,
    pending,
    category,
    date,
    image: '',
    channel: paymentChannel,
    senderBankId: type === 'deposit' ? '' : accountId,
    receiverBankId: type === 'deposit' ? accountId : '',
  };
}

export function generateMockTransactions(
  userId: string,
  accountId: string,
  count: number = 30,
  daysBack: number = 90
): Omit<Transaction, 'id' | '$id' | '$createdAt'>[] {
  const transactions: Omit<Transaction, 'id' | '$id' | '$createdAt'>[] = [];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * daysBack);
    transactions.push(generateMockTransaction(userId, accountId, daysAgo));
  }

  // Sort by date (most recent first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generateMonthlyTransactions(
  userId: string,
  accountId: string,
  month: number,
  year: number
): Omit<Transaction, 'id' | '$id' | '$createdAt'>[] {
  const transactions: Omit<Transaction, 'id' | '$id' | '$createdAt'>[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const transactionCount = Math.floor(Math.random() * 40) + 20; // 20-60 transactions per month

  for (let i = 0; i < transactionCount; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const date = format(new Date(year, month, day), 'yyyy-MM-dd');
    const category = TRANSACTION_CATEGORIES[Math.floor(Math.random() * TRANSACTION_CATEGORIES.length)];
    const merchant = getRandomMerchant(category);
    const amount = generateTransactionAmount(category);
    const type = category === 'Payment' || category === 'Transfer' ? 'deposit' : 'withdrawal';
    const paymentChannel = PAYMENT_CHANNELS[Math.floor(Math.random() * PAYMENT_CHANNELS.length)];

    transactions.push({
      name: merchant,
      paymentChannel,
      type,
      accountId,
      amount: type === 'deposit' ? amount : -amount,
      pending: false,
      category,
      date,
      image: '',
      channel: paymentChannel,
      senderBankId: type === 'deposit' ? '' : accountId,
      receiverBankId: type === 'deposit' ? accountId : '',
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

