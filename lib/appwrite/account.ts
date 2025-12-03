"use server";

import { createSessionClient } from './server';
import { ID, Query, COLLECTIONS, DATABASE_ID } from './config';
import { Account } from '@/types';

// Map account types/subtypes to valid Appwrite accountType values
function mapToValidAccountType(type: string, subtype: string): 'checking' | 'savings' | 'business' {
  // Use subtype first as it's more specific
  const normalizedSubtype = subtype.toLowerCase().trim();
  
  if (normalizedSubtype === 'checking') {
    return 'checking';
  }
  
  if (normalizedSubtype === 'savings') {
    return 'savings';
  }
  
  // For all other types (credit card, loan, investment, etc.), use 'business'
  return 'business';
}

export async function createBankAccount(accountData: {
  userId: string;
  name: string;
  officialName: string;
  mask: string;
  type: string;
  subtype: string;
  currentBalance: number;
  availableBalance: number;
  institutionId: string;
  institutionName: string;
}) {
  try {
    const { databases } = await createSessionClient();
    const accountId = ID.unique();
    const accountNumber = accountData.mask || Math.random().toString().slice(2, 12);

    // Map to valid Appwrite accountType
    const validAccountType = mapToValidAccountType(accountData.type, accountData.subtype);

    // Prepare document data with required fields only
    const documentData: any = {
      accountId: accountId,
      accountNumber: accountNumber,
      accountOwnerId: accountData.userId,
      balance: accountData.currentBalance,
      accountType: validAccountType,
      interestRate: 0,
      createdDate: new Date().toISOString(),
    };

    // Try to store additional metadata in accountDetails JSON string for logo lookup and display
    // Note: accountDetails is optional - if the attribute doesn't exist in Appwrite, we'll skip it
    const accountDetails = {
      name: accountData.name,
      officialName: accountData.officialName,
      institutionId: accountData.institutionId,
      institutionName: accountData.institutionName,
      type: accountData.type,
      subtype: accountData.subtype,
    };

    // First, try to create the account with accountDetails
    // If it fails due to missing attribute, try storing institutionName/institutionId separately
    let account;
    try {
      documentData.accountDetails = JSON.stringify(accountDetails);
      account = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        ID.unique(),
        documentData
      );
    } catch (firstError: any) {
      const errorMsg = firstError?.message || '';
      // If error is about missing accountDetails attribute, try storing institutionName separately
      if (errorMsg.includes('accountDetails') || errorMsg.includes('Unknown attribute')) {
        console.warn('⚠️ accountDetails attribute not found in Appwrite schema. Trying separate attributes.');
        // Remove accountDetails and try storing institutionName/institutionId as separate fields
        delete documentData.accountDetails;
        
        // Try to store institutionName and institutionId as separate optional attributes
        // These are optional - if they don't exist, we'll just skip them
        // Note: We'll try to store them, but if the attributes don't exist, Appwrite will ignore them
        if (accountData.institutionName) {
          documentData.institutionName = accountData.institutionName;
        }
        if (accountData.institutionId && accountData.institutionId.length < 30) {
          // Only store if it's a Plaid ID (short), not Appwrite ID (long)
          documentData.institutionId = accountData.institutionId;
        }
        if (accountData.officialName) {
          documentData.officialName = accountData.officialName;
        }
        
        // Try creating with these optional fields
        // If any fail, Appwrite will tell us which attribute is missing
        try {
          account = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ACCOUNTS,
            ID.unique(),
            documentData
          );
          console.warn('⚠️ Account created without accountDetails. Bank logos may not work.');
          console.warn('⚠️ To enable bank logos, add "accountDetails" (String) or "institutionName" (String) attribute to your ACCOUNTS collection.');
        } catch (secondError: any) {
          const secondErrorMsg = secondError?.message || '';
          // If it's an unknown attribute error, remove that attribute and try again
          if (secondErrorMsg.includes('Unknown attribute')) {
            const missingAttr = secondErrorMsg.match(/Unknown attribute: "([^"]+)"/)?.[1];
            console.warn(`⚠️ Attribute "${missingAttr}" not found in schema. Removing it and retrying...`);
            
            if (missingAttr === 'institutionName') {
              delete documentData.institutionName;
            }
            if (missingAttr === 'institutionId') {
              delete documentData.institutionId;
            }
            if (missingAttr === 'officialName') {
              delete documentData.officialName;
            }
            
            // Try one more time without the problematic attribute
            try {
              account = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.ACCOUNTS,
                ID.unique(),
                documentData
              );
              console.warn('⚠️ Account created without some optional attributes. Bank logos may not work.');
            } catch (thirdError: any) {
              // If it still fails, there might be another missing attribute
              const thirdErrorMsg = thirdError?.message || '';
              if (thirdErrorMsg.includes('Unknown attribute')) {
                const anotherMissingAttr = thirdErrorMsg.match(/Unknown attribute: "([^"]+)"/)?.[1];
                // Remove this attribute too and try one final time
                if (anotherMissingAttr === 'institutionName') {
                  delete documentData.institutionName;
                }
                if (anotherMissingAttr === 'institutionId') {
                  delete documentData.institutionId;
                }
                if (anotherMissingAttr === 'officialName') {
                  delete documentData.officialName;
                }
                // Final attempt with only required fields
                account = await databases.createDocument(
                  DATABASE_ID,
                  COLLECTIONS.ACCOUNTS,
                  ID.unique(),
                  documentData
                );
                console.warn('⚠️ Account created with only required fields. Bank logos will not work.');
              } else {
                throw thirdError;
              }
            }
          } else {
            throw secondError;
          }
        }
      } else {
        // Re-throw if it's a different error
        throw firstError;
      }
    }

    return { ...account, $id: account.$id };
  } catch (error: any) {
    // Provide more helpful error messages
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('Unknown attribute')) {
      const missingAttr = errorMsg.match(/Unknown attribute: "([^"]+)"/)?.[1] || 'unknown';
      
      // accountDetails is optional - if missing, we already tried without it above
      if (missingAttr === 'accountDetails') {
        // This shouldn't happen since we handle it above, but just in case
        throw new Error(
          `Schema Error: The optional attribute "accountDetails" is missing from your Appwrite ACCOUNTS collection.\n\n` +
          `Accounts will be created without bank logo support. To enable bank logos:\n` +
          `1. Go to Appwrite Console > Databases > Your Database > ACCOUNTS collection\n` +
          `2. Add a new attribute:\n` +
          `   - Name: accountDetails\n` +
          `   - Type: String\n` +
          `   - Size: 2000 (or larger)\n` +
          `   - Required: No\n\n` +
          `Required attributes (must exist):\n` +
          `- accountId (String)\n` +
          `- accountNumber (String)\n` +
          `- accountOwnerId (String)\n` +
          `- balance (Double)\n` +
          `- accountType (Enum: checking, savings, business)\n` +
          `- interestRate (Double)\n` +
          `- createdDate (DateTime)\n\n` +
          `See README_SCHEMA.md for complete schema documentation.`
        );
      }
      
      // For other missing attributes, show required attributes list
      throw new Error(
        `Schema Error: The attribute "${missingAttr}" is missing from your Appwrite ACCOUNTS collection.\n\n` +
        `Required attributes:\n` +
        `- accountId (String)\n` +
        `- accountNumber (String)\n` +
        `- accountOwnerId (String)\n` +
        `- balance (Double)\n` +
        `- accountType (Enum: checking, savings, business)\n` +
        `- interestRate (Double)\n` +
        `- createdDate (DateTime)\n\n` +
        `Optional (recommended for bank logos):\n` +
        `- accountDetails (String, size: 2000+)\n\n` +
        `Please add the missing attribute "${missingAttr}" to your ACCOUNTS collection in Appwrite Console.\n` +
        `See README_SCHEMA.md for complete schema documentation.`
      );
    }
    
    if (errorMsg.includes('Collection') || errorMsg.includes('not found')) {
      throw new Error(
        `Collection Error: The ACCOUNTS collection (ID: ${COLLECTIONS.ACCOUNTS}) was not found.\n\n` +
        `Please verify:\n` +
        `1. The collection exists in your Appwrite database\n` +
        `2. The collection ID in .env.local matches your Appwrite collection\n` +
        `3. Your Appwrite project ID and database ID are correct\n\n` +
        `Current collection ID: ${COLLECTIONS.ACCOUNTS}`
      );
    }
    
    if (errorMsg.includes('No session') || errorMsg.includes('Unauthorized')) {
      throw new Error('Authentication Error: Please sign in to connect a bank account.');
    }
    
    console.error('Error creating bank account:', error);
    throw new Error(errorMsg || 'Failed to create bank account. Please check your Appwrite configuration.');
  }
}

