// Onboarding carousel with parallax effects and animated illustrations

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Theme } from '../constants/themes';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { Shadows } from '../constants/colors';

const PANEL_COUNT = 3;
const PANEL_COLORS = [
  {
    primary: '#FFB457',
    secondary: '#FF7A59',
    accent: '#FFE5B4',
    ink: '#1B1410',
  },
  {
    primary: '#59C3FF',
    secondary: '#2F80ED',
    accent: '#C7F9CC',
    ink: '#0B1726',
  },
  {
    primary: '#F4D35E',
    secondary: '#F78154',
    accent: '#A8E6CF',
    ink: '#1C1325',
  },
] as const;

const STAR_PATH =
  'M10 1 L12.9 6.5 L19 7.2 L14.5 11.3 L15.8 17.5 L10 14.2 L4.2 17.5 L5.5 11.3 L1 7.2 L7.1 6.5 Z';

const getInputRange = (index: number, width: number) => [
  (index - 1) * width,
  index * width,
  (index + 1) * width,
];

type PanelProps = {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  floatSlow: SharedValue<number>;
  floatFast: SharedValue<number>;
  pulse: SharedValue<number>;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  onFinish: () => void;
};

type PaginationDotProps = {
  index: number;
  screenWidth: number;
  scrollX: SharedValue<number>;
  color: string;
  styles: ReturnType<typeof createStyles>;
};

const PaginationDot: React.FC<PaginationDotProps> = ({
  index,
  screenWidth,
  scrollX,
  color,
  styles,
}) => {
  const dotStyle = useAnimatedStyle(
    () => {
      const inputRange = [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ];
      const scale = interpolate(scrollX.value, inputRange, [0.75, 1.3, 0.75], Extrapolation.CLAMP);
      const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
      return {
        transform: [{ scale }],
        opacity,
      };
    },
    [index, screenWidth],
  );

  return <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]} />;
};

const PanelBrand: React.FC<PanelProps> = ({
  index,
  width,
  scrollX,
  floatSlow,
  floatFast,
  theme,
  styles,
}) => {
  const t = useTranslation();
  const palette = PANEL_COLORS[index];
  const cardWidth = Math.min(width * 0.82, 340);
  const cardHeight = cardWidth * 0.68;
  const inputRange = getInputRange(index, width);

  const cardStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [26, 0, -20], Extrapolation.CLAMP);
    const rotate = interpolate(scrollX.value, inputRange, [4, 0, -4], Extrapolation.CLAMP);
    const floatY = interpolate(floatSlow.value, [0, 1], [-10, 10]);
    return {
      transform: [{ translateY: translateY + floatY }, { rotate: `${rotate}deg` }],
    };
  });

  const stampStyle = useAnimatedStyle(() => {
    const baseScale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP);
    const pulseScale = interpolate(floatFast.value, [0, 1], [0.95, 1.05]);
    return {
      transform: [{ scale: baseScale * pulseScale }],
    };
  });

  const watermarkStyle = useAnimatedStyle(() => {
    const translateX = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolation.CLAMP);
    return { transform: [{ translateX }] };
  });

  return (
    <View style={[styles.panel, { width }]}>
      <View style={styles.panelContent}>
        <Animated.View style={[styles.illustrationCard, { width: cardWidth, height: cardHeight }, cardStyle]}>
          <Svg width={cardWidth} height={cardHeight} viewBox="0 0 320 220">
            <Defs>
              <LinearGradient id="photoGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.primary} />
                <Stop offset="1" stopColor={palette.secondary} />
              </LinearGradient>
              <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.accent} stopOpacity="0.9" />
                <Stop offset="1" stopColor={palette.accent} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="12" y="12" width="296" height="196" rx="26" fill={theme.backgrounds.secondary} />
            <Rect x="22" y="22" width="276" height="176" rx="22" fill="url(#photoGradient)" />
            <Rect x="40" y="40" width="240" height="110" rx="18" fill={theme.overlays?.light || 'rgba(255,255,255,0.1)'} />
            <Path
              d="M40 140 L92 90 L138 128 L176 100 L218 142 L280 92 L280 162 L40 162 Z"
              fill={palette.accent}
              opacity="0.85"
            />
            <Circle cx="86" cy="78" r="16" fill="#FFFFFF" opacity="0.85" />
            <Rect x="48" y="172" width="140" height="16" rx="8" fill={theme.overlays?.dark || 'rgba(0,0,0,0.2)'} />
            <Rect x="48" y="194" width="90" height="10" rx="5" fill={theme.overlays?.dark || 'rgba(0,0,0,0.2)'} />
            <Rect x="200" y="164" width="80" height="40" rx="12" fill="url(#glowGradient)" opacity="0.8" />
          </Svg>

          <Animated.View style={[styles.watermarkOverlay, watermarkStyle]}>
            <Text style={styles.watermarkText}>{t.onboarding.panel1HeroWatermark}</Text>
          </Animated.View>
          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>{t.onboarding.panel1HeroTitle}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.stampBadge, stampStyle]}>
          <Svg width={56} height={56} viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="9" fill={palette.secondary} opacity="0.9" />
            <Path d={STAR_PATH} fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.headline}>{t.onboarding.panel1Title}</Text>
        <Text style={styles.body}>{t.onboarding.panel1Body}</Text>
      </View>
    </View>
  );
};

