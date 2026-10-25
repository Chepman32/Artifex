let mockForeground: (state: string) => void;
let mockChanged: () => void;
jest.mock('react-native', () => {
  const billing = {
    getProducts: jest.fn(),
    getEntitlement: jest.fn(),
    purchase: jest.fn(),
    restore: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };
  return {
    Platform: { OS: 'ios' },
    NativeModules: { MarqoProBilling: billing },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: (_: string, callback: () => void) => {
        mockChanged = callback;
        return { remove: jest.fn() };
      },
    })),
    AppState: {
      addEventListener: (_: string, callback: (state: string) => void) => {
        mockForeground = callback;
        return { remove: jest.fn() };
      },
    },
  };
});

const mockBilling = require('react-native').NativeModules.MarqoProBilling;

import { PRO_PRODUCTS } from '../src/constants/subscriptions';
import {
  hasProEntitlement,
  useSubscriptionStore,
} from '../src/stores/subscriptionStore';
import {
  loadSubscriptionProducts,
  purchasePro,
  refreshEntitlement,
  restorePro,
  startSubscriptions,
} from '../src/services/subscriptions';

const free = { productId: null, expiresAt: null };
const active = () => ({
  productId: PRO_PRODUCTS.monthly,
  expiresAt: Date.now() + 100_000,
});
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-14T12:00:00Z'));
  jest.clearAllMocks();
  mockBilling.getEntitlement.mockResolvedValue(free);
  mockBilling.getProducts.mockResolvedValue([]);
  useSubscriptionStore.setState({
    entitlement: free,
    products: [],
    loading: false,
    busy: false,
    available: true,
  });
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test.each([
  {
    productId: PRO_PRODUCTS.monthly,
    expiresAt: Date.parse('2026-10-14T12:00:00Z'),
  },
  { productId: PRO_PRODUCTS.yearly, expiresAt: null },
  { productId: 'unrelated.product', expiresAt: Date.parse('2027-01-01') },
  { productId: PRO_PRODUCTS.monthly, expiresAt: Infinity },
])(
  'expired, missing, invalid, and unrelated entitlements do not unlock Pro: %p',
  entitlement => {
    expect(hasProEntitlement(entitlement)).toBe(false);
  },
);

test('a verified active subscription unlocks Pro and an empty refresh removes it', async () => {
  mockBilling.getEntitlement.mockResolvedValueOnce(active());
  expect(await refreshEntitlement()).toBe(true);
  expect(hasProEntitlement(useSubscriptionStore.getState().entitlement)).toBe(
    true,
  );
  expect(await refreshEntitlement()).toBe(false);
  expect(useSubscriptionStore.getState().entitlement).toEqual(free);
});

test.each(['cancelled', 'pending'] as const)(
  '%s purchases never grant Pro access',
  async status => {
    mockBilling.purchase.mockResolvedValue({ status });
    expect(await purchasePro('yearly')).toBe(status);
    expect(hasProEntitlement(useSubscriptionStore.getState().entitlement)).toBe(
      false,
    );
    expect(useSubscriptionStore.getState().busy).toBe(false);
  },
);

test('purchase success without an active verified entitlement is rejected', async () => {
  mockBilling.purchase.mockResolvedValue({
    status: 'purchased',
    entitlement: active(),
  });
  await expect(purchasePro('monthly')).rejects.toThrow('verification-failed');
  expect(useSubscriptionStore.getState().entitlement).toEqual(free);
});

test('successful purchases and restores re-read the store instead of trusting returned flags', async () => {
  mockBilling.getEntitlement.mockResolvedValue(active());
  mockBilling.purchase.mockResolvedValue({ status: 'purchased' });
  expect(await purchasePro('monthly')).toBe('purchased');
  expect(mockBilling.purchase).toHaveBeenCalledWith(PRO_PRODUCTS.monthly);
  mockBilling.restore.mockResolvedValue(free);
  expect(await restorePro()).toBe(true);
  expect(mockBilling.getEntitlement).toHaveBeenCalledTimes(2);
});

test('active access expires while foregrounded and refunds are observed on resume', async () => {
  const cleanup = startSubscriptions();
  await flush();
  mockBilling.getEntitlement.mockResolvedValueOnce({
    productId: PRO_PRODUCTS.monthly,
    expiresAt: Date.now() + 1000,
  });
  mockChanged();
  await flush();
  expect(hasProEntitlement(useSubscriptionStore.getState().entitlement)).toBe(
    true,
  );
  jest.advanceTimersByTime(1051);
  await flush();
  expect(useSubscriptionStore.getState().entitlement).toEqual(free);
  mockBilling.getEntitlement.mockResolvedValueOnce(active());
  mockForeground('active');
  await flush();
  expect(hasProEntitlement(useSubscriptionStore.getState().entitlement)).toBe(
    true,
  );
  mockForeground('active');
  await flush();
  expect(useSubscriptionStore.getState().entitlement).toEqual(free);
  cleanup();
});

test('failed refreshes fail closed and product loading filters unexpected products', async () => {
  mockBilling.getEntitlement.mockRejectedValue(new Error('verification error'));
  expect(await refreshEntitlement()).toBe(false);
  mockBilling.getProducts.mockResolvedValue([
    { id: PRO_PRODUCTS.monthly },
    { id: 'wrong.product' },
  ]);
  await loadSubscriptionProducts();
  expect(useSubscriptionStore.getState().products).toEqual([
    { id: PRO_PRODUCTS.monthly },
  ]);
});