export async function getAccounts(userId: string): Promise<Account[]> {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided to getAccounts:', userId);
      return [];
    }

    const { databases } = await createSessionClient();

    let accounts;
    try {
      accounts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        [Query.equal('accountOwnerId', userId)]
      );
    } catch (queryError: any) {
      // If query fails, try getting all and filtering client-side
      console.warn('Query with accountOwnerId failed, trying without filter:', queryError.message);
      accounts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS
      );
    }

    return accounts.documents
      .filter((doc: any) => {
        // Filter by userId client-side if query didn't work
        const docUserId = doc.accountOwnerId || doc.userId || '';
        return docUserId === userId;
      })
      .map((doc: any) => {
        // Parse account details from JSON string if available
        let accountDetails: any = {};
        if (doc.accountDetails) {
          try {
            accountDetails = JSON.parse(doc.accountDetails);
          } catch (e) {
            console.warn('Failed to parse account details:', e);
          }
        }

        // Use parsed details if available, otherwise fall back to direct fields or reconstructed values
        const institutionName = accountDetails.institutionName || doc.institutionName || '';
        // Try to extract bank name from officialName if institutionName is not available
        let extractedInstitutionName = institutionName;
        if (!extractedInstitutionName && doc.officialName) {
          // officialName from Plaid often contains bank name (e.g., "Chase Total Checking" or "Bank of America - Checking")
          // Try to extract bank name by removing account type suffixes
          const officialName = doc.officialName;
          // Remove common account type words
          const accountTypes = ['checking', 'savings', 'credit', 'card', 'loan', 'mortgage', 'investment', 'total', 'premier'];
          let cleaned = officialName.toLowerCase();
          for (const type of accountTypes) {
            cleaned = cleaned.replace(new RegExp(`\\b${type}\\b`, 'gi'), '').trim();
          }
          // Remove dashes and extra spaces
          cleaned = cleaned.replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
          // If we have something meaningful left, use it
          if (cleaned.length > 2 && cleaned !== officialName.toLowerCase()) {
            const words = cleaned.split(' ').filter((w: string) => w.length > 0);
            extractedInstitutionName = words.slice(0, 2).join(' ');
          }
        }
        
        const accountDisplayName = institutionName || extractedInstitutionName
          ? `${institutionName || extractedInstitutionName} ${doc.accountType || 'Account'} ••••${doc.accountNumber?.slice(-4) || ''}`
          : `${doc.accountType || 'Account'} ••••${doc.accountNumber?.slice(-4) || ''}`;
        
        const account: Account & { institutionName?: string } = {
          id: doc.$id,
          availableBalance: doc.balance || 0,
          currentBalance: doc.balance || 0,
          officialName: accountDetails.officialName || doc.officialName || accountDisplayName,
          mask: doc.accountNumber || '',
          institutionId: accountDetails.institutionId || (doc.institutionId && doc.institutionId.length < 30 ? doc.institutionId : '') || doc.accountId || '',
          name: accountDetails.name || doc.accountName || accountDisplayName,
          type: accountDetails.type || doc.accountTypeOriginal || doc.accountType || '',
          subtype: accountDetails.subtype || doc.accountSubtype || '',
          appwriteItemId: doc.accountId || doc.$id,
          sharableId: doc.accountId || doc.$id,
          userId: doc.accountOwnerId || doc.userId || '',
          institutionName: institutionName || extractedInstitutionName, // Use extracted name if available
        };
        return account;
      });
  } catch (error: any) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

