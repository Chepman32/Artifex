// Interactive text element on canvas

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface TextElementProps {
  id: string;
  text: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (transform: { x: number; y: number; scale: number; rotation: number }) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  text,
  x,
  y,
  scale = 1,
  rotation = 0,
  fontSize = 24,
  fontFamily = 'System',
  color = Colors.text.primary,
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
          animatedStyle,
          isSelected && styles.selected,
        ]}
      >
        <Animated.Text
          style={[
            styles.text,
            {
              fontSize,
              fontFamily,
              color,
            },
          ]}
        >
          {text}
        </Animated.Text>

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
  text: {
    ...Typography.body.regular,
    textAlign: 'center',
  },
  selected: {
    // Selected state handled by border overlay
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
