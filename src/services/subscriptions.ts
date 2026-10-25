import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import {
  PRO_PRODUCT_IDS,
  PRO_PRODUCTS,
  type ProPlan,
} from '../constants/subscriptions';
import {
  hasProEntitlement,
  useSubscriptionStore,
  type ProEntitlement,
  type SubscriptionProduct,
} from '../stores/subscriptionStore';

interface PurchaseResult {
  status: 'purchased' | 'cancelled' | 'pending';
  entitlement?: ProEntitlement;
}
interface ProBillingModule {
  getProducts(): Promise<SubscriptionProduct[]>;
  getEntitlement(): Promise<ProEntitlement>;
  purchase(id: string): Promise<PurchaseResult>;
  restore(): Promise<ProEntitlement>;
  addListener(name: string): void;
  removeListeners(count: number): void;
}

const billing: ProBillingModule | undefined =
  Platform.OS === 'ios' ? NativeModules.MarqoProBilling : undefined;
const free: ProEntitlement = { productId: null, expiresAt: null };
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
let refreshSequence = 0;

function applyEntitlement(entitlement: ProEntitlement) {
  if (expiryTimer) clearTimeout(expiryTimer);
  const valid = hasProEntitlement(entitlement) ? entitlement : free;
  useSubscriptionStore.setState({ entitlement: valid });
  if (valid.expiresAt) {
    // Re-query at expiry (including while the app stays in the foreground).
    expiryTimer = setTimeout(() => {
      useSubscriptionStore.setState({ entitlement: free });
      void refreshEntitlement();
    }, Math.min(valid.expiresAt - Date.now() + 50, 2_147_483_647));
  }
}

export async function refreshEntitlement(): Promise<boolean> {
  const sequence = ++refreshSequence;
  try {
    const entitlement = billing ? await billing.getEntitlement() : free;
    if (sequence === refreshSequence) applyEntitlement(entitlement);
    return sequence === refreshSequence
      ? hasProEntitlement(entitlement)
      : hasProEntitlement(useSubscriptionStore.getState().entitlement);
  } catch {
    if (sequence === refreshSequence) applyEntitlement(free);
    return false;
  }
}

export async function loadSubscriptionProducts(): Promise<void> {
  useSubscriptionStore.setState({ loading: true });
  try {
    const products = billing ? await billing.getProducts() : [];
    useSubscriptionStore.setState({
      products: products.filter(p => PRO_PRODUCT_IDS.includes(p.id)),
      available: Boolean(billing),
    });
  } catch {
    useSubscriptionStore.setState({
      products: [],
      available: Boolean(billing),
    });
  } finally {
    useSubscriptionStore.setState({ loading: false });
  }
}

export function startSubscriptions(): () => void {
  const listener = billing
    ? new NativeEventEmitter(billing).addListener('MarqoProChanged', () => {
        void refreshEntitlement();
      })
    : undefined;
  const foreground = AppState.addEventListener('change', state => {
    if (state === 'active') void refreshEntitlement();
  });
  void refreshEntitlement();
  void loadSubscriptionProducts();
  return () => {
    listener?.remove();
    foreground.remove();
    if (expiryTimer) clearTimeout(expiryTimer);
  };
}

export async function purchasePro(
  plan: ProPlan,
): Promise<PurchaseResult['status']> {
  if (!billing || useSubscriptionStore.getState().busy)
    throw new Error('store-unavailable');
  useSubscriptionStore.setState({ busy: true });
  try {
    const result = await billing.purchase(PRO_PRODUCTS[plan]);
    // Independently re-read current entitlements even after a successful result.
    const active = await refreshEntitlement();
    if (result.status === 'purchased' && !active)
      throw new Error('verification-failed');
    return result.status;
  } finally {
    useSubscriptionStore.setState({ busy: false });
  }
}

export async function restorePro(): Promise<boolean> {
  if (!billing || useSubscriptionStore.getState().busy)
    throw new Error('store-unavailable');
  useSubscriptionStore.setState({ busy: true });
  try {
    await billing.restore();
    return await refreshEntitlement();
  } finally {
    useSubscriptionStore.setState({ busy: false });
  }
}
