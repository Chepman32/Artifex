import type { Language } from './translations';

const en = {
  title: 'Make every photo\nuniquely yours.',
  subtitle: 'A little more magic. A mark that is all you.',
  cleanExports: 'Logo-free exports',
  premiumAssets: 'Premium stickers & stamps',
  collection: 'Pro Collection',
  monthly: 'Monthly',
  yearly: 'Yearly',
  month: 'month',
  year: 'year',
  bestValue: 'Best value',
  subscribe: 'Continue with Pro',
  startTrial: 'Start {days}-day free trial',
  trial: '{days} days free, then {price} / {period}',
  renewal:
    'Auto-renews at {price} / {period}. Cancel in Apple Account settings at least 24 hours before renewal. Payment is charged to your Apple Account.',
  trialRenewal:
    'No payment now. After {days} days, {price} / {period} is charged to your Apple Account. Auto-renews unless cancelled at least 24 hours before the trial or billing period ends.',
  unavailable: 'Subscriptions are temporarily unavailable. Please try again.',
  retry: 'Try again',
  failed: 'The purchase could not be completed. Please try again.',
  pending:
    'Your purchase is awaiting approval. Pro will unlock when Apple confirms it.',
  noRestore: 'No active Pro subscription was found for this Apple Account.',
  restored: 'Your Pro subscription has been restored.',
  manage: 'Manage subscription',
  active: 'Pro is active',
  freeExport: 'Free exports include the Marqo logo.',
  onboardingTitle: 'Create your way',
  onboardingBody:
    'Start free with all editing tools. Choose Pro for logo-free exports and exclusive stickers and stamps.',
  freeAssets: 'Free sticker library',
  freeTools: 'All editing tools',
  proExports: 'Logo-free with Pro',
};
export type ProCopy = typeof en;

// New paywall copy stays separate from the established editor translations.
const localized: Partial<Record<Language, Partial<ProCopy>>> = {
  ru: {
    title: 'Каждое фото —\nпо-вашему.',
    subtitle: 'Больше волшебства. Ваш неповторимый стиль.',
    cleanExports: 'Экспорт без логотипа',
    premiumAssets: 'Премиум-стикеры и штампы',
    collection: 'Коллекция Pro',
    monthly: 'Месяц',
    yearly: 'Год',
    month: 'месяц',
    year: 'год',
    bestValue: 'Выгоднее',
    subscribe: 'Продолжить с Pro',
    startTrial: 'Попробовать {days} дней бесплатно',
    trial: '{days} дней бесплатно, затем {price} / {period}',
    renewal:
      'Автопродление за {price} / {period}. Отмена в настройках Apple Account не позднее чем за 24 часа до продления. Оплата через Apple Account.',
    trialRenewal:
      'Сейчас бесплатно. Через {days} дней: {price} / {period} через Apple Account. Автопродление, если не отменить за 24 часа до окончания пробного или оплаченного периода.',
    unavailable: 'Подписки временно недоступны. Попробуйте ещё раз.',
    retry: 'Повторить',
    failed: 'Не удалось завершить покупку. Попробуйте ещё раз.',
    pending:
      'Покупка ожидает подтверждения. Pro откроется после подтверждения Apple.',
    noRestore: 'У этого Apple Account нет активной подписки Pro.',
    restored: 'Подписка Pro восстановлена.',
    manage: 'Управление подпиской',
    active: 'Pro активна',
    freeExport: 'На бесплатном экспорте будет логотип Marqo.',
    onboardingTitle: 'Творите по-своему',
    onboardingBody:
      'Начните бесплатно со всеми инструментами. Pro даёт экспорт без логотипа, эксклюзивные стикеры и штампы.',
    freeAssets: 'Бесплатные стикеры',
    freeTools: 'Все инструменты',
    proExports: 'Без логотипа с Pro',
  },
};

export const getProCopy = (language: Language): ProCopy => ({
  ...en,
  ...localized[language],
});
export const formatProCopy = (
  text: string,
  values: Record<string, string | number>,
): string =>
  text.replace(/\{(\w+)\}/g, (match, key: string) =>
    String(values[key] ?? match),
  );