const PanelGestures: React.FC<PanelProps> = ({
  index,
  width,
  scrollX,
  floatSlow,
  pulse,
  styles,
}) => {
  const t = useTranslation();
  const palette = PANEL_COLORS[index];
  const cardWidth = Math.min(width * 0.78, 320);
  const cardHeight = cardWidth * 0.7;
  const inputRange = getInputRange(index, width);

  const frontCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(scrollX.value, inputRange, [-6, 0, 6], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, -20], Extrapolation.CLAMP);
    const floatY = interpolate(floatSlow.value, [0, 1], [-8, 8]);
    return {
      transform: [{ translateY: translateY + floatY }, { rotate: `${rotate}deg` }],
    };
  });

  const gestureStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
    const pulseScale = interpolate(pulse.value, [0, 1], [0.95, 1.05]);
    return {
      opacity,
      transform: [{ scale: scale * pulseScale }],
    };
  });

  return (
    <View style={[styles.panel, { width }]}>
      <View style={styles.panelContent}>
        <View style={styles.layerStack}>
          <View style={[styles.layerCard, { width: cardWidth, height: cardHeight, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          <View style={[styles.layerCard, styles.layerMiddle, { width: cardWidth, height: cardHeight, backgroundColor: 'rgba(255,255,255,0.12)' }]} />
          <Animated.View
            style={[
              styles.layerCard,
              styles.layerFront,
              { width: cardWidth, height: cardHeight },
              frontCardStyle,
            ]}
          >
            <Svg width={cardWidth} height={cardHeight} viewBox="0 0 320 220">
              <Rect x="16" y="16" width="288" height="188" rx="24" fill={palette.primary} opacity="0.9" />
              <Rect x="34" y="34" width="252" height="120" rx="18" fill="#FFFFFF" opacity="0.2" />
              <Rect x="34" y="168" width="160" height="18" rx="9" fill="#FFFFFF" opacity="0.3" />
              <Rect x="34" y="190" width="120" height="12" rx="6" fill="#FFFFFF" opacity="0.25" />
              <Rect x="72" y="62" width="176" height="76" rx="14" fill={palette.accent} opacity="0.55" />
            </Svg>
          </Animated.View>
        </View>

        <Animated.View style={[styles.gestureOverlay, gestureStyle]}>
          <Svg width={140} height={90} viewBox="0 0 140 90">
            <Circle cx="40" cy="45" r="16" fill={palette.secondary} opacity="0.9" />
            <Circle cx="100" cy="45" r="16" fill={palette.secondary} opacity="0.9" />
            <Path
              d="M20 45 C40 20, 100 20, 120 45"
              stroke={palette.accent}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M20 45 C40 70, 100 70, 120 45"
              stroke={palette.accent}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.headline}>{t.onboarding.panel2Title}</Text>
        <Text style={styles.body}>{t.onboarding.panel2Body}</Text>
        <View style={styles.gestureLabelRow}>
          <Text style={styles.gestureLabel}>{t.onboarding.panel2GestureLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const PanelFree: React.FC<PanelProps> = ({
  index,
  width,
  scrollX,
  floatFast,
  theme,
  styles,
  onFinish,
}) => {
  const t = useTranslation();
  const palette = PANEL_COLORS[index];
  const cardWidth = Math.min(width * 0.8, 330);
  const cardHeight = cardWidth * 0.68;
  const inputRange = getInputRange(index, width);

  const cardStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [26, 0, -20], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const arrowStyle = useAnimatedStyle(() => {
    const floatX = interpolate(floatFast.value, [0, 1], [-8, 8]);
    return { transform: [{ translateX: floatX }] };
  });

  const ctaStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const featureStyle1 = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [18, 0, 18], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const featureStyle2 = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [24, 0, 24], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const featureStyle3 = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={[styles.panel, { width }]}>
      <View style={styles.panelContent}>
        <Animated.View style={[styles.illustrationCard, { width: cardWidth, height: cardHeight }, cardStyle]}>
          <Svg width={cardWidth} height={cardHeight} viewBox="0 0 320 220">
            <Defs>
              <LinearGradient id="exportGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.primary} />
                <Stop offset="1" stopColor={palette.secondary} />
              </LinearGradient>
            </Defs>
            <Rect x="14" y="14" width="292" height="192" rx="26" fill={theme.backgrounds.secondary} />
            <Rect x="24" y="24" width="272" height="172" rx="22" fill="url(#exportGradient)" />
            <Rect x="52" y="54" width="216" height="56" rx="16" fill="#FFFFFF" opacity="0.2" />
            <Rect x="52" y="124" width="120" height="16" rx="8" fill="#FFFFFF" opacity="0.3" />
            <Rect x="52" y="146" width="90" height="12" rx="6" fill="#FFFFFF" opacity="0.24" />
            <Circle cx="250" cy="140" r="20" fill={palette.accent} opacity="0.75" />
            <Circle cx="270" cy="96" r="10" fill="#FFFFFF" opacity="0.6" />
            <Circle cx="228" cy="96" r="10" fill="#FFFFFF" opacity="0.6" />
          </Svg>
          <Animated.View style={[styles.exportArrow, arrowStyle]}>
            <Svg width={80} height={80} viewBox="0 0 80 80">
              <Path
                d="M40 12 V54"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <Path
                d="M26 28 L40 12 L54 28"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Rect x="18" y="54" width="44" height="12" rx="6" fill="#FFFFFF" opacity="0.8" />
            </Svg>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.headline}>{t.onboarding.panel3Title}</Text>
        <Text style={styles.body}>{t.onboarding.panel3Body}</Text>
        <View style={styles.featurePills}>
          <Animated.View style={[styles.featurePill, featureStyle1]}>
            <Svg width={18} height={18} viewBox="0 0 20 20">
              <Path d={STAR_PATH} fill={palette.primary} />
            </Svg>
            <Text style={styles.featureText}>{t.onboarding.panel3FeatureAssets}</Text>
          </Animated.View>
          <Animated.View style={[styles.featurePill, featureStyle2]}>
            <Svg width={18} height={18} viewBox="0 0 20 20">
              <Rect x="2" y="4" width="16" height="4" rx="2" fill={palette.secondary} />
              <Rect x="2" y="12" width="16" height="4" rx="2" fill={palette.secondary} />
              <Circle cx="7" cy="6" r="3" fill="#FFFFFF" />
              <Circle cx="13" cy="14" r="3" fill="#FFFFFF" />
            </Svg>
            <Text style={styles.featureText}>{t.onboarding.panel3FeatureTools}</Text>
          </Animated.View>
          <Animated.View style={[styles.featurePill, featureStyle3]}>
            <Svg width={18} height={18} viewBox="0 0 20 20">
              <Path
                d="M10 2 L18 6 V12 C18 16 14 18 10 19 C6 18 2 16 2 12 V6 Z"
                fill={palette.accent}
              />
            </Svg>
            <Text style={styles.featureText}>{t.onboarding.panel3FeatureNoWatermarks}</Text>
          </Animated.View>
        </View>
      </View>

      <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.accent.primary }]} onPress={onFinish}>
          <Text style={styles.ctaButtonText}>{t.onboarding.getStarted}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const setOnboardingSeen = useAppStore(state => state.setOnboardingSeen);
  const theme = useTheme();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const stylesMemo = useMemo(() => createStyles(theme), [theme]);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const floatSlow = useSharedValue(0);
  const floatFast = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    floatSlow.value = withRepeat(
      withTiming(1, { duration: 6200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    floatFast.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [floatSlow, floatFast, pulse]);

  const updateCurrentIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / screenWidth);
      runOnJS(updateCurrentIndex)(index);
    },
  });

  const handleFinish = () => {
    setOnboardingSeen();
    navigation.navigate('Home' as never);
  };

  const handleNext = () => {
    if (currentIndex < PANEL_COUNT - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatSlow.value, [0, 1], [-12, 12]);
    return { transform: [{ translateY }] };
  });

  return (
    <SafeAreaView style={stylesMemo.container}>
      <Animated.View style={[stylesMemo.backgroundGlow, { width: screenWidth, height: screenHeight }, backgroundStyle]} pointerEvents="none">
        <Svg width={screenWidth} height={screenHeight}>
          <Defs>
            <LinearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.backgrounds.primary} />
              <Stop offset="1" stopColor={theme.backgrounds.secondary} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGradient)" />
          <Circle cx={screenWidth * 0.2} cy={screenHeight * 0.2} r={120} fill={theme.accent.primary} opacity={0.12} />
          <Circle cx={screenWidth * 0.85} cy={screenHeight * 0.3} r={160} fill={theme.accent.secondary} opacity={0.12} />
          <Circle cx={screenWidth * 0.3} cy={screenHeight * 0.8} r={200} fill={theme.semantic.info} opacity={0.08} />
        </Svg>
      </Animated.View>

      <TouchableOpacity style={[stylesMemo.skipButton, { top: insets.top + Spacing.l }]} onPress={handleFinish}>
        <Text style={stylesMemo.skipText}>{t.onboarding.skip}</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        decelerationRate="fast"
        bounces
      >
        <PanelBrand
          index={0}
          width={screenWidth}
          scrollX={scrollX}
          floatSlow={floatSlow}
          floatFast={floatFast}
          pulse={pulse}
          theme={theme}
          styles={stylesMemo}
          onFinish={handleFinish}
        />
        <PanelGestures
          index={1}
          width={screenWidth}
          scrollX={scrollX}
          floatSlow={floatSlow}
          floatFast={floatFast}
          pulse={pulse}
          theme={theme}
          styles={stylesMemo}
          onFinish={handleFinish}
        />
        <PanelFree
          index={2}
          width={screenWidth}
          scrollX={scrollX}
          floatSlow={floatSlow}
          floatFast={floatFast}
          pulse={pulse}
          theme={theme}
          styles={stylesMemo}
          onFinish={handleFinish}
        />
      </Animated.ScrollView>

      <View style={stylesMemo.pagination}>
        {[0, 1, 2].map(index => (
          <PaginationDot
            key={index}
            index={index}
            screenWidth={screenWidth}
            scrollX={scrollX}
            color={theme.accent.primary}
            styles={stylesMemo}
          />
        ))}
      </View>

      {currentIndex < PANEL_COUNT - 1 && (
        <TouchableOpacity style={stylesMemo.nextButton} onPress={handleNext}>
          <View style={stylesMemo.nextChevron} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgrounds.primary,
    },
    backgroundGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    skipButton: {
      position: 'absolute',
      right: Spacing.m,
      zIndex: 2,
      padding: Spacing.s,
    },
    skipText: {
      fontFamily: 'FiraSans-Regular',
      fontSize: 14,
      color: theme.text.tertiary,
      letterSpacing: 0.2,
    },
    panelContent: {
      flex: 0.62,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing.xxxl,
    },
    panel: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
    },
    illustrationCard: {
      borderRadius: AppDimensions.cornerRadius.xlarge,
      overflow: 'hidden',
      backgroundColor: theme.backgrounds.secondary,
      ...Shadows.level2,
    },
    watermarkOverlay: {
      position: 'absolute',
      left: Spacing.l,
      right: Spacing.l,
      top: Spacing.l,
      transform: [{ rotate: '-12deg' }],
    },
    watermarkText: {
      fontFamily: 'HomemadeApple-Regular',
      fontSize: 18,
      color: '#FFFFFF',
      opacity: 0.85,
    },
    heroLabel: {
      position: 'absolute',
      bottom: Spacing.m,
      left: Spacing.m,
      paddingHorizontal: Spacing.s,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    heroLabelText: {
      fontFamily: 'FiraSans-Regular',
      fontSize: 12,
      color: '#FFFFFF',
      letterSpacing: 0.4,
    },
    stampBadge: {
      position: 'absolute',
      right: Spacing.xl,
      bottom: Spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.level1,
    },
    layerStack: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    layerCard: {
      borderRadius: AppDimensions.cornerRadius.large,
      position: 'absolute',
    },
    layerMiddle: {
      transform: [{ translateY: 14 }, { scale: 0.96 }],
    },
    layerFront: {
      backgroundColor: theme.backgrounds.secondary,
      ...Shadows.level2,
    },
    gestureOverlay: {
      position: 'absolute',
      bottom: Spacing.l,
    },
    textBlock: {
      flex: 0.38,
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.m,
    },
    headline: {
      fontFamily: 'ArchivoBlack-Regular',
      fontSize: 28,
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: Spacing.s,
      letterSpacing: -0.5,
    },
    body: {
      fontFamily: 'FiraSans-Regular',
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    gestureLabelRow: {
      marginTop: Spacing.m,
      paddingHorizontal: Spacing.m,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
      backgroundColor: theme.backgrounds.secondary,
    },
    gestureLabel: {
      fontFamily: 'FiraSans-Medium',
      fontSize: 13,
      color: theme.text.primary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    featurePills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: Spacing.m,
      gap: Spacing.xs,
    },
    featurePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.backgrounds.secondary,
      paddingHorizontal: Spacing.s,
      paddingVertical: 6,
      borderRadius: 16,
    },
    featureText: {
      fontFamily: 'FiraSans-Regular',
      fontSize: 12,
      color: theme.text.primary,
    },
    exportArrow: {
      position: 'absolute',
      right: Spacing.l,
      top: Spacing.l,
    },
    ctaWrapper: {
      alignItems: 'center',
      marginTop: Spacing.l,
    },
    ctaButton: {
      height: AppDimensions.button.height,
      paddingHorizontal: Spacing.xxl,
      borderRadius: AppDimensions.button.cornerRadius,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.goldGlow,
    },
    ctaButtonText: {
      fontFamily: 'ArchivoBlack-Regular',
      fontSize: 16,
      color: theme.backgrounds.primary,
      letterSpacing: 0.6,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.xl,
      gap: Spacing.s,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    nextButton: {
      position: 'absolute',
      right: Spacing.m,
      bottom: Spacing.l,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.backgrounds.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.level1,
    },
    nextChevron: {
      width: 12,
      height: 12,
      borderRightWidth: 2,
      borderTopWidth: 2,
      borderColor: theme.text.primary,
      transform: [{ rotate: '45deg' }],
    },
  });

export default OnboardingScreen;
