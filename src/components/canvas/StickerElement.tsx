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
  onUpdate: (transform: { x: number; y: number; scale: number; rotation: number }) => void;
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
        style={[
          styles.container,
          { width, height },
          animatedStyle,
        ]}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Selection indicators */}
        {isSelected && (
          <>
            <Animated.View style={styles.selectionBorder} />
            <Animated.View style={[styles.handle, styles.handleTopLeft]} />
            <Animated.View style={[styles.handle, styles.handleTopRight]} />
            <Animated.View style={[styles.handle, styles.handleBottomLeft]} />
            <Animated.View style={[styles.handle, styles.handleBottomRight]} />
          </>
        )}
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
  handle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent.primary,
    borderWidth: 2,
    borderColor: Colors.backgrounds.primary,
  },
  handleTopLeft: {
    top: -6,
    left: -6,
  },
  handleTopRight: {
    top: -6,
    right: -6,
  },
  handleBottomLeft: {
    bottom: -6,
    left: -6,
  },
  handleBottomRight: {
    bottom: -6,
    right: -6,
  },
});
