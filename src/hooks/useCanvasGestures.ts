// Hook for managing canvas element gestures (pinch, rotate, drag)

import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { haptics } from '../utils/haptics';

interface UseCanvasGesturesProps {
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  initialRotation?: number;
  onUpdate?: (transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
  onSelect?: () => void;
}

export const useCanvasGestures = ({
  initialX = 0,
  initialY = 0,
  initialScale = 1,
  initialRotation = 0,
  onUpdate,
  onSelect,
}: UseCanvasGesturesProps) => {
  // Transform state
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(initialScale);
  const rotation = useSharedValue(initialRotation);

  // Gesture context for multi-touch
  const savedTranslateX = useSharedValue(initialX);
  const savedTranslateY = useSharedValue(initialY);
  const savedScale = useSharedValue(initialScale);
  const savedRotation = useSharedValue(initialRotation);

  // Snap threshold for alignment guides
  const SNAP_THRESHOLD = 10;

  const triggerHaptic = () => {
    haptics.snap();
  };

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      if (onSelect) {
        runOnJS(onSelect)();
      }
    })
    .onUpdate(event => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      if (onUpdate) {
        runOnJS(onUpdate)({
          x: translateX.value,
          y: translateY.value,
          scale: scale.value,
          rotation: rotation.value,
        });
      }
    });

  // Pinch gesture for scaling
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate(event => {
      const newScale = savedScale.value * event.scale;
      // Constrain scale between 0.1 and 5
      scale.value = Math.min(Math.max(newScale, 0.1), 5);
    })
    .onEnd(() => {
      if (onUpdate) {
        runOnJS(onUpdate)({
          x: translateX.value,
          y: translateY.value,
          scale: scale.value,
          rotation: rotation.value,
        });
      }
    });

  // Rotation gesture
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate(event => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      // Snap to 45-degree intervals if close
      const degrees = (rotation.value * 180) / Math.PI;
      const nearestSnap = Math.round(degrees / 45) * 45;
      const snapRadians = (nearestSnap * Math.PI) / 180;

      if (Math.abs(degrees - nearestSnap) < 5) {
        rotation.value = withSpring(snapRadians);
        runOnJS(triggerHaptic)();
      }

      if (onUpdate) {
        runOnJS(onUpdate)({
          x: translateX.value,
          y: translateY.value,
          scale: scale.value,
          rotation: rotation.value,
        });
      }
    });

  // Combine all gestures
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotationGesture,
  );

  // Animated style for the element
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  // Methods to update transforms programmatically
  const setPosition = (x: number, y: number) => {
    translateX.value = withSpring(x);
    translateY.value = withSpring(y);
  };

  const setScale = (newScale: number) => {
    scale.value = withSpring(Math.min(Math.max(newScale, 0.1), 5));
  };

  const setRotation = (degrees: number) => {
    rotation.value = withSpring((degrees * Math.PI) / 180);
  };

  const reset = () => {
    translateX.value = withSpring(initialX);
    translateY.value = withSpring(initialY);
    scale.value = withSpring(initialScale);
    rotation.value = withSpring(initialRotation);
  };

  return {
    gesture: composedGesture,
    animatedStyle,
    setPosition,
    setScale,
    setRotation,
    reset,
    // Current values (for reading)
    getTransform: () => ({
      x: translateX.value,
      y: translateY.value,
      scale: scale.value,
      rotation: rotation.value,
    }),
  };
};
