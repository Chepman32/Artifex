import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  languageNames,
  translations,
  type Language,
} from '../src/localization';
import { STICKERS, STAMPS } from '../src/constants/assets';
import { localizedArtwork } from '../src/constants/localizedArtwork';
import {
  getLocalizedStickers,
  getLocalizedStamps,
} from '../src/constants/localizedAssets';
import { StickerPickerModal } from '../src/components/modals/StickerPickerModal';
import { StampsPickerModal } from '../src/components/modals/StampsPickerModal';
import { refreshEntitlement } from '../src/services/subscriptions';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { PRO_PRODUCTS } from '../src/constants/subscriptions';

let mockLanguage: Language = 'en';

jest.mock('../src/components/modals/BottomSheet', () => ({
  BottomSheet: ({ visible, children }: any) => (visible ? children : null),
}));
jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => require('../src/constants/themes').themes.dark,
}));
jest.mock('../src/hooks/useTranslation', () => ({
  useCurrentLanguage: () => mockLanguage,
  useTranslation: () =>
    require('../src/localization').translations[mockLanguage],
}));
jest.mock('../src/stores/appStore', () => ({
  useAppStore: (selector: any) =>
    selector({ preferences: { hapticFeedback: false } }),
}));
jest.mock('../src/utils/haptics', () => ({ triggerHaptic: jest.fn() }));
jest.mock('../src/services/subscriptions', () => ({ refreshEntitlement: jest.fn().mockResolvedValue(false) }));
jest.mock('../src/components/ProBadge', () => ({ ProBadge: () => require('react').createElement(require('react-native').Text, null, 'PRO') }));
jest.mock('../src/components/PaywallContent', () => ({
  PaywallContent: () => require('react').createElement(require('react-native').Text, { testID: 'pro-paywall' }, 'Marqo Pro'),
}));

const languages = Object.keys(languageNames) as Language[];
const textStickers = [
  's2',
  's3',
  's4',
  's5',
  's6',
  's8',
  's9',
  's10',
  's11',
  's12',
  's13',
  's14',
  's15',
  's16',
  's17',
  's20',
  's28',
  's29',
];
const originals = [
  ...STICKERS.free,
  ...STICKERS.pro,
  ...STAMPS.free,
  ...STAMPS.pro,
];

test('the artwork registry covers exactly the supported app languages', () => {
  expect(Object.keys(localizedArtwork).sort()).toEqual(
    languages.slice().sort(),
  );
});

test.each(languages)(
  '%s has bundled artwork for every text-bearing sticker and stamp',
  language => {
    const stickers = getLocalizedStickers(language);
    const stamps = getLocalizedStamps(language);
    expect(stickers).toHaveLength(STICKERS.free.length + STICKERS.pro.length);
    expect(stamps).toHaveLength(STAMPS.free.length + STAMPS.pro.length);
    for (const [kind, assets] of [
      ['stickers', stickers],
      ['stamps', stamps],
    ] as const) {
      for (const asset of assets) {
        const hasText =
          kind === 'stickers'
            ? textStickers.includes(asset.id)
            : asset.id !== 'label' && !asset.isPro;
        const original = originals.find(item => item.id === asset.id)!;
        if (hasText) {
          expect(asset.file).toEqual(
            expect.objectContaining({
              testUri: expect.stringContaining(
                `/localized/${language}/${kind}/${asset.id}.png`,
              ),
            }),
          );
          expect(asset.file).not.toEqual(original.file);
          expect(asset.name.length).toBeGreaterThan(0);
        } else {
          // Pure illustrations and logos have no wording to translate.
          expect(asset).toBe(original);
        }
        expect(asset.category).toBe(original.category);
        expect(asset.width).toBe(original.width);
        expect(asset.height).toBe(original.height);
      }
    }
    expect(Object.keys(localizedArtwork[language])).toHaveLength(38);
  },
);

