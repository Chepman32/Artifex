// Interactive sticker element on canvas

import React from 'react';
import { StyleSheet, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Colors } from '../../constants/colors';

interface StickerElementProps {
  id: string;
  uri: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  width?: number;
  height?: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
}

export const StickerElement: React.FC<StickerElementProps> = ({
  uri,
  x,
  y,
  scale = 1,
  rotation = 0,
  width = 100,
  height = 100,
  isSelected,
  onSelect,
  onUpdate,
}) => {
  const { gesture, animatedStyle } = useCanvasGestures({
    initialX: x,
    initialY: y,
    initialScale: scale,
    initialRotation: rotation,
    onUpdate,
    onSelect,
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, { width, height }, animatedStyle]}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />

        {/* Selection indicators */}
        {isSelected && <Animated.View style={styles.selectionBorder} />}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
});
