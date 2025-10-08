// Main interactive canvas component using Skia for high-performance rendering

import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useEditorStore } from '../stores/editorStore';
import { TextElement } from './canvas/TextElement';
import { StickerElement } from './canvas/StickerElement';
import { Colors } from '../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

// CSS-like filter styles for regular Image component (photo library URIs)
const getImageFilterStyle = (filter: any) => {
  const intensity = Math.round(filter.intensity * 100) / 100; // Round to 2 decimal places

  // Round alpha values to avoid precision issues
  const roundAlpha = (alpha: number) => Math.round(alpha * 100) / 100;

  switch (filter.type) {
    case 'bw':
      return {
        backgroundColor: `rgba(128, 128, 128, ${roundAlpha(intensity * 0.5)})`,
      };
    case 'sepia':
      return {
        backgroundColor: `rgba(210, 180, 140, ${roundAlpha(intensity * 0.4)})`,
      };
    case 'vintage':
      return {
        backgroundColor: `rgba(244, 164, 96, ${roundAlpha(intensity * 0.35)})`,
      };
    case 'cool':
      return {
        backgroundColor: `rgba(135, 206, 235, ${roundAlpha(intensity * 0.3)})`,
      };
    case 'warm':
      return {
        backgroundColor: `rgba(255, 179, 71, ${roundAlpha(intensity * 0.35)})`,
      };
    default:
      return {};
  }
};

interface SkiaCanvasProps {
  sourceImageUri: string;
  canvasWidth: number;
  canvasHeight: number;
  onTextEdit?: (elementId: string, currentText: string) => void;
}

export const SkiaCanvas: React.FC<SkiaCanvasProps> = ({
  sourceImageUri,
  canvasWidth,
  canvasHeight,
  onTextEdit,
}) => {
  const {
    canvasElements,
    selectedElementId,
    appliedFilter,
    selectElement,
    updateElement,
    deselectElement,
  } = useEditorStore();

  // Load source image for Skia rendering
  const sourceImage = useImage(sourceImageUri);

  // Handle tap outside to deselect
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(deselectElement)();
  });

  const handleElementSelect = useCallback(
    (elementId: string) => {
      selectElement(elementId);
    },
    [selectElement],
  );

  const handleElementUpdate = useCallback(
    (
      elementId: string,
      transform: { x: number; y: number; scale: number; rotation: number },
    ) => {
      updateElement(elementId, {
        position: { x: transform.x, y: transform.y },
        scale: transform.scale,
        rotation: transform.rotation,
      });
    },
    [updateElement],
  );

  return (
    <View
      style={[styles.container, { width: canvasWidth, height: canvasHeight }]}
    >
      {/* Background image layer with filter overlay */}
      {sourceImageUri.startsWith('ph://') ? (
        <View
          style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <Image
            source={{ uri: sourceImageUri }}
            style={[
              styles.backgroundImage,
              { width: canvasWidth, height: canvasHeight },
            ]}
            resizeMode="contain"
          />
          {/* Filter overlay positioned exactly over the image */}
          {appliedFilter && appliedFilter.type !== 'none' && (
            <View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  zIndex: 1,
                },
                getImageFilterStyle(appliedFilter),
              ]}
            />
          )}
        </View>
      ) : (
        <View
          style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <Canvas
            style={[
              styles.skiaCanvas,
              { width: canvasWidth, height: canvasHeight },
            ]}
          >
            {sourceImage && (
              <SkiaImage
                image={sourceImage}
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fit="contain"
              />
            )}
          </Canvas>
          {/* Filter overlay positioned exactly over the canvas */}
          {appliedFilter && appliedFilter.type !== 'none' && (
            <View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  zIndex: 1,
                },
                getImageFilterStyle(appliedFilter),
              ]}
            />
          )}
        </View>
      )}

      {/* Interactive overlay for canvas elements */}
      <GestureDetector gesture={tapGesture}>
        <View style={styles.overlay}>
          {canvasElements.map(element => {
            if (element.type === 'text') {
              return (
                <TextElement
                  key={element.id}
                  id={element.id}
                  text={element.textContent || 'Text'}
                  x={element.position.x}
                  y={element.position.y}
                  scale={element.scale}
                  rotation={element.rotation}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily}
                  color={element.color}
                  isSelected={element.id === selectedElementId}
                  onSelect={() => handleElementSelect(element.id)}
                  onUpdate={transform =>
                    handleElementUpdate(element.id, transform)
                  }
                  onEdit={() =>
                    onTextEdit?.(element.id, element.textContent || '')
                  }
                />
              );
            }

            if (element.type === 'sticker') {
              return (
                <StickerElement
                  key={element.id}
                  id={element.id}
                  uri={element.assetPath || ''}
                  x={element.position.x}
                  y={element.position.y}
                  scale={element.scale}
                  rotation={element.rotation}
                  width={element.width}
                  height={element.height}
                  isSelected={element.id === selectedElementId}
                  onSelect={() => handleElementSelect(element.id)}
                  onUpdate={transform =>
                    handleElementUpdate(element.id, transform)
                  }
                />
              );
            }

            // Handle other element types (watermark, stamp)
            if (element.type === 'watermark' || element.type === 'stamp') {
              return (
                <StickerElement
                  key={element.id}
                  id={element.id}
                  uri={element.assetPath || ''}
                  x={element.position.x}
                  y={element.position.y}
                  scale={element.scale}
                  rotation={element.rotation}
                  width={element.width}
                  height={element.height}
                  isSelected={element.id === selectedElementId}
                  onSelect={() => handleElementSelect(element.id)}
                  onUpdate={transform =>
                    handleElementUpdate(element.id, transform)
                  }
                />
              );
            }

            return null;
          })}
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  skiaCanvas: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // Above everything to ensure visibility
  },
});