test('resolving a different language does not mutate previously selected artwork', () => {
  const french = getLocalizedStickers('fr').find(asset => asset.id === 's5')!;
  const source = french.file;
  const russian = getLocalizedStickers('ru').find(asset => asset.id === 's5')!;
  expect(french.file).toBe(source);
  expect(french.name).toBe('Suivez-nous');
  expect(russian.name).toBe('Подпишись');
  expect(STICKERS.free.find(asset => asset.id === 's5')!.name).toBe(
    'Follow Us',
  );
});

test('the sticker picker switches artwork live and inserts the displayed localized PNG', () => {
  mockLanguage = 'en';
  const onSelect = jest.fn();
  const onClose = jest.fn();
  const props = { visible: true, onSelect, onClose };
  const screen = render(<StickerPickerModal {...props} />);
  expect(screen.getByLabelText('Follow us')).toBeTruthy();

  mockLanguage = 'ru';
  screen.rerender(<StickerPickerModal {...props} />);
  expect(screen.queryByLabelText('Follow us')).toBeNull();
  expect(screen.getByText(translations.ru.stickers.title)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Подпишись'));
  expect(onSelect).toHaveBeenCalledWith(
    localizedArtwork.ru['stickers/s5'].file,
    100,
    100,
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('the stamp picker retains its category and inserts the new language artwork', () => {
  mockLanguage = 'en';
  const onSelect = jest.fn();
  const onClose = jest.fn();
  const props = { visible: true, onSelect, onClose };
  const screen = render(<StampsPickerModal {...props} />);
  fireEvent.press(screen.getByText(translations.en.stamps.categories.approval));

  mockLanguage = 'ar';
  screen.rerender(<StampsPickerModal {...props} />);
  expect(screen.queryByLabelText('Draft')).toBeNull();
  fireEvent.press(screen.getAllByLabelText('معتمد')[0]);
  expect(onSelect).toHaveBeenCalledWith(
    localizedArtwork.ar['stamps/approved-1966719'].file,
    80,
    80,
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});

test.each([
  ['stickers', StickerPickerModal, 'pro-crystal-heart', 140],
  ['stamps', StampsPickerModal, 'pro-laurel-star', 120],
] as const)('%s remain visible but open the paywall for a free user', async (_, Picker, id, _size) => {
  mockLanguage = 'en';
  (refreshEntitlement as jest.Mock).mockResolvedValue(false);
  useSubscriptionStore.setState({ entitlement: { productId: null, expiresAt: null } });
  const onSelect = jest.fn();
  const screen = render(<Picker visible onClose={jest.fn()} onSelect={onSelect} />);
  fireEvent.press(screen.getByText('Pro Collection'));
  fireEvent.press(screen.getByTestId(`asset-${id}`));
  await waitFor(() => expect(screen.getByTestId('pro-paywall')).toBeTruthy());
  expect(onSelect).not.toHaveBeenCalled();
});

test.each([
  ['stickers', StickerPickerModal, 'pro-crystal-heart', 140],
  ['stamps', StampsPickerModal, 'pro-laurel-star', 120],
] as const)('%s insert Pro artwork with its persistent identity for a subscriber', async (_, Picker, id, size) => {
  mockLanguage = 'en';
  (refreshEntitlement as jest.Mock).mockResolvedValue(true);
  useSubscriptionStore.setState({ entitlement: { productId: PRO_PRODUCTS.monthly, expiresAt: Date.now() + 100_000 } });
  const onSelect = jest.fn();
  const screen = render(<Picker visible onClose={jest.fn()} onSelect={onSelect} />);
  fireEvent.press(screen.getByText('Pro Collection'));
  fireEvent.press(screen.getByTestId(`asset-${id}`));
  await waitFor(() => expect(onSelect).toHaveBeenCalledWith(expect.anything(), size, size, id));
  expect(screen.queryByTestId('pro-paywall')).toBeNull();
});
