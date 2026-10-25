import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { PRO_PRODUCTS } from '../src/constants/subscriptions';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { PaywallContent } from '../src/components/PaywallContent';
import { purchasePro } from '../src/services/subscriptions';

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  Rect: 'Rect',
  Stop: 'Stop',
}));

jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => require('../src/constants/themes').themes.dark,
}));
jest.mock('../src/hooks/useTranslation', () => ({
  useCurrentLanguage: () => 'en',
  useTranslation: () => require('../src/localization/languages/en').en,
}));
jest.mock('../src/services/subscriptions', () => ({
  loadSubscriptionProducts: jest.fn(),
  purchasePro: jest.fn().mockResolvedValue('cancelled'),
  restorePro: jest.fn().mockResolvedValue(false),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useSubscriptionStore.setState({
    loading: false,
    busy: false,
    entitlement: { productId: null, expiresAt: null },
    products: [
      {
        id: PRO_PRODUCTS.monthly,
        displayPrice: '$6.00',
        price: 6,
        currency: 'USD',
        trialDays: 7,
        trialEligible: true,
      },
      {
        id: PRO_PRODUCTS.yearly,
        displayPrice: '$60.00',
        price: 60,
        currency: 'USD',
        trialDays: 7,
        trialEligible: true,
      },
    ],
  });
});

test('the paywall shows full renewal prices, trial duration, restore, and legal links', () => {
  const screen = render(<PaywallContent onClose={jest.fn()} />);
  expect(screen.getByText('$60.00')).toBeTruthy();
  expect(screen.getByText('$6.00')).toBeTruthy();
  expect(screen.getByText('7 days free, then $60.00 / year')).toBeTruthy();
  expect(screen.getByTestId('restore-purchases')).toBeTruthy();
  expect(screen.getByText('Terms of Service')).toBeTruthy();
  expect(screen.getByText('Privacy Policy')).toBeTruthy();
});

test('selecting monthly changes the trial renewal amount and requests the selected plan', async () => {
  const screen = render(<PaywallContent onClose={jest.fn()} />);
  fireEvent.press(screen.getByTestId('plan-monthly'));
  expect(screen.getByText('7 days free, then $6.00 / month')).toBeTruthy();
  fireEvent.press(screen.getByTestId('subscribe-pro'));
  await waitFor(() => expect(purchasePro).toHaveBeenCalledWith('monthly'));
});

test('ineligible customers never see a free-trial promise', () => {
  useSubscriptionStore.setState(state => ({
    products: state.products.map(p => ({ ...p, trialEligible: false })),
  }));
  const screen = render(<PaywallContent onClose={jest.fn()} />);
  expect(screen.queryByText(/free trial/)).toBeNull();
  expect(screen.getByText(/Continue with Pro/)).toBeTruthy();
  expect(screen.getByText(/Auto-renews at \$60.00/)).toBeTruthy();
});

test('missing store products leave the purchase button disabled and provide a retry', () => {
  useSubscriptionStore.setState({ products: [] });
  const screen = render(<PaywallContent onClose={jest.fn()} />);
  expect(screen.getByText('Try again')).toBeTruthy();
  fireEvent.press(screen.getByTestId('subscribe-pro'));
  expect(purchasePro).not.toHaveBeenCalled();
});
