// Reusable button component with animations

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { hapticFeedback } from '../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || loading) return;

    scale.value = withTiming(0.96, { duration: 100 });
    opacity.value = withTiming(0.8, { duration: 100 });
    hapticFeedback.light();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled || loading) return;

    hapticFeedback.medium();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: AppDimensions.button.cornerRadius,
    };

    // Size variants
    switch (size) {
      case 'small':
        baseStyle.height = 40;
        baseStyle.paddingHorizontal = Spacing.m;
        break;
      case 'large':
        baseStyle.height = 64;
        baseStyle.paddingHorizontal = Spacing.xl;
        break;
      default: // medium
        baseStyle.height = AppDimensions.button.height;
        baseStyle.paddingHorizontal = Spacing.l;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = theme.accent.primary;
        if (disabled) {
          baseStyle.backgroundColor = theme.backgrounds.tertiary;
          baseStyle.opacity = 0.5;
        }
        break;
      case 'secondary':
        baseStyle.backgroundColor = theme.backgrounds.tertiary;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.backgrounds.tertiary;
        if (disabled) {
          baseStyle.opacity = 0.5;
        }
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        if (disabled) {
          baseStyle.opacity = 0.5;
        }
        break;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...Typography.ui.button,
    };

    // Size variants
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 20;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.color = theme.backgrounds.primary;
        if (disabled) {
          baseStyle.color = theme.text.tertiary;
        }
        break;
      case 'secondary':
        baseStyle.color = theme.text.primary;
        if (disabled) {
          baseStyle.color = theme.text.tertiary;
        }
        break;
      case 'text':
        baseStyle.color = theme.accent.primary;
        if (disabled) {
          baseStyle.color = theme.text.tertiary;
        }
        break;
    }

    return baseStyle;
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1} // We handle opacity with animations
    >
      <Text style={[getTextStyle(), textStyle]}>
        {loading ? t.common.loading : title}
      </Text>
    </AnimatedTouchableOpacity>
  );
};

export default Button;
