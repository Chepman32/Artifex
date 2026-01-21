// Text Toolbar - Additional toolbar for text styling options

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Theme } from '../constants/themes';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Spacing } from '../constants/spacing';

interface TextToolbarProps {
  onFontSelect: (fontFamily: string) => void;
  onColorSelect: (color: string) => void;
  onEffectSelect: (effect: string) => void;
  onBackgroundSelect: (background: string | null) => void;
  selectedFont?: string;
  selectedColor?: string;
  selectedEffect?: string;
  selectedBackground?: string | null;
}

export const TextToolbar: React.FC<TextToolbarProps> = ({
  onFontSelect,
  onColorSelect,
  onEffectSelect,
  onBackgroundSelect,
  selectedFont = 'System',
  selectedColor = '#FFFFFF',
  selectedEffect = 'none',
  selectedBackground = null,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<
    'font' | 'color' | 'effect' | 'background'
  >('font');
  const fonts = useMemo(
    () => [
      { id: 'System', name: t.textToolbar.fonts.system, family: 'System' },
      {
        id: 'ArchivoBlack',
        name: t.textToolbar.fonts.archivo,
        family: 'ArchivoBlack-Regular',
      },
      {
        id: 'BitcountInk',
        name: t.textToolbar.fonts.bitcount,
        family: 'BitcountInk',
      },
      {
        id: 'FiraSans',
        name: t.textToolbar.fonts.firaSans,
        family: 'FiraSans-Regular',
      },
      {
        id: 'HomemadeApple',
        name: t.textToolbar.fonts.homemade,
        family: 'HomemadeApple-Regular',
      },
    ],
    [t],
  );
  const textColors = useMemo(
    () => [
      { id: 'white', color: '#FFFFFF', name: t.textToolbar.colors.white },
      { id: 'black', color: '#000000', name: t.textToolbar.colors.black },
      { id: 'red', color: '#FF3B30', name: t.textToolbar.colors.red },
      { id: 'orange', color: '#FF9500', name: t.textToolbar.colors.orange },
      { id: 'yellow', color: '#FFCC00', name: t.textToolbar.colors.yellow },
      { id: 'green', color: '#34C759', name: t.textToolbar.colors.green },
      { id: 'blue', color: '#007AFF', name: t.textToolbar.colors.blue },
      { id: 'purple', color: '#AF52DE', name: t.textToolbar.colors.purple },
      { id: 'pink', color: '#FF2D55', name: t.textToolbar.colors.pink },
    ],
    [t],
  );
  const textEffects = useMemo(
    () => [
      { id: 'none', name: t.textToolbar.effects.none, icon: '//A' },
      { id: 'neon', name: t.textToolbar.effects.neon, icon: '✨' },
      { id: 'glow', name: t.textToolbar.effects.glow, icon: '💫' },
      { id: 'shadow', name: t.textToolbar.effects.shadow, icon: '🌑' },
      { id: 'outline', name: t.textToolbar.effects.outline, icon: '⭕' },
    ],
    [t],
  );
  const textBackgrounds = useMemo(
    () => [
      { id: 'none', name: t.textToolbar.backgrounds.none, color: null },
      { id: 'black', name: t.textToolbar.backgrounds.black, color: '#000000' },
      { id: 'white', name: t.textToolbar.backgrounds.white, color: '#FFFFFF' },
      { id: 'gray', name: t.textToolbar.backgrounds.gray, color: '#8E8E93' },
      { id: 'red', name: t.textToolbar.backgrounds.red, color: '#FF3B30' },
      { id: 'blue', name: t.textToolbar.backgrounds.blue, color: '#007AFF' },
    ],
    [t],
  );

  return (
    <View style={styles.container}>
      {/* Tab buttons */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'font' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('font')}
        >
          <Text style={styles.tabIcon}>Aa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'color' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('color')}
        >
          <View style={styles.colorIcon}>
            <View
              style={[
                styles.colorIconInner,
                { backgroundColor: selectedColor },
              ]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'effect' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('effect')}
        >
          <Text style={styles.tabIcon}>//A</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'background' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('background')}
        >
          <View style={styles.bgIcon}>
            <Text style={styles.bgIconText}>A</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'font' && (
          <>
            {fonts.map(font => (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.optionButton,
                  selectedFont === font.family && styles.optionButtonActive,
                ]}
                onPress={() => onFontSelect(font.family)}
                activeOpacity={0.7}
              >
                <Text style={[styles.fontPreview, { fontFamily: font.family }]}>
                  Aa
                </Text>
                <Text style={styles.optionLabel}>{font.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'color' && (
          <>
            {textColors.map(colorItem => (
              <TouchableOpacity
                key={colorItem.id}
                style={[
                  styles.colorButton,
                  selectedColor === colorItem.color && styles.colorButtonActive,
                ]}
                onPress={() => onColorSelect(colorItem.color)}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: colorItem.color },
                    colorItem.color === '#FFFFFF' && styles.colorSwatchBorder,
                  ]}
                />
                <Text style={styles.optionLabel}>{colorItem.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'effect' && (
          <>
            {textEffects.map(effect => (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.optionButton,
                  selectedEffect === effect.id && styles.optionButtonActive,
                ]}
                onPress={() => onEffectSelect(effect.id)}
              >
                <Text style={styles.effectIcon}>{effect.icon}</Text>
                <Text style={styles.optionLabel}>{effect.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'background' && (
          <>
            {textBackgrounds.map(bg => (
              <TouchableOpacity
                key={bg.id}
                style={[
                  styles.colorButton,
                  selectedBackground === bg.color && styles.colorButtonActive,
                ]}
                onPress={() => onBackgroundSelect(bg.color)}
              >
                {bg.color ? (
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: bg.color },
                      bg.color === '#FFFFFF' && styles.colorSwatchBorder,
                    ]}
                  />
                ) : (
                  <View style={[styles.colorSwatch, styles.noBackgroundSwatch]}>
                    <Text style={styles.noBackgroundIcon}>⊘</Text>
                  </View>
                )}
                <Text style={styles.optionLabel}>{bg.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    backgroundColor: theme.backgrounds.secondary,
    paddingVertical: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.overlays.light,
  },
  tabButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.overlays.light,
  },
  tabIcon: {
    fontSize: 20,
    color: theme.text.primary,
    fontWeight: '600',
  },
  colorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.overlays.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorIconInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.text.tertiary,
  },
  bgIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: theme.overlays.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgIconText: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.s,
    alignItems: 'center',
  },
  optionButton: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    padding: Spacing.s,
    borderRadius: 8,
    minWidth: 60,
  },
  optionButtonActive: {
    backgroundColor: theme.overlays.light,
  },
  fontPreview: {
    fontSize: 24,
    color: theme.text.primary,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 10,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  colorButton: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    padding: Spacing.s,
    borderRadius: 8,
    minWidth: 60,
  },
  colorButtonActive: {
    backgroundColor: theme.overlays.light,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  colorSwatchBorder: {
    borderWidth: 1,
    borderColor: theme.text.tertiary,
  },
  effectIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  noBackgroundSwatch: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBackgroundIcon: {
    fontSize: 20,
    color: theme.text.secondary,
  },
  });