export async function getAccount(accountId: string): Promise<Account | null> {
  try {
    const { databases } = await createSessionClient();
    const account = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId
    );

    // Parse account details from JSON string if available
    let accountDetails: any = {};
    if (account.accountDetails) {
      try {
        accountDetails = JSON.parse(account.accountDetails);
      } catch (e) {
        console.warn('Failed to parse account details:', e);
      }
    }

    // Use parsed details if available, otherwise fall back to direct fields or reconstructed values
    const institutionName = accountDetails.institutionName || account.institutionName || '';
    // Try to extract bank name from officialName if institutionName is not available
    let extractedInstitutionName = institutionName;
    if (!extractedInstitutionName && account.officialName) {
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
        extractedInstitutionName = words.slice(0, 2).join(' ');
      }
    }
    
    const accountDisplayName = institutionName || extractedInstitutionName
      ? `${institutionName || extractedInstitutionName} ${account.accountType || 'Account'} ••••${account.accountNumber?.slice(-4) || ''}`
      : `${account.accountType || 'Account'} ••••${account.accountNumber?.slice(-4) || ''}`;

    const accountResult: Account & { institutionName?: string } = {
      id: account.$id,
      availableBalance: account.balance || 0,
      currentBalance: account.balance || 0,
      officialName: accountDetails.officialName || account.officialName || accountDisplayName,
      mask: account.accountNumber || '',
      institutionId: accountDetails.institutionId || (account.institutionId && account.institutionId.length < 30 ? account.institutionId : '') || account.accountId || '',
      name: accountDetails.name || account.accountName || accountDisplayName,
      type: accountDetails.type || account.accountTypeOriginal || account.accountType || '',
      subtype: accountDetails.subtype || account.accountSubtype || '',
      appwriteItemId: account.accountId || account.$id,
      sharableId: account.accountId || account.$id,
      userId: account.accountOwnerId || '',
      institutionName: institutionName || extractedInstitutionName, // Use extracted name if available
    };
    return accountResult;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}

export async function deleteBankAccount(accountId: string, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const account = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        accountId
      );
      if (account.accountOwnerId !== userId) {
        throw new Error('Unauthorized: Account does not belong to you');
      }
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId
    );
  } catch (error) {
    throw error;
  }
}

export async function updateAccountBalance(accountId: string, currentBalance: number, availableBalance: number, userId?: string) {
  try {
    const { databases } = await createSessionClient();

    if (userId) {
      const account = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        accountId
      );
      if (account.accountOwnerId !== userId) {
        throw new Error('Unauthorized: Account does not belong to you');
      }
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      accountId,
      {
        balance: currentBalance,
      }
    );
  } catch (error) {
    throw error;
  }
}

