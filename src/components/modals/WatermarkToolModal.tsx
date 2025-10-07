// Watermark tool modal with template gallery and custom text watermark creator

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../stores/appStore';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

interface WatermarkToolModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (watermarkUri: string, width: number, height: number) => void;
}

type WatermarkTemplate = {
  id: string;
  uri: string;
  thumbnail: string;
  width: number;
  height: number;
  isPro: boolean;
  category: 'signature' | 'logo' | 'badge' | 'stamp';
};

type TabType = 'templates' | 'custom';

// Mock watermark templates - replace with actual assets
const WATERMARK_TEMPLATES: WatermarkTemplate[] = [
  // Free templates
  { id: 'w1', uri: 'watermark1', thumbnail: 'watermark1_thumb', width: 200, height: 60, isPro: false, category: 'signature' },
  { id: 'w2', uri: 'watermark2', thumbnail: 'watermark2_thumb', width: 180, height: 180, isPro: false, category: 'logo' },
  { id: 'w3', uri: 'watermark3', thumbnail: 'watermark3_thumb', width: 150, height: 50, isPro: false, category: 'signature' },
  { id: 'w4', uri: 'watermark4', thumbnail: 'watermark4_thumb', width: 160, height: 160, isPro: false, category: 'badge' },
  { id: 'w5', uri: 'watermark5', thumbnail: 'watermark5_thumb', width: 200, height: 70, isPro: false, category: 'signature' },
  { id: 'w6', uri: 'watermark6', thumbnail: 'watermark6_thumb', width: 140, height: 140, isPro: false, category: 'stamp' },
  { id: 'w7', uri: 'watermark7', thumbnail: 'watermark7_thumb', width: 190, height: 65, isPro: false, category: 'signature' },
  { id: 'w8', uri: 'watermark8', thumbnail: 'watermark8_thumb', width: 170, height: 170, isPro: false, category: 'logo' },
  { id: 'w9', uri: 'watermark9', thumbnail: 'watermark9_thumb', width: 180, height: 60, isPro: false, category: 'signature' },
  { id: 'w10', uri: 'watermark10', thumbnail: 'watermark10_thumb', width: 150, height: 150, isPro: false, category: 'badge' },

  // Pro templates
  { id: 'w11', uri: 'watermark11', thumbnail: 'watermark11_thumb', width: 220, height: 70, isPro: true, category: 'signature' },
  { id: 'w12', uri: 'watermark12', thumbnail: 'watermark12_thumb', width: 200, height: 200, isPro: true, category: 'logo' },
  { id: 'w13', uri: 'watermark13', thumbnail: 'watermark13_thumb', width: 190, height: 65, isPro: true, category: 'signature' },
  { id: 'w14', uri: 'watermark14', thumbnail: 'watermark14_thumb', width: 180, height: 180, isPro: true, category: 'badge' },
  { id: 'w15', uri: 'watermark15', thumbnail: 'watermark15_thumb', width: 210, height: 75, isPro: true, category: 'signature' },
  { id: 'w16', uri: 'watermark16', thumbnail: 'watermark16_thumb', width: 160, height: 160, isPro: true, category: 'stamp' },
  { id: 'w17', uri: 'watermark17', thumbnail: 'watermark17_thumb', width: 200, height: 70, isPro: true, category: 'signature' },
  { id: 'w18', uri: 'watermark18', thumbnail: 'watermark18_thumb', width: 190, height: 190, isPro: true, category: 'logo' },
  { id: 'w19', uri: 'watermark19', thumbnail: 'watermark19_thumb', width: 185, height: 65, isPro: true, category: 'signature' },
  { id: 'w20', uri: 'watermark20', thumbnail: 'watermark20_thumb', width: 170, height: 170, isPro: true, category: 'badge' },
];

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'signature', label: 'Signature' },
  { id: 'logo', label: 'Logo' },
  { id: 'badge', label: 'Badge' },
  { id: 'stamp', label: 'Stamp' },
];

