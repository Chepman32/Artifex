import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useCurrentLanguage, useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import { formatProCopy, getProCopy } from '../localization/pro';
import {
  PRO_PRODUCTS,
  PRIVACY_URL,
  TERMS_URL,
  type ProPlan,
} from '../constants/subscriptions';
import { PREMIUM_STICKERS } from '../constants/premiumAssets';
import {
  hasProEntitlement,
  useSubscriptionStore,
} from '../stores/subscriptionStore';
import {
  loadSubscriptionProducts,
  purchasePro,
  restorePro,
} from '../services/subscriptions';

interface Props {
  onClose: () => void;
  onUnlocked?: () => void;
}

export const PaywallContent: React.FC<Props> = ({ onClose, onUnlocked }) => {
  const theme = useTheme();
  const language = useCurrentLanguage();
  const t = useTranslation();
  const copy = getProCopy(language);
  const { products, loading, busy, entitlement } = useSubscriptionStore();
  const [plan, setPlan] = useState<ProPlan>('yearly');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const product = products.find(p => p.id === PRO_PRODUCTS[plan]);
  const trialDays = product?.trialEligible ? product.trialDays : 0;
  const price =
    product?.displayPrice ?? (plan === 'yearly' ? 'US$60.00' : 'US$6.00');
  const period = plan === 'yearly' ? copy.year : copy.month;
  const values = { price, period, days: trialDays };

  useEffect(() => {
    void loadSubscriptionProducts();
  }, []);
  useEffect(() => {
    if (hasProEntitlement(entitlement)) onUnlocked?.();
  }, [entitlement, onUnlocked]);

  const handlePurchase = async () => {
    try {
      const result = await purchasePro(plan);
      if (result === 'pending') Alert.alert('Marqo Pro', copy.pending);
      if (result === 'purchased') (onUnlocked ?? onClose)();
    } catch {
      Alert.alert(t.common.error, copy.failed);
    }
  };
  const handleRestore = async () => {
    try {
      const restored = await restorePro();
      if (restored) (onUnlocked ?? onClose)();
      else Alert.alert('Marqo Pro', copy.noRestore);
    } catch {
      Alert.alert(t.common.error, copy.failed);
    }
  };
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert(t.common.error, url));
  };

  return (
    <View style={styles.root} testID="pro-paywall">
      <View style={styles.topbar}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t.common.close}
          testID="paywall-close"
          onPress={onClose}
          style={styles.close}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          testID="restore-purchases"
          onPress={handleRestore}
          disabled={busy}
          style={styles.restore}
        >
          <Text style={styles.restoreText}>{t.settings.restorePurchases}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        testID="paywall-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.art} accessible={false} pointerEvents="none">
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="proGlow" cx="50%" cy="50%" rx="55%" ry="55%">
                <Stop offset="0" stopColor="#C8A05C" stopOpacity="0.26" />
                <Stop offset="1" stopColor="#C8A05C" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#proGlow)" />
          </Svg>
          <View style={[styles.artCard, styles.leftCard]}>
            <Image
              source={PREMIUM_STICKERS[1].file!}
              style={styles.artImage}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.artCard, styles.rightCard]}>
            <Image
              source={PREMIUM_STICKERS[3].file!}
              style={styles.artImage}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.artCard, styles.centerCard]}>
            <Image
              source={PREMIUM_STICKERS[0].file!}
              style={styles.artImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.sparkleLeft}>✦</Text>
          <Text style={styles.sparkleRight}>✧</Text>
        </View>
        <View style={styles.wordmark}>
          <Text style={styles.brand}>Marqo</Text>
          <View style={styles.proTag}>
            <Text style={styles.proTagText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <View style={styles.features}>
          {[copy.cleanExports, copy.premiumAssets].map(feature => (
            <View key={feature} style={styles.feature}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <View style={styles.plans}>
          {(['yearly', 'monthly'] as ProPlan[]).map(option => {
            const item = products.find(p => p.id === PRO_PRODUCTS[option]);
            const selected = plan === option;
            const itemPeriod = option === 'yearly' ? copy.year : copy.month;
            return (
              <TouchableOpacity
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: busy }}
                testID={`plan-${option}`}
                activeOpacity={0.85}
                disabled={busy}
                onPress={() => setPlan(option)}
                style={[styles.plan, selected && styles.selectedPlan]}
              >
                {option === 'yearly' && (
                  <View style={styles.valueBadge}>
                    <Text style={styles.valueBadgeText}>{copy.bestValue}</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>
                    {option === 'yearly' ? copy.yearly : copy.monthly}
                  </Text>
                  <View
                    style={[styles.radio, selected && styles.selectedRadio]}
                  >
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </View>
                <Text
                  style={styles.price}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {item?.displayPrice ??
                    (option === 'yearly' ? 'US$60.00' : 'US$6.00')}
                </Text>
                <Text style={styles.period}>/ {itemPeriod}</Text>
                <Text style={styles.trialLine}>
                  {item?.trialEligible && item.trialDays > 0
                    ? formatProCopy(copy.startTrial, { days: item.trialDays })
                    : 'Marqo Pro'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!loading && !product && (
          <View style={styles.unavailable}>
            <Text style={styles.disclosure}>{copy.unavailable}</Text>
            <TouchableOpacity
              onPress={() => void loadSubscriptionProducts()}
              accessibilityRole="button"
              style={styles.retry}
            >
              <Text style={styles.restoreText}>{copy.retry}</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          testID="subscribe-pro"
          disabled={busy || loading || !product}
          onPress={handlePurchase}
          activeOpacity={0.85}
          style={[styles.cta, (busy || loading || !product) && styles.disabled]}
        >
          {busy || loading ? (
            <ActivityIndicator color="#17120B" />
          ) : (
            <Text style={styles.ctaText}>
              {trialDays > 0
                ? formatProCopy(copy.startTrial, { days: trialDays })
                : copy.subscribe}
              <Text> →</Text>
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.billing}>
          {trialDays > 0
            ? formatProCopy(copy.trial, values)
            : `${price} / ${period}`}
        </Text>
        <Text style={styles.disclosure}>
          {formatProCopy(
            trialDays > 0 ? copy.trialRenewal : copy.renewal,
            values,
          )}
        </Text>
        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="link"
            testID="paywall-terms"
            onPress={() => openLink(TERMS_URL)}
            style={styles.footerLink}
          >
            <Text style={styles.legal}>{t.settings.termsOfService}</Text>
          </TouchableOpacity>
          <Text style={styles.legal}>·</Text>
          <TouchableOpacity
            accessibilityRole="link"
            testID="paywall-privacy"
            onPress={() => openLink(PRIVACY_URL)}
            style={styles.footerLink}
          >
            <Text style={styles.legal}>{t.settings.privacyPolicy}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.backgrounds.secondary },
    topbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    close: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.backgrounds.tertiary,
    },
    closeText: { fontSize: 29, lineHeight: 33, color: theme.text.secondary },
    restore: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
    restoreText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
    },
    content: { paddingBottom: 12 },
    art: {
      height: 192,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: -12,
    },
    artCard: {
      width: 130,
      height: 150,
      backgroundColor: '#EEE8DC',
      borderRadius: 18,
      padding: 4,
      position: 'absolute',
      borderWidth: 1,
      borderColor: '#FFF6E6',
      shadowColor: '#000000',
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    leftCard: {
      marginRight: 178,
      transform: [{ rotate: '-17deg' }, { scale: 0.84 }],
    },
    rightCard: {
      marginLeft: 178,
      transform: [{ rotate: '16deg' }, { scale: 0.84 }],
    },
    centerCard: {
      transform: [{ rotate: '-5deg' }],
      backgroundColor: '#FFF7F0',
    },
    artImage: { width: '100%', height: '100%' },
    sparkleLeft: {
      position: 'absolute',
      left: '14%',
      bottom: 5,
      fontSize: 31,
      color: '#D4AF37',
    },
    sparkleRight: {
      position: 'absolute',
      right: '11%',
      top: 1,
      fontSize: 42,
      color: '#D4AF37',
    },
    wordmark: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
      marginBottom: 12,
    },
    brand: {
      fontSize: 19,
      fontWeight: '700',
      letterSpacing: -0.8,
      color: theme.text.primary,
    },
    proTag: {
      paddingVertical: 3,
      paddingHorizontal: 7,
      backgroundColor: '#D4AF37',
      borderRadius: 5,
    },
    proTagText: {
      color: '#17120B',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    title: {
      fontSize: 33,
      lineHeight: 36,
      fontWeight: '700',
      letterSpacing: -1.2,
      textAlign: 'center',
      color: theme.text.primary,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      color: theme.text.secondary,
      marginTop: 10,
    },
    features: { marginTop: 17, marginBottom: 25, alignSelf: 'center', gap: 8 },
    feature: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    check: { fontSize: 14, fontWeight: '800', color: theme.accent.primary },
    featureText: { fontSize: 14, color: theme.text.primary, flexShrink: 1 },
    plans: { flexDirection: 'row', gap: 10 },
    plan: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: theme.backgrounds.tertiary,
      backgroundColor: theme.backgrounds.primary,
      borderRadius: 17,
      padding: 15,
    },
    selectedPlan: {
      borderColor: '#D4AF37',
      backgroundColor: theme.backgrounds.tertiary,
    },
    valueBadge: {
      position: 'absolute',
      alignSelf: 'center',
      top: -11,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      backgroundColor: '#D4AF37',
    },
    valueBadgeText: { fontSize: 10, fontWeight: '800', color: '#17120B' },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 5,
      marginBottom: 8,
    },
    planName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      flexShrink: 1,
    },
    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: theme.text.tertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedRadio: { borderColor: '#D4AF37' },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#D4AF37',
    },
    price: {
      fontSize: 27,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.7,
    },
    period: { fontSize: 12, color: theme.text.secondary, marginTop: 2 },
    trialLine: {
      fontSize: 10,
      lineHeight: 14,
      color: theme.text.secondary,
      marginTop: 10,
    },
    cta: {
      minHeight: 56,
      marginTop: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 17,
      backgroundColor: '#D4AF37',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ctaText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#17120B',
      textAlign: 'center',
    },
    disabled: { opacity: 0.55 },
    billing: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600',
      textAlign: 'center',
      color: theme.text.primary,
      marginTop: 10,
    },
    disclosure: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 10,
    },
    unavailable: { marginTop: 8 },
    retry: { minHeight: 36, alignItems: 'center', justifyContent: 'center' },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    footerLink: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    legal: { fontSize: 11, color: theme.text.secondary },
  });
