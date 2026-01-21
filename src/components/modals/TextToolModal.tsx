// Text tool modal for adding and editing text elements

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface TextToolModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (text: string, fontFamily: string, fontSize: number, color: string) => void;
  initialText?: string;
  initialFont?: string;
  initialSize?: number;
  initialColor?: string;
}

const FONTS = {
  free: [
    { id: 'system', name: 'System', family: 'System' },
    { id: 'sf-mono', name: 'SF Mono', family: 'Menlo' },
    { id: 'helvetica', name: 'Helvetica', family: 'Helvetica' },
  ],
  pro: [
    { id: 'georgia', name: 'Georgia', family: 'Georgia', isPro: true },
    { id: 'times', name: 'Times New Roman', family: 'Times New Roman', isPro: true },
  ],
};

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64];

export const TextToolModal: React.FC<TextToolModalProps> = ({
  visible,
  onClose,
  onAdd,
  initialText = '',
  initialFont = 'System',
  initialSize = 24,
  initialColor,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colorOptions = useMemo(
    () => [
      theme.text.primary,
      theme.accent.primary,
      '#FFFFFF',
      '#000000',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FF00FF',
    ],
    [theme],
  );
  const [text, setText] = useState(initialText);
  const [selectedFont, setSelectedFont] = useState(initialFont);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [selectedColor, setSelectedColor] = useState(
    initialColor ?? theme.text.primary,
  );

  const allFonts = [...FONTS.free, ...FONTS.pro];

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text, selectedFont, selectedSize, selectedColor);
      setText('');
      onClose();
    }
  };

  const handleFontSelect = (fontId: string) => {
    const font = allFonts.find(f => f.id === fontId);
    if (font) {
      setSelectedFont(font.family);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.7, 0.9]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t.textTool.title}</Text>

        {/* Text input */}
        <TextInput
          style={[
            styles.textInput,
            { fontFamily: selectedFont, fontSize: selectedSize, color: selectedColor },
          ]}
          placeholder={t.textTool.placeholder}
          placeholderTextColor={theme.text.tertiary}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
        />

        {/* Font selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.textTool.fontLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {allFonts.map(font => (
                <TouchableOpacity
                  key={font.id}
                  style={[
                    styles.fontOption,
                    selectedFont === font.family && styles.fontOptionSelected,
                  ]}
                  onPress={() => handleFontSelect(font.id)}
                >
                  <Text
                    style={[
                      styles.fontOptionText,
                      { fontFamily: font.family },
                      selectedFont === font.family && styles.fontOptionTextSelected,
                    ]}
                  >
                    {font.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Size selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.textTool.sizeLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {FONT_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.sizeOptionSelected,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeOptionText,
                      selectedSize === size && styles.sizeOptionTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Color picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.textTool.colorLabel}</Text>
          <View style={styles.colorRow}>
            {colorOptions.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={[styles.addButton, !text.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!text.trim()}
        >
          <Text style={styles.addButtonText}>{t.textTool.addToCanvas}</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  title: {
    ...Typography.display.h3,
    color: theme.text.primary,
    marginBottom: Spacing.m,
  },
  textInput: {
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 12,
    padding: Spacing.m,
    minHeight: 100,
    marginBottom: Spacing.l,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    ...Typography.body.regular,
    color: theme.text.secondary,
    marginBottom: Spacing.s,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  fontOption: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fontOptionSelected: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.backgrounds.primary,
  },
  fontOptionText: {
    ...Typography.body.regular,
    color: theme.text.primary,
  },
  fontOptionTextSelected: {
    color: theme.accent.primary,
  },
  proLabel: {
    fontSize: 10,
    position: 'absolute',
    top: -4,
    right: -4,
  },
  sizeOption: {
    width: 50,
    height: 50,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeOptionSelected: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.backgrounds.primary,
  },
  sizeOptionText: {
    ...Typography.body.regular,
    color: theme.text.primary,
  },
  sizeOptionTextSelected: {
    color: theme.accent.primary,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.accent.primary,
  },
  addButton: {
    backgroundColor: theme.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    ...Typography.ui.button,
    color: theme.backgrounds.primary,
  },
  });
