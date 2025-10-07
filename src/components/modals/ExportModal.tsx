// Export modal with format and quality options

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../stores/appStore';
import { useEditorStore } from '../../stores/editorStore';
import { exportCanvasToImage } from '../../utils/imageExporter';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Share } from 'react-native';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

type ExportFormat = 'png' | 'jpg';

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<number>(100);
  const [isExporting, setIsExporting] = useState(false);

  const isProUser = useAppStore(state => state.isProUser);
  const { canvasElements, sourceImagePath, sourceImageDimensions } =
    useEditorStore();

  const handleExport = async (action: 'save' | 'share') => {
    if (!sourceImagePath || !sourceImageDimensions) {
      Alert.alert('Error', 'No image to export');
      return;
    }

    setIsExporting(true);

    try {
      // Export canvas to image file
      const filepath = await exportCanvasToImage(
        sourceImagePath,
        sourceImageDimensions,
        canvasElements,
        {
          format: selectedFormat,
          quality,
          addWatermark: !isProUser,
        },
      );

      if (action === 'save') {
        // Save to Photos
        await CameraRoll.save(filepath, { type: 'photo' });
        Alert.alert('Success', 'Image saved to Photos');
      } else {
        // Share
        await Share.share({
          url: `file://${filepath}`,
          type: selectedFormat === 'png' ? 'image/png' : 'image/jpeg',
        });
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={400}>
      <View style={styles.container}>
        <Text style={styles.title}>Export Image</Text>

        {/* Format selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Format</Text>
          <View style={styles.formatButtons}>
            <TouchableOpacity
              style={[
                styles.formatButton,
                selectedFormat === 'png' && styles.formatButtonActive,
              ]}
              onPress={() => setSelectedFormat('png')}
              disabled={isExporting}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  selectedFormat === 'png' && styles.formatButtonTextActive,
                ]}
              >
                PNG
              </Text>
              <Text
                style={[
                  styles.formatDescription,
                  selectedFormat === 'png' && styles.formatDescriptionActive,
                ]}
              >
                Lossless
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatButton,
                selectedFormat === 'jpg' && styles.formatButtonActive,
              ]}
              onPress={() => setSelectedFormat('jpg')}
              disabled={isExporting}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  selectedFormat === 'jpg' && styles.formatButtonTextActive,
                ]}
              >
                JPG
              </Text>
              <Text
                style={[
                  styles.formatDescription,
                  selectedFormat === 'jpg' && styles.formatDescriptionActive,
                ]}
              >
                Smaller file
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quality selector (only for JPG) */}
        {selectedFormat === 'jpg' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quality</Text>
            <View style={styles.qualityButtons}>
              <TouchableOpacity
                style={[
                  styles.qualityButton,
                  quality === 90 && styles.qualityButtonActive,
                ]}
                onPress={() => setQuality(90)}
                disabled={isExporting}
              >
                <Text
                  style={[
                    styles.qualityButtonText,
                    quality === 90 && styles.qualityButtonTextActive,
                  ]}
                >
                  90%
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.qualityButton,
                  quality === 100 && styles.qualityButtonActive,
                ]}
                onPress={() => setQuality(100)}
                disabled={isExporting}
              >
                <Text
                  style={[
                    styles.qualityButtonText,
                    quality === 100 && styles.qualityButtonTextActive,
                  ]}
                >
                  100%
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Watermark notice for free users */}
        {!isProUser && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Free tier exports include a small "Made with Artifex" watermark.
            </Text>
            <Text style={styles.noticeLink}>Upgrade to Pro to remove →</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => handleExport('share')}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.text.primary} />
            ) : (
              <Text style={styles.actionButtonText}>Share</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => handleExport('save')}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator
                size="small"
                color={Colors.backgrounds.primary}
              />
            ) : (
              <Text
                style={[
                  styles.actionButtonText,
                  styles.actionButtonTextPrimary,
                ]}
              >
                Save to Photos
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formatButton: {
    flex: 1,
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  formatButtonActive: {
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.accent.gold + '10',
  },
  formatButtonText: {
    ...Typography.h3,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  formatButtonTextActive: {
    color: Colors.accent.gold,
  },
  formatDescription: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  formatDescriptionActive: {
    color: Colors.accent.gold + 'AA',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  qualityButton: {
    flex: 1,
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  qualityButtonActive: {
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.accent.gold + '10',
  },
  qualityButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  qualityButtonTextActive: {
    color: Colors.accent.gold,
  },
  noticeBox: {
    backgroundColor: Colors.accent.gold + '15',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  noticeText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  noticeLink: {
    ...Typography.caption,
    color: Colors.accent.gold,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.backgrounds.secondary,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.accent.gold,
  },
  actionButtonText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: Colors.backgrounds.primary,
  },
});
