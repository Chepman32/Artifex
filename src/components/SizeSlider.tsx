// Vertical size slider for adjusting selected element size

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { haptics } from '../utils/haptics';

interface SizeSliderProps {
  visible: boolean;
  initialValue: number; // 0.1 to 3.0
  onValueChange: (value: number) => void;
  position: { x: number; y: number }; // Position relative to canvas
}

const SLIDER_HEIGHT = 200;
const SLIDER_WIDTH = 40;
const THUMB_SIZE = 24;
const MIN_SCALE = 0.1;
const MAX_SCALE = 3.0;

export const SizeSlider: React.FC<SizeSliderProps> = ({
  visible,
  initialValue,
  onValueChange,
  position,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(initialValue);

  // Convert scale value to slider position (0 to 1)
  const getSliderPosition = (scaleValue: number) => {
    return (scaleValue - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);
  };

  // Convert slider position to scale value
  const getScaleFromPosition = (position: number) => {
    return MIN_SCALE + position * (MAX_SCALE - MIN_SCALE);
  };

  React.useEffect(() => {
    const sliderPos = getSliderPosition(initialValue);
    translateY.value = withSpring(
      (1 - sliderPos) * (SLIDER_HEIGHT - THUMB_SIZE),
    );
  }, [initialValue]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
      runOnJS(haptics.light)();
    },
    onActive: (event, ctx: any) => {
      const newY = ctx.startY + event.translationY;
      const clampedY = Math.max(0, Math.min(newY, SLIDER_HEIGHT - THUMB_SIZE));
      translateY.value = clampedY;

      // Convert position to scale value
      const position = 1 - clampedY / (SLIDER_HEIGHT - THUMB_SIZE);
      const newScale = getScaleFromPosition(position);
      scale.value = newScale;

      runOnJS(onValueChange)(newScale);
    },
    onEnd: () => {
      runOnJS(haptics.light)();
    },
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: visible ? withSpring(1) : withSpring(0),
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { scale: visible ? withSpring(1) : withSpring(0.8) },
    ],
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const trackFillStyle = useAnimatedStyle(() => {
    const fillHeight = SLIDER_HEIGHT - translateY.value - THUMB_SIZE / 2;
    return {
      height: fillHeight,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background Track */}
      <View style={styles.track}>
        {/* Fill Track */}
        <Animated.View style={[styles.trackFill, trackFillStyle]} />
      </View>

      {/* Draggable Thumb */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <View style={styles.thumbInner} />
        </Animated.View>
      </PanGestureHandler>

      {/* Size Indicator Lines */}
      <View style={styles.indicators}>
        <View style={[styles.indicator, styles.indicatorSmall]} />
        <View style={[styles.indicator, styles.indicatorMedium]} />
        <View style={[styles.indicator, styles.indicatorLarge]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    position: 'absolute',
    width: 4,
    height: SLIDER_HEIGHT,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE - 4,
    height: THUMB_SIZE - 4,
    borderRadius: (THUMB_SIZE - 4) / 2,
    backgroundColor: Colors.accent.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  indicators: {
    position: 'absolute',
    right: -12,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: THUMB_SIZE / 2,
  },
  indicator: {
    backgroundColor: Colors.text.tertiary,
    borderRadius: 1,
  },
  indicatorSmall: {
    width: 6,
    height: 2,
  },
  indicatorMedium: {
    width: 8,
    height: 2,
  },
  indicatorLarge: {
    width: 10,
    height: 2,
  },
});
