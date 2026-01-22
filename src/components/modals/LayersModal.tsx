// Layers modal for managing canvas elements

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useEditorStore } from '../../stores/editorStore';
import { shallow } from 'zustand/shallow';
import { CanvasElement } from '../../types';
import { formatString } from '../../localization/format';
import type { Translations } from '../../localization/translations';

// Import toolbar icons
const stickerIcon = require('../../assets/icons/toolbar/sticker.png');
const stampIcon = require('../../assets/icons/toolbar/2471542.png');
const watermarkIcon = require('../../assets/icons/toolbar/watermark.png');

interface LayersModalProps {
  visible: boolean;
  onClose: () => void;
}

const getElementIcon = (type: CanvasElement['type']): { type: 'emoji' | 'image'; value: string | any } => {
  switch (type) {
    case 'text':
      return { type: 'emoji', value: '📝' };
    case 'sticker':
      return { type: 'image', value: stickerIcon };
    case 'watermark':
      return { type: 'image', value: watermarkIcon };
    case 'stamp':
      return { type: 'image', value: stampIcon };
    default:
      return { type: 'emoji', value: '📄' };
  }
};

const getElementName = (element: CanvasElement, t: Translations) => {
  switch (element.type) {
    case 'text':
      return element.textContent || t.layers.elementTypes.text;
    case 'sticker':
    case 'watermark':
    case 'stamp':
      return t.layers.elementTypes[element.type];
    default:
      return t.layers.elementTypes.element;
  }
};

const getElementTypeLabel = (
  type: CanvasElement['type'],
  t: Translations,
) => {
  if (type === 'text' || type === 'sticker' || type === 'watermark' || type === 'stamp') {
    return t.layers.elementTypes[type];
  }

  return t.layers.elementTypes.element;
};

export const LayersModal: React.FC<LayersModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { canvasElements, selectedElementIds } = useEditorStore(
    state => ({
      canvasElements: state.canvasElements,
      selectedElementIds: state.selectedElementIds,
    }),
    shallow,
  );
  const {
    selectElement,
    updateElement,
    deleteElement,
    moveElementUp,
    moveElementDown,
  } = useEditorStore(
    state => ({
      selectElement: state.selectElement,
      updateElement: state.updateElement,
      deleteElement: state.deleteElement,
      moveElementUp: state.moveElementUp,
      moveElementDown: state.moveElementDown,
    }),
    shallow,
  );
  const layerCountLabel =
    canvasElements.length === 1
      ? t.layers.layerCountSingle
      : formatString(t.layers.layerCountMultiple, { count: canvasElements.length });

  // Sort elements by z-index (top to bottom in layers panel)
  const sortedElements = useMemo(
    () => [...canvasElements].reverse(),
    [canvasElements],
  );

  const handleElementSelect = (elementId: string) => {
    selectElement(elementId);
  };

  const handleElementDelete = (elementId: string) => {
    deleteElement(elementId);
  };

  const handleVisibilityToggle = (elementId: string) => {
    const element = canvasElements.find(el => el.id === elementId);
    if (element) {
      const newOpacity = (element.opacity ?? 1) > 0 ? 0 : 1;
      updateElement(elementId, { opacity: newOpacity });
    }
  };

  const handleMoveElementUp = (elementId: string) => {
    moveElementUp(elementId);
  };

  const handleMoveElementDown = (elementId: string) => {
    moveElementDown(elementId);
  };

  const renderLayerItem = ({
    item,
    index,
  }: {
    item: CanvasElement;
    index: number;
  }) => {
    const isSelected = selectedElementIds.includes(item.id);
    const isVisible = (item.opacity ?? 1) > 0;
    const canMoveUp = index > 0;
    const canMoveDown = index < sortedElements.length - 1;

    return (
      <TouchableOpacity
        style={[styles.layerItem, isSelected && styles.layerItemSelected]}
        onPress={() => handleElementSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.layerContent}>
          {/* Element Icon */}
          <View style={styles.elementIconContainer}>
            {(() => {
              const icon = getElementIcon(item.type);
              if (icon.type === 'emoji') {
                return <Text style={styles.elementIcon}>{icon.value}</Text>;
              } else {
                return (
                  <Image
                    source={icon.value}
                    style={styles.elementIconImage}
                    resizeMode="contain"
                  />
                );
              }
            })()}
          </View>

          {/* Element Info */}
          <View style={styles.elementInfo}>
            <Text
              style={[
                styles.elementName,
                !isVisible && styles.elementNameHidden,
              ]}
            >
              {getElementName(item, t)}
            </Text>
            <Text style={styles.elementType}>{getElementTypeLabel(item.type, t)}</Text>
          </View>

          {/* Layer Controls */}
          <View style={styles.layerControls}>
            {/* Visibility Toggle */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleVisibilityToggle(item.id)}
            >
              <Text style={styles.controlIcon}>{isVisible ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>

            {/* Move Up */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !canMoveUp && styles.controlButtonDisabled,
              ]}
              onPress={() => handleMoveElementUp(item.id)}
              disabled={!canMoveUp}
            >
              <Text
                style={[
                  styles.controlIcon,
                  !canMoveUp && styles.controlIconDisabled,
                ]}
              >
                ⬆️
              </Text>
            </TouchableOpacity>

            {/* Move Down */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !canMoveDown && styles.controlButtonDisabled,
              ]}
              onPress={() => handleMoveElementDown(item.id)}
              disabled={!canMoveDown}
            >
              <Text
                style={[
                  styles.controlIcon,
                  !canMoveDown && styles.controlIconDisabled,
                ]}
              >
                ⬇️
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleElementDelete(item.id)}
            >
              <Text style={styles.controlIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.6, 0.8]}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.layers.title}</Text>

        {canvasElements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📄</Text>
            <Text style={styles.emptyStateText}>{t.layers.emptyTitle}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t.layers.emptySubtitle}
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedElements}
            renderItem={renderLayerItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.layersList}
            showsVerticalScrollIndicator={false}
            style={styles.layersContainer}
          />
        )}

        {/* Layer Count */}
        {canvasElements.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.layerCount}>{layerCountLabel}</Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.display.h3,
    color: theme.text.primary,
    marginBottom: Spacing.m,
  },
  layersContainer: {
    flex: 1,
    maxHeight: 400,
  },
  layersList: {
    paddingBottom: Spacing.m,
  },
  layerItem: {
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 12,
    marginBottom: Spacing.s,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  layerItemSelected: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.backgrounds.primary,
  },
  layerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  elementIconContainer: {
    width: 32,
    height: 32,
    marginRight: Spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementIcon: {
    fontSize: 24,
  },
  elementIconImage: {
    width: 28,
    height: 28,
  },
  elementInfo: {
    flex: 1,
  },
  elementName: {
    ...Typography.body.regular,
    color: theme.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  elementNameHidden: {
    opacity: 0.5,
  },
  elementType: {
    ...Typography.body.caption,
    color: theme.text.secondary,
    textTransform: 'capitalize',
  },
  layerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.backgrounds.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlIcon: {
    fontSize: 14,
  },
  controlIconDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.m,
  },
  emptyStateText: {
    ...Typography.body.regular,
    color: theme.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.body.small,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  footer: {
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.backgrounds.tertiary,
    alignItems: 'center',
  },
  layerCount: {
    ...Typography.body.caption,
    color: theme.text.secondary,
  },
  });
