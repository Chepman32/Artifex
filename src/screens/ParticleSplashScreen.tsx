import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Atlas, Canvas, Group, Skia, useImage } from '@shopify/react-native-skia';
import { Theme } from '../constants/themes';
import { useTheme } from '../hooks/useTheme';

const ICON_SRC_SIZE = 1024;
const COLS = 20;
const ROWS = 25;
const COUNT = COLS * ROWS;

type ParticlePoint = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

function lerp(a: number, b: number, t: number) {
  'worklet';
  return a + (b - a) * t;
}

function clamp01(v: number) {
  'worklet';
  return Math.max(0, Math.min(1, v));
}

const ParticleSplashScreen: React.FC = () => {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, screenWidth, screenHeight),
    [theme, screenWidth, screenHeight],
  );
  const icon = useImage(require('../assets/icons/appIcon.png'));

  const progressRaw = useSharedValue(0);
  const progress30 = useSharedValue(0);
  const zoomRaw = useSharedValue(1);
  const zoom30 = useSharedValue(1);

  const groupTransform = useSharedValue([
    { translateX: screenWidth / 2 },
    { translateY: screenHeight / 2 },
    { scale: 1 },
    { translateX: -(screenWidth / 2) },
    { translateY: -(screenHeight / 2) },
  ]);

  const iconTargetSize = Math.min(screenWidth, screenHeight) * 0.55;
  const baseScale = iconTargetSize / ICON_SRC_SIZE;

  const tileW = ICON_SRC_SIZE / COLS;
  const tileH = ICON_SRC_SIZE / ROWS;
  const destTileW = tileW * baseScale;
  const destTileH = tileH * baseScale;

  const sprites = useMemo(() => {
    const out = new Array(COUNT);
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        out[i] = Skia.XYWHRect(c * tileW, r * tileH, tileW, tileH);
        i++;
      }
    }
    return out;
  }, [tileW, tileH]);

  const particlePoints = useMemo<ParticlePoint[]>(() => {
    const cx = screenWidth / 2;
    const cy = screenHeight / 2;

    const iconLeft = cx - iconTargetSize / 2;
    const iconTop = cy - iconTargetSize / 2;

    const margin = Math.max(screenWidth, screenHeight) * 0.25;

    const out: ParticlePoint[] = new Array(COUNT);

    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const endX = iconLeft + c * destTileW;
        const endY = iconTop + r * destTileH;

        const startX = Math.random() * (screenWidth + margin * 2) - margin;
        const startY = Math.random() * (screenHeight + margin * 2) - margin;

        out[i] = { startX, startY, endX, endY };
        i++;
      }
    }
    return out;
  }, [iconTargetSize, destTileW, destTileH, screenWidth, screenHeight]);

  const transforms = useSharedValue(
    new Array(COUNT).fill(0).map(() => Skia.RSXform(baseScale, 0, 0, 0))
  );

  useEffect(() => {
    progressRaw.value = 0;
    zoomRaw.value = 1;

    progressRaw.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    const t = setTimeout(() => {
      zoomRaw.value = withTiming(3, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, 1000);

    return () => clearTimeout(t);
  }, [progressRaw, zoomRaw]);

  const acc = useSharedValue(0);

  useFrameCallback((frame) => {
    'worklet';

    const dtMs = frame.timeSincePreviousFrame ?? 16.67;
    acc.value += dtMs;

    if (acc.value < 33.33) return;
    acc.value = acc.value % 33.33;

    const p = clamp01(progressRaw.value);
    const z = Math.max(0.0001, zoomRaw.value);

    progress30.value = p;
    zoom30.value = z;

    // Update the group transform with the current zoom value
    const cx = screenWidth / 2;
    const cy = screenHeight / 2;
    groupTransform.value = [
      { translateX: cx },
      { translateY: cy },
      { scale: z },
      { translateX: -cx },
      { translateY: -cy },
    ];

    const next = new Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const pt = particlePoints[i];
      const x = lerp(pt.startX, pt.endX, p);
      const y = lerp(pt.startY, pt.endY, p);
      next[i] = Skia.RSXform(baseScale, 0, x, y);
    }

    transforms.value = next;
  });

  if (!icon) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Group transform={groupTransform}>
          <Atlas image={icon} sprites={sprites} transforms={transforms} />
        </Group>
      </Canvas>
    </View>
  );
};

const createStyles = (theme: Theme, width: number, height: number) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgrounds.primary,
  },
  canvas: {
    width,
    height,
  },
  });

export default ParticleSplashScreen;
