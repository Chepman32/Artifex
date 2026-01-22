// Reusable bottom sheet modal with physics-based spring animations

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  WithSpringConfig,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
  snapPoints?: number[]; // Heights where sheet can snap (as percentages of screen)
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  height,
  snapPoints = [0.5, 0.9],
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isRendered, setIsRendered] = useState(visible);

  const baseHeight = height || screenHeight * snapPoints[0];
  const sheetHeight = baseHeight + insets.bottom;

  const translateY = useSharedValue(sheetHeight);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withSpring(0, {
        damping: 50,
        stiffness: 400,
      });
      backdropOpacity.value = withSpring(1);
    } else {
      const closeConfig: WithSpringConfig = {
        damping: 45,
        stiffness: 320,
      };
      translateY.value = withSpring(sheetHeight, closeConfig, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
      backdropOpacity.value = withSpring(0);
    }
  }, [visible, sheetHeight]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      const newY = ctx.startY + event.translationY;
      translateY.value = Math.max(0, Math.min(newY, sheetHeight));
    },
    onEnd: event => {
      // Close if dragged down beyond threshold or with velocity
      if (
        event.translationY > 100 ||
        (event.translationY > 0 && event.velocityY > 500)
      ) {
        translateY.value = withSpring(sheetHeight, {
          velocity: event.velocityY,
        });
        backdropOpacity.value = withSpring(0);
        runOnJS(onClose)();
      } else {
        // Snap back to position
        translateY.value = withSpring(0, {
          damping: 50,
          stiffness: 400,
        });
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isRendered) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isRendered}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableOpacity>

        {/* Sheet */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.sheet, { height: sheetHeight }, sheetStyle]}>
            {/* Drag handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Content */}
            <View
              style={[
                styles.content,
                { paddingBottom: Spacing.l + insets.bottom },
              ]}
            >
              {children}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: theme.backgrounds.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.backgrounds.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 2.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.l,
  },
  });
