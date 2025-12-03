'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/lib/demo/demoContext';

interface PlaidLinkProps {
  userId: string;
  variant?: 'primary' | 'ghost';
  dwollaCustomerId?: string;
}

export default function PlaidLink({ userId, variant = 'primary', dwollaCustomerId }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    // Don't create link token in demo mode
    if (isDemoMode) {
      return;
    }

    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create link token');
        }

        const data = await response.json();
        setLinkToken(data.linkToken);
      } catch (error: any) {
        console.error('Error creating link token:', error);
        toast.error(error.message || 'Failed to initialize bank connection');
      }
    };

    if (userId) {
      createLinkToken();
    }
  }, [userId, isDemoMode]);

  const onSuccess = useCallback(
    async (publicToken: string) => {
      setIsLoading(true);
      try {
        // Exchange public token for access token and fetch accounts
        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicToken,
            userId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to connect bank';
          const errorDetails = errorData.details ? ` Details: ${Array.isArray(errorData.details) ? errorData.details.join(', ') : errorData.details}` : '';
          throw new Error(errorMessage + errorDetails);
        }

        const data = await response.json();
        toast.success(data.message || 'Bank connected successfully!');
        router.refresh();
      } catch (error: any) {
        console.error('Error exchanging token:', error);
        // Show detailed error message
        const errorMessage = error.message || 'Failed to connect bank';
        toast.error(errorMessage, {
          duration: 5000, // Show for 5 seconds to read details
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, router]
  );

  const config = {
    token: linkToken,
    onSuccess,
    onExit: (err: any) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Bank connection cancelled or failed');
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  const buttonClass = variant === 'primary' 
    ? 'plaidlink-primary' 
    : 'plaidlink-ghost';

  const isDisabled = isDemoMode || !ready || isLoading || !linkToken;

  const handleClick = () => {
    if (isDemoMode) {
      toast.info('Bank connection is disabled in demo mode. Sign up to connect real banks.');
      return;
    }
    open();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={buttonClass}
      title={isDemoMode ? 'Bank connection is disabled in demo mode' : undefined}
    >
      {isLoading ? 'Connecting...' : 'Connect Bank'}
    </Button>
  );
}

