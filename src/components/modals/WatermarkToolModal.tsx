// Watermark tool modal with preset configurations

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BottomSheet } from './BottomSheet';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { WATERMARK_PRESETS } from '../../constants/watermarkPresets';
import { WatermarkPreset } from '../../types/watermark';
import { haptics } from '../../utils/haptics';
import { formatString } from '../../localization/format';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const PRESET_WIDTH = (screenWidth - Spacing.m * 2 - Spacing.m) / GRID_COLUMNS;

const THUMB_SIZE = 24;

interface GestureSliderProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
}

const GestureSlider: React.FC<GestureSliderProps> = ({
  label,
  value,
  minValue,
  maxValue,
  onChange,
  formatValue,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isLayoutReady = React.useRef(false);

  // Calculate and update thumb position from value
  React.useEffect(() => {
    if (isLayoutReady.current && trackWidth.value > 0) {
      const normalized = (value - minValue) / (maxValue - minValue);
      thumbX.value = normalized * (trackWidth.value - THUMB_SIZE);
    }
  }, [value, minValue, maxValue]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      runOnJS(haptics.light)();
    })
    .onUpdate((event) => {
      const newX = Math.max(0, Math.min(event.x - THUMB_SIZE / 2, trackWidth.value - THUMB_SIZE));
      thumbX.value = newX;

      const normalized = newX / (trackWidth.value - THUMB_SIZE);
      const newValue = minValue + normalized * (maxValue - minValue);
      runOnJS(onChange)(newValue);
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(haptics.light)();
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillWidth = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderValue}>{formatValue(value)}</Text>
        <GestureDetector gesture={panGesture}>
          <View
            style={styles.sliderTrackContainer}
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              trackWidth.value = width;

              // Initialize thumb position on first layout
              if (!isLayoutReady.current) {
                isLayoutReady.current = true;
                const normalized = (value - minValue) / (maxValue - minValue);
                thumbX.value = normalized * (width - THUMB_SIZE);
              }
            }}
          >
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${fillWidth}%` },
                ]}
              />
            </View>
            <Animated.View style={[styles.sliderThumb, thumbStyle]} />
          </View>
        </GestureDetector>
      </View>
    </View>
  );
};

interface WatermarkToolModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyPreset: (
    preset: WatermarkPreset,
    text: string,
    settings: { opacity: number; scale: number; rotation: number },
  ) => void;
}

export const WatermarkToolModal: React.FC<WatermarkToolModalProps> = ({
  visible,
  onClose,
  onApplyPreset,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [watermarkText, setWatermarkText] = useState(t.watermark.defaultText);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  const bottomSafePadding = Math.max(insets.bottom, Spacing.s);

  // Global adjustment values
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [globalScale, setGlobalScale] = useState(1);
  const [globalRotation, setGlobalRotation] = useState(0);

  // View transition animation (0 = presets, 1 = customization)
  const viewProgress = useSharedValue(0);

  const presetsViewStyle = useAnimatedStyle(() => ({
    opacity: 1 - viewProgress.value,
    transform: [{ translateX: -viewProgress.value * 50 }],
    position: viewProgress.value === 1 ? 'absolute' : 'relative',
    pointerEvents: viewProgress.value === 1 ? 'none' : 'auto',
  }));

  const customizationViewStyle = useAnimatedStyle(() => ({
    opacity: viewProgress.value,
    transform: [{ translateX: (1 - viewProgress.value) * 50 }],
    position: viewProgress.value === 0 ? 'absolute' : 'relative',
    pointerEvents: viewProgress.value === 0 ? 'none' : 'auto',
  }));

  // Reset all state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setSelectedPresetId(null);
      setShowCustomization(false);
      setGlobalOpacity(1);
      setGlobalScale(1);
      setGlobalRotation(0);
      viewProgress.value = 0;
    }
  }, [visible]);

  // Animate view transition
  React.useEffect(() => {
    viewProgress.value = withTiming(showCustomization ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [showCustomization]);

  const filteredPresets = WATERMARK_PRESETS.filter(preset => {
    return preset.category === 'pattern';
  });
  const presetTranslations = t.watermark.presets as Record<
    string,
    { name: string; description: string }
  >;
  const densityTranslations = t.watermark.densities as Record<string, string>;
  const getPresetCopy = (preset: WatermarkPreset) =>
    presetTranslations[preset.id] || {
      name: preset.name,
      description: preset.description,
    };
  const getDensityLabel = (density: string) =>
    densityTranslations[density] || density;

  const handlePresetPress = (preset: WatermarkPreset) => {
    setSelectedPresetId(preset.id);
    setShowCustomization(true);
  };

  const handleApply = () => {
    const preset = WATERMARK_PRESETS.find(p => p.id === selectedPresetId);
    if (preset && watermarkText.trim()) {
      onApplyPreset(preset, watermarkText, {
        opacity: globalOpacity,
        scale: globalScale,
        rotation: globalRotation,
      });
      onClose();
      // Reset customization
      setShowCustomization(false);
      setSelectedPresetId(null);
      setGlobalOpacity(1);
      setGlobalScale(1);
      setGlobalRotation(0);
    }
  };

  const renderPreset = ({ item }: { item: WatermarkPreset }) => {
    const isSelected = selectedPresetId === item.id;
    const presetCopy = getPresetCopy(item);

    return (
      <TouchableOpacity
        style={[styles.presetItem, isSelected && styles.presetItemSelected]}
        onPress={() => handlePresetPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.presetPreview}>
          {/* Visual representation of pattern */}
          <View style={styles.previewPattern}>
            {item.pattern === 'grid' && (
              <>
                <View
                  style={[styles.previewDot, { top: '20%', left: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '20%', right: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '20%', left: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '20%', right: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '50%', left: '50%' }]}
                />
              </>
            )}
            {item.pattern === 'corners' && (
              <>
                <View style={[styles.previewDot, { top: 8, left: 8 }]} />
                <View style={[styles.previewDot, { top: 8, right: 8 }]} />
                <View style={[styles.previewDot, { bottom: 8, left: 8 }]} />
                <View style={[styles.previewDot, { bottom: 8, right: 8 }]} />
              </>
            )}
            {item.pattern === 'diagonal' && (
              <>
                <View
                  style={[styles.previewDot, { top: '10%', left: '10%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '35%', left: '35%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '60%', left: '60%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '10%', right: '10%' }]}
                />
              </>
            )}
            {item.pattern === 'scattered' && (
              <>
                <View
                  style={[styles.previewDot, { top: '15%', left: '25%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '40%', right: '30%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '25%', left: '35%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '65%', right: '20%' }]}
                />
              </>
            )}
            {(item.pattern === 'center' || item.pattern === 'single') && (
              <View style={[styles.previewDot, { top: '50%', left: '50%' }]} />
            )}
            {item.pattern === 'edges' && (
              <>
                <View style={[styles.previewDot, { top: 8, left: '30%' }]} />
                <View style={[styles.previewDot, { top: 8, right: '30%' }]} />
                <View style={[styles.previewDot, { bottom: 8, left: '30%' }]} />
                <View
                  style={[styles.previewDot, { bottom: 8, right: '30%' }]}
                />
                <View style={[styles.previewDot, { top: '30%', left: 8 }]} />
                <View style={[styles.previewDot, { top: '30%', right: 8 }]} />
              </>
            )}
          </View>
        </View>
        <View style={styles.presetInfo}>
          <Text style={styles.presetName}>{presetCopy.name}</Text>
          <Text style={styles.presetDescription}>{presetCopy.description}</Text>
          <View style={styles.presetMeta}>
            <Text style={styles.presetMetaText}>
              {formatString(t.watermark.markCount, { count: item.config.count })}
            </Text>
            <Text style={styles.presetMetaText}>•</Text>
            <Text style={styles.presetMetaText}>{getDensityLabel(item.density)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.85, 0.95]}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.watermark.title}</Text>

        <View style={styles.viewContainer}>
          {/* Presets View */}
          <Animated.View style={[styles.animatedView, presetsViewStyle]}>
            {/* Watermark Text Input */}
            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>{t.watermark.textLabel}</Text>
              <TextInput
                style={styles.textInput}
                value={watermarkText}
                onChangeText={setWatermarkText}
                placeholder={t.watermark.textPlaceholder}
                placeholderTextColor={theme.text.tertiary}
              />
            </View>

            {/* Preset Grid */}
            <View style={{ flex: 1 }}>
              <FlatList
                data={filteredPresets}
                renderItem={renderPreset}
                keyExtractor={item => item.id}
                numColumns={GRID_COLUMNS}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
              />
            </View>

            {/* Apply Button - shown when preset is selected */}
            {selectedPresetId && (
              <View
                style={[
                  styles.quickApplyContainer,
                  { paddingBottom: bottomSafePadding },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.quickApplyButton,
                    !watermarkText.trim() && styles.applyButtonDisabled,
                  ]}
                  onPress={handleApply}
                  disabled={!watermarkText.trim()}
                >
                  <Text style={styles.applyButtonText}>{t.watermark.apply}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Customization View */}
          <Animated.View style={[styles.animatedView, customizationViewStyle]}>
            {/* Customization Panel */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setShowCustomization(false);
                setSelectedPresetId(null);
              }}
            >
              <Text style={styles.backButtonText}>{t.watermark.backToPresets}</Text>
            </TouchableOpacity>

            {/* Watermark Text Input */}
            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>{t.watermark.textLabel}</Text>
              <TextInput
                style={styles.textInput}
                value={watermarkText}
                onChangeText={setWatermarkText}
                placeholder={t.watermark.textPlaceholder}
                placeholderTextColor={theme.text.tertiary}
              />
            </View>

            <View style={styles.customizationContent}>
              <ScrollView
                style={styles.customizationPanel}
                contentContainerStyle={[
                  styles.customizationScrollContent,
                  { paddingBottom: bottomSafePadding + Spacing.l },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionTitle}>{t.watermark.globalAdjustments}</Text>

                {/* Opacity Slider */}
                <GestureSlider
                  label={t.watermark.opacity}
                  value={globalOpacity}
                  minValue={0.1}
                  maxValue={1}
                  onChange={setGlobalOpacity}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />

                {/* Scale Slider */}
                <GestureSlider
                  label={t.watermark.size}
                  value={globalScale}
                  minValue={0.5}
                  maxValue={2}
                  onChange={setGlobalScale}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />

                {/* Rotation Slider */}
                <GestureSlider
                  label={t.watermark.rotation}
                  value={globalRotation}
                  minValue={-45}
                  maxValue={45}
                  onChange={setGlobalRotation}
                  formatValue={(v) => `${Math.round(v)}°`}
                />

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    styles.confirmButton,
                    !watermarkText.trim() && styles.applyButtonDisabled,
                  ]}
                  onPress={handleApply}
                  disabled={!watermarkText.trim()}
                >
                  <Text style={styles.applyButtonText}>
                    {t.watermark.confirmAdjustments}
                  </Text>
                </TouchableOpacity>

                {/* Preview Info */}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewInfoTitle}>{t.watermark.selectedPreset}</Text>
                  <Text style={styles.previewInfoText}>
                    {(() => {
                      const preset = WATERMARK_PRESETS.find(p => p.id === selectedPresetId);
                      return preset ? getPresetCopy(preset).name : '';
                    })()}
                  </Text>
                  <Text style={styles.previewInfoDescription}>
                    {(() => {
                      const preset = WATERMARK_PRESETS.find(p => p.id === selectedPresetId);
                      return preset ? getPresetCopy(preset).description : '';
                    })()}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </View>
    </BottomSheet>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
  },
  animatedView: {
    flex: 1,
    width: '100%',
  },
  title: {
    ...Typography.display.h3,
    color: theme.text.primary,
    marginBottom: Spacing.m,
  },
  textInputContainer: {
    marginBottom: Spacing.m,
  },
  inputLabel: {
    ...Typography.body.small,
    color: theme.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 12,
    padding: Spacing.m,
    ...Typography.body.regular,
    color: theme.text.primary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  grid: {
    paddingBottom: Spacing.l,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  presetItem: {
    width: PRESET_WIDTH,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetItemSelected: {
    borderColor: theme.accent.primary,
  },
  presetPreview: {
    height: 100,
    backgroundColor: theme.backgrounds.secondary,
    position: 'relative',
  },
  previewPattern: {
    flex: 1,
    position: 'relative',
  },
  previewDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent.primary,
    opacity: 0.6,
  },
  presetInfo: {
    padding: Spacing.m,
  },
  presetName: {
    ...Typography.body.regular,
    color: theme.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  presetDescription: {
    ...Typography.body.small,
    color: theme.text.secondary,
    marginBottom: Spacing.xs,
  },
  presetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  presetMetaText: {
    ...Typography.body.small,
    color: theme.text.tertiary,
    fontSize: 11,
  },
  backButton: {
    marginBottom: Spacing.m,
  },
  backButtonText: {
    ...Typography.body.regular,
    color: theme.accent.primary,
    fontWeight: '600',
  },
  customizationPanel: {
    flex: 1,
  },
  customizationContent: {
    flex: 1,
  },
  customizationScrollContent: {
    paddingBottom: Spacing.l,
  },
  sectionTitle: {
    ...Typography.body.regular,
    color: theme.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.m,
  },
  sliderContainer: {
    marginBottom: Spacing.l,
  },
  sliderLabel: {
    ...Typography.body.small,
    color: theme.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sliderValue: {
    ...Typography.body.small,
    color: theme.text.primary,
    width: 50,
    fontWeight: '600',
  },
  sliderTrackContainer: {
    flex: 1,
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: theme.accent.primary,
  },
  sliderThumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: theme.accent.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  previewInfo: {
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 12,
    padding: Spacing.m,
    marginTop: Spacing.m,
  },
  previewInfoTitle: {
    ...Typography.body.small,
    color: theme.text.secondary,
    marginBottom: Spacing.xs / 2,
    fontWeight: '600',
  },
  previewInfoText: {
    ...Typography.body.regular,
    color: theme.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  previewInfoDescription: {
    ...Typography.body.small,
    color: theme.text.secondary,
  },
  applyButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  confirmButton: {
    marginTop: Spacing.l,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    ...Typography.ui.button,
    color: theme.backgrounds.primary,
  },
  quickApplyContainer: {
    paddingTop: Spacing.m,
  },
  quickApplyButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  });
