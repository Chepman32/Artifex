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
  onUpdate: (transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
  onEdit?: () => void;
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
  onEdit,
}) => {
  const { gesture, animatedStyle } = useCanvasGestures({
    initialX: x,
    initialY: y,
    initialScale: scale,
    initialRotation: rotation,
    onUpdate,
    onSelect,
    onEdit,
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
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
});
