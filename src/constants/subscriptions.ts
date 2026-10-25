export const PRO_PRODUCTS = {
  monthly: 'com.artifex.app.pro.monthly',
  yearly: 'com.artifex.app.pro.yearly',
} as const;

export type ProPlan = keyof typeof PRO_PRODUCTS;
export const PRO_PRODUCT_IDS: string[] = Object.values(PRO_PRODUCTS);
export const TERMS_URL =
  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const PRIVACY_URL =
  'https://marqo-privacy-policy.anton-chepur.chatgpt.site';
export const MANAGE_SUBSCRIPTIONS_URL =
  'https://apps.apple.com/account/subscriptions';
