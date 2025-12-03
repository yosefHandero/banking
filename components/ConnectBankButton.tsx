'use client';

import PlaidLink from './PlaidLink';

interface ConnectBankButtonProps {
  userId: string;
  variant?: 'primary' | 'ghost';
}

export default function ConnectBankButton({ userId, variant = 'primary' }: ConnectBankButtonProps) {
  return <PlaidLink userId={userId} variant={variant} />;
}

