// Filter tool modal with Skia shader effects

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  useWindowDimensions,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../stores/appStore';
import { triggerHaptic } from '../../utils/haptics';

const FILTER_COLUMNS = 3;

// Get preview style for different filters
const getFilterPreviewStyle = (filterId: string) => {
  switch (filterId) {
    case 'bw':
      return { backgroundColor: '#888888' };
    case 'sepia':
      return { backgroundColor: '#D2B48C' };
    case 'vintage':
      return { backgroundColor: '#F4A460' };
    case 'cool':
      return { backgroundColor: '#87CEEB' };
    case 'warm':
      return { backgroundColor: '#FFB347' };
    case 'cinematic':
      return { backgroundColor: '#2F4F4F' };
    case 'film':
      return { backgroundColor: '#696969' };
    case 'hdr':
      return { backgroundColor: '#FFD700' };
    case 'portrait':
      return { backgroundColor: '#DDA0DD' };
    case 'landscape':
      return { backgroundColor: '#98FB98' };
    case 'neon':
      return { backgroundColor: '#FF1493' };
    case 'cyberpunk':
      return { backgroundColor: '#00FFFF' };
    case 'retro':
      return { backgroundColor: '#FF69B4' };
    default:
      return {};
  }
};

interface Filter {
  id: string;
  preview: string; // Base64 or URI for preview
  isPro: boolean;
  intensity?: number; // 0-1
}

// Mock filter data - would be replaced with actual Skia shader implementations
const FILTERS: Filter[] = [
  // Free filters
  { id: 'none', preview: '', isPro: false },
  { id: 'bw', preview: '', isPro: false },
  { id: 'sepia', preview: '', isPro: false },
  { id: 'vintage', preview: '', isPro: false },
  { id: 'cool', preview: '', isPro: false },
  { id: 'warm', preview: '', isPro: false },

  // Pro filters
  { id: 'cinematic', preview: '', isPro: true },
  { id: 'film', preview: '', isPro: true },
  { id: 'hdr', preview: '', isPro: true },
  { id: 'portrait', preview: '', isPro: true },
  { id: 'landscape', preview: '', isPro: true },
  { id: 'neon', preview: '', isPro: true },
  { id: 'cyberpunk', preview: '', isPro: true },
  { id: 'retro', preview: '', isPro: true },
];

interface FilterToolModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filterId: string, intensity: number) => void;
}

export const FilterToolModal: React.FC<FilterToolModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const hapticsEnabled = useAppStore(state => state.preferences.hapticFeedback);
  const filterSize = useMemo(
    () => (screenWidth - Spacing.m * 2 - Spacing.s * 2) / FILTER_COLUMNS,
    [screenWidth],
  );
  const styles = useMemo(() => createStyles(theme, filterSize), [theme, filterSize]);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [intensity, setIntensity] = useState<number>(1.0);

  const availableFilters = FILTERS;
  const getFilterName = (filterId: string) => {
    const names = t.filters.names as Record<string, string>;
    return names[filterId] || filterId;
  };

  const handleFilterPress = (filter: Filter) => {
    if (hapticsEnabled) {
      triggerHaptic('selection');
    }
    setSelectedFilter(filter.id);
  };

  const handleApply = () => {
    onApply(selectedFilter, intensity);
    onClose();
  };

  const renderFilter = ({ item }: { item: Filter }) => {
    const isSelected = selectedFilter === item.id;
    const displayName = getFilterName(item.id);

    return (
      <TouchableOpacity
        style={[styles.filterItem, isSelected && styles.filterItemSelected]}
        onPress={() => handleFilterPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.filterPreview}>
          {/* Filter preview with color indication */}
          <View
            style={[
              styles.previewPlaceholder,
              getFilterPreviewStyle(item.id),
            ]}
          >
            <Text style={styles.previewText}>{displayName.charAt(0)}</Text>
          </View>
        </View>

        <Text
          style={[styles.filterName, isSelected && styles.filterNameSelected]}
        >
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderIntensityButton = (value: number, label: string) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.intensityButton,
        intensity === value && styles.intensityButtonActive,
      ]}
      onPress={() => setIntensity(value)}
    >
      <Text
        style={[
          styles.intensityButtonText,
          intensity === value && styles.intensityButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.7, 0.9]}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.filters.title}</Text>

        {/* Filter Grid */}
        <FlatList
          data={availableFilters}
          renderItem={renderFilter}
          keyExtractor={item => item.id}
          numColumns={FILTER_COLUMNS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          style={styles.filterList}
        />

        {/* Intensity Control */}
        {selectedFilter !== 'none' && (
          <View style={styles.intensitySection}>
            <Text style={styles.sectionLabel}>{t.filters.intensity}</Text>
            <View style={styles.intensityButtons}>
              {renderIntensityButton(0.3, '30%')}
              {renderIntensityButton(0.5, '50%')}
              {renderIntensityButton(0.7, '70%')}
              {renderIntensityButton(1.0, '100%')}
            </View>
          </View>
        )}

        {/* Apply Button */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>{t.filters.apply}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const createStyles = (theme: Theme, filterSize: number) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.display.h3,
    color: theme.text.primary,
    marginBottom: Spacing.m,
  },
  filterList: {
    maxHeight: 300,
  },
  grid: {
    paddingBottom: Spacing.m,
  },
  filterItem: {
    width: filterSize,
    marginRight: Spacing.s,
    marginBottom: Spacing.m,
    alignItems: 'center',
  },
  filterItemSelected: {
    // Selection handled by border on preview
  },
  filterPreview: {
    width: filterSize - 10,
    height: filterSize - 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  previewPlaceholder: {
    flex: 1,
    backgroundColor: theme.backgrounds.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewPlaceholderLocked: {
    opacity: 0.4,
  },
  previewText: {
    ...Typography.body.regular,
    color: theme.text.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.backgrounds.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.backgrounds.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 14,
  },
  proBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.accent.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    ...Typography.body.caption,
    color: theme.backgrounds.primary,
    fontSize: 8,
    fontWeight: '700',
  },
  filterName: {
    ...Typography.body.small,
    color: theme.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },
  filterNameSelected: {
    color: theme.accent.primary,
    fontWeight: '600',
  },
  intensitySection: {
    marginTop: Spacing.m,
    marginBottom: Spacing.m,
  },
  sectionLabel: {
    ...Typography.body.caption,
    color: theme.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.s,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  intensityButton: {
    flex: 1,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 8,
    paddingVertical: Spacing.s,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intensityButtonActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.backgrounds.primary,
  },
  intensityButtonText: {
    ...Typography.body.small,
    color: theme.text.secondary,
  },
  intensityButtonTextActive: {
    color: theme.accent.primary,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  applyButtonText: {
    ...Typography.ui.button,
    color: theme.backgrounds.primary,
  },
  proButton: {
    backgroundColor: theme.accent.primary + '15',
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.s,
    borderWidth: 1,
    borderColor: theme.accent.primary,
  },
  proButtonText: {
    ...Typography.body.regular,
    color: theme.accent.primary,
    fontWeight: '600',
  },
  });
