/**
 * Maps bank names and institution IDs to bank logo URLs
 * Uses multiple logo sources for better reliability
 */

export interface BankLogoInfo {
  logoUrl: string;
  backgroundColor?: string;
}

// Map common bank names and institution IDs to logo URLs
// Using multiple sources for better reliability
const BANK_LOGO_MAP: Record<string, BankLogoInfo> = {
  // Chase Bank
  'chase': { 
    logoUrl: 'https://logo.clearbit.com/chase.com', 
    backgroundColor: '#117ACA' 
  },
  'chase_001': { 
    logoUrl: 'https://logo.clearbit.com/chase.com', 
    backgroundColor: '#117ACA' 
  },
  'chase bank': { 
    logoUrl: 'https://logo.clearbit.com/chase.com', 
    backgroundColor: '#117ACA' 
  },
  
  // Bank of America
  'bofa': { 
    logoUrl: 'https://logo.clearbit.com/bankofamerica.com', 
    backgroundColor: '#E31837' 
  },
  'bofa_001': { 
    logoUrl: 'https://logo.clearbit.com/bankofamerica.com', 
    backgroundColor: '#E31837' 
  },
  'bank of america': { 
    logoUrl: 'https://logo.clearbit.com/bankofamerica.com', 
    backgroundColor: '#E31837' 
  },
  
  // Wells Fargo
  'wells': { 
    logoUrl: 'https://logo.clearbit.com/wellsfargo.com', 
    backgroundColor: '#FFCC00' 
  },
  'wells_001': { 
    logoUrl: 'https://logo.clearbit.com/wellsfargo.com', 
    backgroundColor: '#FFCC00' 
  },
  'wells fargo': { 
    logoUrl: 'https://logo.clearbit.com/wellsfargo.com', 
    backgroundColor: '#FFCC00' 
  },
  
  // Citibank
  'citi': { 
    logoUrl: 'https://logo.clearbit.com/citi.com', 
    backgroundColor: '#056EAE' 
  },
  'citi_001': { 
    logoUrl: 'https://logo.clearbit.com/citi.com', 
    backgroundColor: '#056EAE' 
  },
  'citibank': { 
    logoUrl: 'https://logo.clearbit.com/citi.com', 
    backgroundColor: '#056EAE' 
  },
  
  // US Bank
  // cspell:ignore usbank usbancorp
  'usbank': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  'usbank_001': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  'us bank': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  'u.s. bank': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  'u s bank': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  'usbancorp': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  'u.s. bancorp': { 
    logoUrl: 'https://logo.clearbit.com/usbank.com', 
    backgroundColor: '#FFB81C' 
  },
  
  // Capital One
  'capital one': { 
    logoUrl: 'https://logo.clearbit.com/capitalone.com', 
    backgroundColor: '#004977' 
  },
  'capitalone': { 
    logoUrl: 'https://logo.clearbit.com/capitalone.com', 
    backgroundColor: '#004977' 
  },
  
  // PNC Bank
  'pnc': { 
    logoUrl: 'https://logo.clearbit.com/pnc.com', 
    backgroundColor: '#F48020' 
  },
  'pnc bank': { 
    logoUrl: 'https://logo.clearbit.com/pnc.com', 
    backgroundColor: '#F48020' 
  },
  
  // TD Bank
  'td': { 
    logoUrl: 'https://logo.clearbit.com/td.com', 
    backgroundColor: '#53A318' 
  },
  'td bank': { 
    logoUrl: 'https://logo.clearbit.com/td.com', 
    backgroundColor: '#53A318' 
  },
};

/**
 * Extracts bank name from account name or uses institution ID
 */
