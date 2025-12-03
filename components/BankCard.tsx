"use client";

import { Account } from "@/types";
import { formatAmount } from "@/lib/utils";
import { getBankLogo, getBankInitials } from "@/lib/utils/bankLogos";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BankCardProps {
  account: Account;
}

export default function BankCard({ account }: BankCardProps) {
  // Use institutionName if available (from accountDetails), otherwise try to extract from officialName
  const accountWithInstitution = account as Account & { institutionName?: string };
  let institutionName = accountWithInstitution.institutionName || '';
  
  // If no institutionName, try to extract from officialName
  if (!institutionName && account.officialName && account.officialName !== account.name) {
    // officialName from Plaid often contains bank name (e.g., "Chase Total Checking" or "Bank of America - Checking")
    const officialName = account.officialName;
    const accountTypes = ['checking', 'savings', 'credit', 'card', 'loan', 'mortgage', 'investment', 'total', 'premier'];
    let cleaned = officialName.toLowerCase();
    for (const type of accountTypes) {
      cleaned = cleaned.replace(new RegExp(`\\b${type}\\b`, 'gi'), '').trim();
    }
    cleaned = cleaned.replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 2 && cleaned !== officialName.toLowerCase()) {
      const words = cleaned.split(' ').filter((w: string) => w.length > 0);
      institutionName = words.slice(0, 2).join(' ');
    } else {
      // Fallback: try splitting by dash or colon
      const parts = officialName.split(/[-–—:]/);
      if (parts.length > 1 && parts[0].trim().length > 0) {
        institutionName = parts[0].trim();
      }
    }
  }
  
  // Use institutionName for logo lookup
  const logoLookupName = institutionName || account.officialName || account.name;
  const bankLogo = getBankLogo(account.name, account.institutionId, logoLookupName);
  const [logoError, setLogoError] = useState(false);
  const bankInitials = getBankInitials(account.name, institutionName);

  // Reset logoError when logoUrl changes
  useEffect(() => {
    setLogoError(false);
  }, [bankLogo.logoUrl]);

  // Enhanced debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🏦 Bank Card Debug: ${account.name}`);
      console.log('Account Name:', account.name);
      console.log('Official Name:', account.officialName || '❌ NO OFFICIAL NAME');
      console.log('Institution Name:', institutionName || '❌ NO INSTITUTION NAME');
      console.log('Logo Lookup Name:', logoLookupName || '❌ NO LOGO LOOKUP NAME');
      console.log('Institution ID:', account.institutionId, `(length: ${account.institutionId?.length || 0})`);
      console.log('Logo URL:', bankLogo.logoUrl || '❌ NO LOGO URL');
      console.log('Has Logo:', !!bankLogo.logoUrl);
      console.log('Logo Error:', logoError);
      console.log('Bank Initials:', bankInitials);
      console.log('Background Color:', bankLogo.backgroundColor);
      if (!bankLogo.logoUrl) {
        console.warn('⚠️ No logo URL found - will show initials');
        console.warn('⚠️ Debugging logo lookup:');
        console.warn('  - institutionName:', institutionName || 'empty');
        console.warn('  - logoLookupName:', logoLookupName || 'empty');
        console.warn('  - account.name:', account.name);
        console.warn('  - account.officialName:', account.officialName || 'empty');
        console.warn('  - institutionId:', account.institutionId, `(is Plaid ID: ${account.institutionId?.length < 30})`);
      }
      console.groupEnd();
    }
  }, [account.name, account.officialName, account.institutionId, institutionName, logoLookupName, bankLogo.logoUrl, bankInitials, logoError]);

  return (
    <Link href={`/my-banks/${account.id}`} className="block w-full">
      <div className="relative flex w-full items-center gap-4 rounded-[16px] border border-gray-700/50 bg-dark-card px-4 py-4 shadow-creditCard transition-all hover:border-bankGradient/50 hover:shadow-lg">
        {/* Bank Logo */}
        <div 
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden"
          style={{ 
            backgroundColor: bankLogo.logoUrl && !logoError ? 'transparent' : (bankLogo.backgroundColor || '#0179FE')
          }}
        >
          {bankLogo.logoUrl && !logoError ? (
            <img
              src={bankLogo.logoUrl}
              width={48}
              height={48}
              alt={`${account.name} logo`}
              className="h-12 w-12 object-contain"
              onError={(e) => {
                console.warn(`Failed to load bank logo for ${account.name}:`, bankLogo.logoUrl);
                setLogoError(true);
                // Hide broken image immediately
                if (e.target instanceof HTMLImageElement) {
                  e.target.style.display = 'none';
                }
              }}
              onLoad={() => {
                // Logo loaded successfully
                console.log(`Successfully loaded logo for ${account.name}`);
              }}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-sm font-bold text-white">
              {bankInitials}
            </span>
          )}
        </div>

        {/* Account Info */}
        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <h2 className="text-16 font-semibold text-white truncate">
              {account.name}
            </h2>
            <p className="text-12 font-normal text-gray-400 truncate">
              {account.subtype || account.type} •••• {account.mask}
            </p>
          </div>
          
          {/* Balance */}
          <div className="flex shrink-0 flex-col items-end">
            <p className="text-20 font-semibold text-white">
              {formatAmount(account.currentBalance)}
            </p>
            {account.availableBalance !== account.currentBalance && (
              <p className="text-12 font-normal text-gray-400">
                Available: {formatAmount(account.availableBalance)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