export const WatermarkToolModal: React.FC<WatermarkToolModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('templates');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customText, setCustomText] = useState('');
  const [customOpacity, setCustomOpacity] = useState(0.5);

  const isProUser = useAppStore(state => state.isProUser);
  const navigation = useNavigation();

  const filteredTemplates = WATERMARK_TEMPLATES.filter(
    template =>
      selectedCategory === 'all' || template.category === selectedCategory,
  );

  const handleTemplatePress = (template: WatermarkTemplate) => {
    if (template.isPro && !isProUser) {
      navigation.navigate('Paywall' as never);
      return;
    }

    onSelect(template.uri, template.width, template.height);
    onClose();
  };

  const handleAddCustomWatermark = () => {
    if (customText.trim()) {
      // Custom text watermark will be created as a text element
      // For now, pass the text as URI (will be handled differently in canvas)
      onSelect(`text:${customText}`, 200, 40);
      onClose();
    }
  };

  const renderTemplateItem = ({ item }: { item: WatermarkTemplate }) => {
    const isLocked = item.isPro && !isProUser;

    return (
      <TouchableOpacity
        style={styles.templateItem}
        onPress={() => handleTemplatePress(item)}
        activeOpacity={0.7}>
        <View style={styles.templateImageContainer}>
          {/* Placeholder - replace with actual image */}
          <View style={styles.templateImagePlaceholder}>
            <Text style={styles.templatePlaceholderText}>WM</Text>
          </View>

          {/* Locked overlay for Pro items */}
          {isLocked && (
            <View style={styles.lockedOverlay}>
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔒</Text>
              </View>
            </View>
          )}

          {/* Pro badge */}
          {item.isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={600}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Watermark</Text>

        {/* Tab selector */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'templates' && styles.tabActive,
            ]}
            onPress={() => setSelectedTab('templates')}>
            <Text
              style={[
                styles.tabText,
                selectedTab === 'templates' && styles.tabTextActive,
              ]}>
              Templates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'custom' && styles.tabActive,
            ]}
            onPress={() => setSelectedTab('custom')}>
            <Text
              style={[
                styles.tabText,
                selectedTab === 'custom' && styles.tabTextActive,
              ]}>
              Custom Text
            </Text>
          </TouchableOpacity>
        </View>

        {/* Templates tab */}
        {selectedTab === 'templates' && (
          <>
            {/* Category pills */}
            <View style={styles.categoryContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CATEGORIES}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryPill,
                      selectedCategory === item.id && styles.categoryPillActive,
                    ]}
                    onPress={() => setSelectedCategory(item.id)}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        selectedCategory === item.id &&
                          styles.categoryPillTextActive,
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.categoryList}
              />
            </View>

            {/* Templates grid */}
            <FlatList
              data={filteredTemplates}
              keyExtractor={item => item.id}
              numColumns={3}
              renderItem={renderTemplateItem}
              contentContainerStyle={styles.templateGrid}
              showsVerticalScrollIndicator={false}
            />

            {/* Pro CTA */}
            {!isProUser && (
              <TouchableOpacity
                style={styles.proCtaButton}
                onPress={() => navigation.navigate('Paywall' as never)}>
                <Text style={styles.proCtaText}>
                  Unlock 30+ Premium Watermarks
                </Text>
                <Text style={styles.proCtaArrow}>→</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Custom text tab */}
        {selectedTab === 'custom' && (
          <View style={styles.customContainer}>
            <Text style={styles.sectionLabel}>Watermark Text</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your watermark text..."
              placeholderTextColor={Colors.text.tertiary}
              value={customText}
              onChangeText={setCustomText}
              multiline={false}
            />

            <Text style={styles.sectionLabel}>Opacity</Text>
            <View style={styles.opacityButtons}>
              {[0.3, 0.5, 0.7, 1.0].map(opacity => (
                <TouchableOpacity
                  key={opacity}
                  style={[
                    styles.opacityButton,
                    customOpacity === opacity && styles.opacityButtonActive,
                  ]}
                  onPress={() => setCustomOpacity(opacity)}>
                  <Text
                    style={[
                      styles.opacityButtonText,
                      customOpacity === opacity && styles.opacityButtonTextActive,
                    ]}>
                    {Math.round(opacity * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewBox}>
                <Text
                  style={[
                    styles.previewText,
                    { opacity: customOpacity },
                  ]}>
                  {customText || 'Your watermark'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                !customText.trim() && styles.addButtonDisabled,
              ]}
              onPress={handleAddCustomWatermark}
              disabled={!customText.trim()}>
              <Text style={styles.addButtonText}>Add Watermark</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    flex: 1,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.backgrounds.secondary,
  },
  tabActive: {
    backgroundColor: Colors.accent.gold + '15',
  },
  tabText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.accent.gold,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: Spacing.lg,
  },
  categoryList: {
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.backgrounds.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: Colors.accent.gold + '15',
    borderColor: Colors.accent.gold,
  },
  categoryPillText: {
    ...Typography.body,
    color: Colors.text.secondary,
    fontSize: 14,
  },
  categoryPillTextActive: {
    color: Colors.accent.gold,
    fontWeight: '600',
  },
  templateGrid: {
    paddingBottom: Spacing.xl,
  },
  templateItem: {
    width: (screenWidth - Spacing.xl * 2 - Spacing.md * 2) / 3,
    aspectRatio: 1,
    marginRight: Spacing.md,
    marginBottom: Spacing.md,
  },
  templateImageContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgrounds.secondary,
    position: 'relative',
  },
  templateImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgrounds.secondary,
  },
  templatePlaceholderText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: 12,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgrounds.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconText: {
    fontSize: 16,
  },
  proBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.accent.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    ...Typography.caption,
    color: Colors.backgrounds.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  proCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.gold + '15',
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.accent.gold,
  },
  proCtaText: {
    ...Typography.body,
    color: Colors.accent.gold,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  proCtaArrow: {
    fontSize: 18,
    color: Colors.accent.gold,
  },
  customContainer: {
    flex: 1,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 12,
    padding: Spacing.lg,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 56,
  },
  opacityButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  opacityButton: {
    flex: 1,
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  opacityButtonActive: {
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.accent.gold + '10',
  },
  opacityButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  opacityButtonTextActive: {
    color: Colors.accent.gold,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: Spacing.xl,
  },
  previewLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  previewBox: {
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  previewText: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  addButton: {
    backgroundColor: Colors.accent.gold,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.backgrounds.primary,
    fontWeight: '600',
  },
});