function extractBankName(accountName: string, institutionId: string): string {
  const accountNameLower = accountName.toLowerCase().trim();
  
  // First, try to match institution ID directly (most reliable)
  if (institutionId) {
    const normalizedId = institutionId.toLowerCase().trim();
    if (BANK_LOGO_MAP[normalizedId]) {
      return normalizedId;
    }
  }
  
  // Check if any bank name is in the account name (longer matches first for accuracy)
  // Sort by length descending to match "bank of america" before "bank"
  const sortedKeys = Object.keys(BANK_LOGO_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    // Use word boundary matching for better accuracy
    const regex = new RegExp(`\\b${key.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(accountNameLower)) {
      return key;
    }
    // Also try simple includes as fallback
    if (accountNameLower.includes(key)) {
      return key;
    }
  }
  
  // Fallback to institution ID
  return institutionId ? institutionId.toLowerCase().trim() : '';
}

/**
 * Extracts bank name from account name (e.g., "Chase Bank Checking" -> "Chase Bank")
 */
function extractBankNameFromAccountName(accountName: string): string | null {
  const accountNameLower = accountName.toLowerCase().trim();
  
  // Try to match known bank names in the account name
  const sortedKeys = Object.keys(BANK_LOGO_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    // Use word boundary matching for better accuracy
    const regex = new RegExp(`\\b${key.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(accountNameLower)) {
      return key;
    }
    // Also try simple includes as fallback
    if (accountNameLower.includes(key)) {
      return key;
    }
  }
  
  return null;
}

/**
 * Normalizes bank names for better matching
 * Removes common words and variations to improve logo lookup
 */
function normalizeBankName(name: string): string[] {
  if (!name) return [];
  
  const normalized = name.toLowerCase().trim();
  const variations: string[] = [normalized];
  
  // Special handling for "U.S." -> "us" before other processing
  let processed = normalized;
  processed = processed.replace(/\bu\.s\.\b/gi, 'us');
  processed = processed.replace(/\bu\s+s\b/gi, 'us');
  
  // Also add the processed version (with U.S. -> us conversion) early
  if (processed !== normalized && !variations.includes(processed)) {
    variations.push(processed);
  }
  
  // Remove common suffixes/prefixes
  const commonWords = ['bank', 'national', 'corporation', 'corp', 'inc', 'llc', 'ltd', 'company', 'co', 'the', 'bancorp'];
  let cleaned = processed;
  
  // Remove common words
  for (const word of commonWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
  }
  
  // Remove extra spaces and punctuation (but keep periods that might be part of abbreviations)
  cleaned = cleaned.replace(/[,\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  // Remove periods that are standalone (not part of abbreviations)
  cleaned = cleaned.replace(/\.(?=\s|$)/g, '').trim();
  
  if (cleaned && cleaned !== normalized && cleaned !== processed && !variations.includes(cleaned)) {
    variations.push(cleaned);
  }
  
  // Special case: if we have "us" after cleaning, also add "us bank" and "usbank" variations
  if (cleaned === 'us' || processed.includes('us bank')) {
    if (!variations.includes('us bank')) {
      variations.push('us bank');
    }
    if (!variations.includes('usbank')) {
      variations.push('usbank');
    }
  }
  
  // Add acronym variations (e.g., "Bank of America" -> "bofa", "boa")
  if (cleaned.includes(' of ')) {
    const words = cleaned.split(' ').filter(w => w.length > 0 && !commonWords.includes(w));
    if (words.length >= 2) {
      // First letters of first two words
      const acronym = (words[0][0] || '') + (words[1][0] || '');
      if (acronym.length === 2) {
        variations.push(acronym);
      }
    }
  }
  
  // Add first word only (e.g., "Chase Bank" -> "chase")
  const firstWord = cleaned.split(' ')[0];
  if (firstWord && firstWord.length > 2 && !variations.includes(firstWord)) {
    variations.push(firstWord);
  }
  
  return variations;
}

/**
 * Gets bank logo information for an account
 */
export function getBankLogo(accountName: string, institutionId: string, institutionName?: string): BankLogoInfo {
  // Priority 1: Use institutionName if provided (most reliable for logo lookup)
  if (institutionName) {
    const normalizedInstitutionName = institutionName.toLowerCase().trim();
    
    // Try exact match first
    if (BANK_LOGO_MAP[normalizedInstitutionName]) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Logo found via institutionName exact match: "${normalizedInstitutionName}"`);
      }
      return BANK_LOGO_MAP[normalizedInstitutionName];
    }
    
    // Try normalized variations
    const nameVariations = normalizeBankName(institutionName);
    for (const variation of nameVariations) {
      if (BANK_LOGO_MAP[variation]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Logo found via institutionName normalized variation: "${variation}" from "${institutionName}"`);
        }
        return BANK_LOGO_MAP[variation];
      }
    }
    
    // Try partial matches with normalized variations
    const sortedEntries = Object.entries(BANK_LOGO_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const variation of nameVariations) {
      for (const [key, value] of sortedEntries) {
        // Check if variation contains key or key contains variation
        if (variation.includes(key) || key.includes(variation)) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Logo found via institutionName partial match: "${key}" matches "${variation}" from "${institutionName}"`);
          }
          return value;
        }
        // Also try word boundary matching for better accuracy
        const regex = new RegExp(`\\b${key.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regex.test(variation)) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Logo found via institutionName regex match: "${key}" in "${variation}"`);
          }
          return value;
        }
      }
    }
    
    // Fallback: simple includes check
    for (const [key, value] of sortedEntries) {
      if (normalizedInstitutionName.includes(key) || key.includes(normalizedInstitutionName)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Logo found via institutionName simple includes: "${key}" in "${normalizedInstitutionName}"`);
        }
        return value;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ institutionName "${institutionName}" provided but no logo match found`);
      console.warn(`   Tried variations:`, nameVariations);
    }
  }

  // Priority 2: Direct institution ID match (for Plaid institution IDs like 'chase_001')
  if (institutionId && institutionId.length < 30) { // Plaid IDs are short, Appwrite IDs are long
    const normalizedId = institutionId.toLowerCase().trim();
    if (BANK_LOGO_MAP[normalizedId]) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Logo found via institutionId: "${normalizedId}"`);
      }
      return BANK_LOGO_MAP[normalizedId];
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ institutionId "${institutionId}" (length: ${institutionId.length}) provided but no logo match found`);
    }
  } else if (institutionId && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ institutionId "${institutionId}" is too long (${institutionId.length} chars) - likely Appwrite ID, not Plaid ID`);
  }

  // Priority 3: Try to extract bank name from account name
  const extractedBankName = extractBankNameFromAccountName(accountName);
  if (extractedBankName && BANK_LOGO_MAP[extractedBankName]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Logo found via extracted bank name from account name: "${extractedBankName}"`);
    }
    return BANK_LOGO_MAP[extractedBankName];
  }
  
  // Priority 4: Try matching account name directly against all bank names
  // Sort by length descending to match longer names first (e.g., "bank of america" before "bank")
  const accountNameLower = accountName.toLowerCase().trim();
  const sortedEntries = Object.entries(BANK_LOGO_MAP).sort((a, b) => b[0].length - a[0].length);
  
  for (const [key, value] of sortedEntries) {
    // Use word boundary matching for better accuracy
    const regex = new RegExp(`\\b${key.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(accountNameLower)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Logo found via account name regex match: "${key}" in "${accountName}"`);
      }
      return value;
    }
    // Also try simple includes as fallback
    if (accountNameLower.includes(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Logo found via account name includes match: "${key}" in "${accountName}"`);
      }
      return value;
    }
  }
  
  // Priority 5: Extract bank name from account name and try matching
  const bankKey = extractBankName(accountName, institutionId);
  if (bankKey) {
    const normalizedKey = bankKey.toLowerCase().trim();
    if (BANK_LOGO_MAP[normalizedKey]) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Logo found via extracted bank name: "${normalizedKey}"`);
      }
      return BANK_LOGO_MAP[normalizedKey];
    }
    
    // Try normalized variations of extracted name
    const extractedVariations = normalizeBankName(bankKey);
    for (const variation of extractedVariations) {
      if (BANK_LOGO_MAP[variation]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Logo found via extracted bank name variation: "${variation}"`);
        }
        return BANK_LOGO_MAP[variation];
      }
    }
    
    // Try partial matches with extracted name
    for (const [key, value] of sortedEntries) {
      if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Logo found via extracted bank name partial match: "${key}"`);
        }
        return value;
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`❌ No logo found for account "${accountName}" with institutionId "${institutionId}" and institutionName "${institutionName || 'none'}"`);
    console.warn(`   Available bank keys in BANK_LOGO_MAP:`, Object.keys(BANK_LOGO_MAP).slice(0, 10), '...');
  }
  
  // Default fallback - no logo, just initials
  return {
    logoUrl: '',
    backgroundColor: '#0179FE',
  };
}

/**
 * Gets bank initials for fallback display
 * Extracts the bank name from account name or uses institutionName if provided
 * (e.g., "Chase Bank Checking" -> "CB" or "savings ••••1111" with institutionName "Chase" -> "CH")
 */
export function getBankInitials(accountName: string, institutionName?: string): string {
  // If institutionName is provided, use it for initials
  if (institutionName) {
    const institutionWords = institutionName.trim().split(' ').filter(word => word.length > 0);
    if (institutionWords.length >= 2) {
      // Take first letter of first two words (e.g., "Bank of America" -> "BA")
      return (institutionWords[0][0] + institutionWords[1][0]).toUpperCase();
    } else if (institutionWords.length === 1 && institutionWords[0].length >= 2) {
      // Take first two letters of single word (e.g., "Chase" -> "CH")
      return institutionWords[0].substring(0, 2).toUpperCase();
    }
  }

  // Remove common account type words and special characters
  const accountTypes = ['checking', 'savings', 'credit', 'card', 'loan', 'mortgage', 'investment'];
  let cleanedName = accountName.toLowerCase();
  
  // Remove bullet points and special characters
  cleanedName = cleanedName.replace(/[•\u2022\u25CF\u25E6\u2219]/g, '').trim();
  
  // Remove account types
  for (const type of accountTypes) {
    cleanedName = cleanedName.replace(new RegExp(`\\b${type}\\b`, 'gi'), '').trim();
  }
  
  // Remove numbers and mask patterns
  cleanedName = cleanedName.replace(/\d+/g, '').replace(/•+/g, '').trim();
  
  const words = cleanedName.split(' ').filter(word => 
    word.length > 0 && 
    word !== 'bank' && 
    word !== 'of' && 
    word !== 'the' &&
    !/^\d+$/.test(word) // Filter out pure numbers
  );
  
  if (words.length >= 2) {
    // Take first letter of first two meaningful words
    const first = words[0][0];
    const second = words[1][0];
    if (first && second) {
      return (first + second).toUpperCase();
    }
  } else if (words.length === 1 && words[0].length >= 2) {
    // Take first two letters of single word
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Fallback: try original account name (before cleaning)
  const originalWords = accountName.split(' ').filter(word => {
    const cleaned = word.replace(/[•\d]/g, '').trim();
    return cleaned.length > 0 && !/^\d+$/.test(cleaned);
  });
  
  if (originalWords.length >= 2) {
    const first = originalWords[0][0];
    const second = originalWords[1][0];
    if (first && second && /[a-zA-Z]/.test(first) && /[a-zA-Z]/.test(second)) {
      return (first + second).toUpperCase();
    }
  }
  
  // Final fallback
  return 'BA';
}

