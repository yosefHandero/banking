export const sidebarLinks = [
  {
    imgURL: "/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/icons/dollar-circle.svg",
    route: "/my-banks",
    label: "My Banks",
  },
  {
    imgURL: "/icons/transaction.svg",
    route: "/transaction-history",
    label: "Transaction History",
  },
  {
    imgURL: "/icons/money-send.svg",
    route: "/payment-transfer",
    label: "Transfer Funds",
  },
  {
    imgURL: "/icons/monitor.svg",
    route: "/ai-insights",
    label: "AI Insights",
  },
];

// ⚠️ SECURITY WARNING: Test data below should NOT be used in production
// These are hardcoded test credentials for development/demo purposes only
// In production, remove these or move to secure environment variables

// good_user / good_password - Bank of America
// TODO: Remove hardcoded test data or move to environment variables
export const TEST_USER_ID = process.env.NEXT_PUBLIC_TEST_USER_ID || "6627ed3d00267aa6fa3e";

// custom_user -> Chase Bank
export const TEST_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TEST_ACCESS_TOKEN || 
  "access-sandbox-229476cf-25bc-46d2-9ed5-fba9df7a5d63";

// ⚠️ WARNING: Contains hardcoded access tokens - SECURITY RISK in production
export const ITEMS = process.env.NODE_ENV === 'production' ? [] : [
  {
    id: "6624c02e00367128945e", // appwrite item Id
    accessToken: "access-sandbox-83fd9200-0165-4ef8-afde-65744b9d1548",
    itemId: "VPMQJKG5vASvpX8B6JK3HmXkZlAyplhW3r9xm",
    userId: "6627ed3d00267aa6fa3e",
    accountId: "X7LMJkE5vnskJBxwPeXaUWDBxAyZXwi9DNEWJ",
  },
  {
    id: "6627f07b00348f242ea9", // appwrite item Id
    accessToken: "access-sandbox-74d49e15-fc3b-4d10-a5e7-be4ddae05b30",
    itemId: "Wv7P6vNXRXiMkoKWPzeZS9Zm5JGWdXulLRNBq",
    userId: "6627ed3d00267aa6fa3e",
    accountId: "x1GQb1lDrDHWX4BwkqQbI4qpQP1lL6tJ3VVo9",
  },
];

export const topCategoryStyles = {
  "Food and Drink": {
    bg: "bg-blue-25",
    circleBg: "bg-blue-100",
    text: {
      main: "text-blue-900",
      count: "text-blue-700",
    },
    progress: {
      bg: "bg-blue-100",
      indicator: "bg-blue-700",
    },
    icon: "/icons/monitor.svg",
  },
  Travel: {
    bg: "bg-success-25",
    circleBg: "bg-success-100",
    text: {
      main: "text-success-900",
      count: "text-success-700",
    },
    progress: {
      bg: "bg-success-100",
      indicator: "bg-success-700",
    },
    icon: "/icons/coins.svg",
  },
  default: {
    bg: "bg-pink-25",
    circleBg: "bg-pink-100",
    text: {
      main: "text-pink-900",
      count: "text-pink-700",
    },
    progress: {
      bg: "bg-pink-100",
      indicator: "bg-pink-700",
    },
    icon: "/icons/shopping-bag.svg",
  },
};

export const transactionCategoryStyles = {
  "Food and Drink": {
    borderColor: "border-pink-600",
    backgroundColor: "bg-pink-500",
    textColor: "text-pink-700",
    chipBackgroundColor: "bg-inherit",
  },
  Payment: {
    borderColor: "border-success-600",
    backgroundColor: "bg-green-600",
    textColor: "text-success-700",
    chipBackgroundColor: "bg-inherit",
  },
  "Bank Fees": {
    borderColor: "border-success-600",
    backgroundColor: "bg-green-600",
    textColor: "text-success-700",
    chipBackgroundColor: "bg-inherit",
  },
  Transfer: {
    borderColor: "border-red-700",
    backgroundColor: "bg-red-700",
    textColor: "text-red-700",
    chipBackgroundColor: "bg-inherit",
  },
  Processing: {
    borderColor: "border-gray-400",
    backgroundColor: "bg-gray-500",
    textColor: "text-white",
    chipBackgroundColor: "bg-gray-600",
  },
  Success: {
    borderColor: "border-[#12B76A]",
    backgroundColor: "bg-[#12B76A]",
    textColor: "text-white",
    chipBackgroundColor: "bg-[#12B76A]/20",
  },
  Entertainment: {
    borderColor: "",
    backgroundColor: "bg-blue-500",
    textColor: "text-blue-400",
    chipBackgroundColor: "bg-blue-500/20",
  },
  Groceries: {
    borderColor: "",
    backgroundColor: "bg-blue-500",
    textColor: "text-blue-400",
    chipBackgroundColor: "bg-blue-500/20",
  },
  Housing: {
    borderColor: "",
    backgroundColor: "bg-blue-500",
    textColor: "text-blue-400",
    chipBackgroundColor: "bg-blue-500/20",
  },
  default: {
    borderColor: "",
    backgroundColor: "bg-blue-500",
    textColor: "text-blue-400",
    chipBackgroundColor: "bg-blue-500/20",
  },
};
