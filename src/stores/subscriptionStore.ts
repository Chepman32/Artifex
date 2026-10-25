import { create } from 'zustand';
import { PRO_PRODUCT_IDS } from '../constants/subscriptions';

export interface ProEntitlement {
  productId: string | null;
  expiresAt: number | null;
}

export interface SubscriptionProduct {
  id: string;
  displayPrice: string;
  price: number;
  currency: string;
  trialDays: number;
  trialEligible: boolean;
}

interface SubscriptionState {
  entitlement: ProEntitlement;
  products: SubscriptionProduct[];
  loading: boolean;
  busy: boolean;
  available: boolean;
}

// Entitlements are always re-read from verified StoreKit transactions. Never
// persist a writable "isPro" flag or treat a purchase attempt as an unlock.
export const useSubscriptionStore = create<SubscriptionState>(() => ({
  entitlement: { productId: null, expiresAt: null },
  products: [],
  loading: true,
  busy: false,
  available: false,
}));

export const hasProEntitlement = (
  entitlement: ProEntitlement,
  now = Date.now(),
): boolean =>
  entitlement.productId !== null &&
  PRO_PRODUCT_IDS.includes(entitlement.productId) &&
  entitlement.expiresAt !== null &&
  Number.isFinite(entitlement.expiresAt) &&
  entitlement.expiresAt > now;

export const hasProAccess = (): boolean =>
  hasProEntitlement(useSubscriptionStore.getState().entitlement);
