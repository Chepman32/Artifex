// Sticker picker modal with free and pro assets

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentLanguage, useTranslation } from '../../hooks/useTranslation';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { STICKER_CATEGORIES, type AssetItem } from '../../constants/assets';
import { getLocalizedStickers } from '../../constants/localizedAssets';
import { useAppStore } from '../../stores/appStore';
import { triggerHaptic } from '../../utils/haptics';
import { PaywallContent } from '../PaywallContent';
import { ProBadge } from '../ProBadge';
import { refreshEntitlement } from '../../services/subscriptions';
import { hasProEntitlement, useSubscriptionStore } from '../../stores/subscriptionStore';
import { getProCopy } from '../../localization/pro';

const GRID_COLUMNS = 3;
const GRID_GAP = Spacing.xs;

type Sticker = AssetItem;
type StickerCategory = (typeof STICKER_CATEGORIES)[number];

interface StickerPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (
    stickerSource: string | ImageSourcePropType,
    width: number,
    height: number,
    assetId?: string,
  ) => void;
}

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const language = useCurrentLanguage();
  const copy = getProCopy(language);
  const entitlement = useSubscriptionStore(state => state.entitlement);
  const isPro = hasProEntitlement(entitlement);
  const [showPaywall, setShowPaywall] = useState(false);
  useEffect(() => { if (!visible) setShowPaywall(false); }, [visible]);
  const stickers = useMemo(() => getLocalizedStickers(language), [language]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const hapticsEnabled = useAppStore(state => state.preferences.hapticFeedback);
  const stickerSize = useMemo(
    () =>
      (screenWidth - Spacing.m * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
      GRID_COLUMNS,
    [screenWidth],
  );
  const styles = useMemo(
    () => createStyles(theme, stickerSize),
    [theme, stickerSize],
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const getCategoryLabel = (categoryId: string) => {
    if (categoryId === 'pro') return copy.collection;
    const labels = t.stickers.categories as Record<string, string>;
    return labels[categoryId] || categoryId;
  };

  const modalHeight = useMemo(() => {
    // Let the sheet cover most of the screen while leaving breathing room at the top
    return Math.min(screenHeight * 0.9, screenHeight - 80);
  }, [screenHeight]);

  const filteredStickers = stickers.filter(sticker => {
    if (selectedCategory === 'all') {
      return true;
    }
    return sticker.category === selectedCategory;
  });

  const getStickerItemLayout = useCallback(
    (_: ArrayLike<Sticker> | null | undefined, index: number) => ({
      length: stickerSize + GRID_GAP,
      offset: Math.floor(index / GRID_COLUMNS) * (stickerSize + GRID_GAP),
      index,
    }),
    [stickerSize],
  );

  const handleStickerPress = async (sticker: Sticker) => {
    if (sticker.isPro && !(await refreshEntitlement())) {
      setShowPaywall(true);
      return;
    }
    if (hapticsEnabled) {
      triggerHaptic('selection');
    }
    // Select the sticker - use file if available, otherwise uri
    const stickerSource = sticker.file || sticker.uri || '';
    if (sticker.isPro) {
      onSelect(stickerSource, sticker.width || 100, sticker.height || 100, sticker.id);
    } else {
      onSelect(stickerSource, sticker.width || 100, sticker.height || 100);
    }
    onClose();
  };

  const renderCategory = (category: StickerCategory) => {
    const isSelected = selectedCategory === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        testID={`sticker-category-${category.id}`}
        style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {getCategoryLabel(category.id)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSticker = ({ item }: { item: Sticker }) => {
    return (
      <TouchableOpacity
        style={styles.stickerItem}
        accessibilityRole="button"
        accessibilityLabel={item.isPro ? `${item.name}, ${copy.collection}` : item.name}
        accessibilityHint={item.isPro && !isPro ? copy.subscribe : undefined}
        testID={`asset-${item.id}`}
        onPress={() => handleStickerPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.stickerContainer}>
          <Image
            source={item.file ? item.file : { uri: item.uri }}
            style={styles.stickerImage}
            resizeMode="contain"
          />
          {item.isPro && <ProBadge locked={!isPro} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={modalHeight} dragFromHandleOnly={showPaywall}>
      {showPaywall ? <PaywallContent onClose={() => setShowPaywall(false)} onUnlocked={() => setShowPaywall(false)} /> : (
      <View style={styles.container}>
        <Text style={styles.title}>{t.stickers.title}</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {STICKER_CATEGORIES.map(category => renderCategory(category))}
        </ScrollView>

        {/* Sticker Grid */}
        <FlatList
          data={filteredStickers}
          renderItem={renderSticker}
          keyExtractor={item => item.id}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t.stickers.emptyCategory}</Text>
            </View>
          }
          getItemLayout={getStickerItemLayout}
          initialNumToRender={12}
          maxToRenderPerBatch={18}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          removeClippedSubviews
        />
      </View>
      )}
    </BottomSheet>
  );
};

const createStyles = (theme: Theme, stickerSize: number) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.display.h3,
    color: theme.text.primary,
    marginBottom: Spacing.m,
  },
  categoriesScroll: {
    marginBottom: Spacing.m,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.l,
    paddingLeft: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: Spacing.s,
    marginVertical: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  categoryPillSelected: {
    backgroundColor: theme.backgrounds.primary,
    borderColor: theme.accent.primary,
  },
  categoryText: {
    ...Typography.body.regular,
    color: theme.text.secondary,
    fontWeight: '600',
    lineHeight: Typography.body.regular.lineHeight,
    textAlign: 'center',
    flexShrink: 0,
    paddingTop: 2,
    paddingBottom: 2,
  },
  categoryTextSelected: {
    color: theme.accent.primary,
    fontWeight: '600',
  },
  grid: {
    paddingBottom: Spacing.l,
  },
  stickerItem: {
    width: stickerSize,
    height: stickerSize,
    padding: GRID_GAP / 2,
  },
  stickerContainer: {
    flex: 1,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  stickerImageLocked: {
    opacity: 0.4,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgrounds.overlay,
  },
  crownBadge: {
    width: 32,
    height: 32,
    backgroundColor: theme.accent.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownIcon: {
    fontSize: 18,
  },
  emptyState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body.regular,
    color: theme.text.tertiary,
    textAlign: 'center',
  },
  proButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  proButtonText: {
    ...Typography.ui.button,
    color: theme.backgrounds.primary,
  },
  });
