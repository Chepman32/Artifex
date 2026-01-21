// Export modal with format and quality options

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Theme } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useEditorStore } from '../../stores/editorStore';
import { exportCanvasToImage } from '../../utils/imageExporter';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Share } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';

const instagramIcon = require('../../assets/icons/instagram.png');
const xIcon = require('../../assets/icons/x-logo.png');

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  canvasDimensions: { width: number; height: number };
}

type ExportFormat = 'png' | 'jpg';

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  canvasDimensions,
}) => {
  const t = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedFormat, _setSelectedFormat] = useState<ExportFormat>('png');
  const [quality, _setQuality] = useState<number>(100);
  const [isExporting, setIsExporting] = useState(false);

  const {
    canvasElements,
    sourceImagePath,
    sourceImageDimensions,
    canvasSize: storedCanvasSize,
    appliedFilter,
  } = useEditorStore();

  const openCameraRoll = async () => {
    const iosPhotosUrl = 'photos-redirect://';
    const androidPhotosUrl = 'content://media/internal/images/media';

    const targetUrl = Platform.OS === 'ios' ? iosPhotosUrl : androidPhotosUrl;
    await Linking.openURL(targetUrl);
  };

  const exportImage = async () => {
    if (!sourceImagePath || !sourceImageDimensions) {
      Alert.alert(t.common.error, t.export.noImageToExport);
      throw new Error('Missing source image');
    }

    setIsExporting(true);

    try {
      // Export canvas to image file
      // Use stored canvas size if available, otherwise use current canvas dimensions
      const result = await exportCanvasToImage(
        sourceImagePath,
        sourceImageDimensions,
        canvasElements,
        {
          format: selectedFormat,
          quality,
          addWatermark: true,
          canvasSize: storedCanvasSize || canvasDimensions,
        },
        appliedFilter,
      );

      return result;
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(t.common.error, t.export.failedToExport);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToDevice = async () => {
    let exportResult: Awaited<ReturnType<typeof exportImage>> | null = null;
    try {
      exportResult = await exportImage();
    } catch {
      return;
    }

    try {
      setIsExporting(true);
      await CameraRoll.save(exportResult.filepath, { type: 'photo' });

      onClose();

      Alert.alert(
        t.export.savedToPhotos,
        t.export.savedToPhotosDesc,
        [
          {
            text: t.common.ok,
            style: 'cancel',
          },
          {
            text: t.export.viewInGallery,
            onPress: () => {
              openCameraRoll().catch(err =>
                console.warn('Failed to open gallery:', err),
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(t.common.error, t.export.failedToSave);
      // exportImage already displayed an alert, so nothing extra here
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToInstagram = async (): Promise<void> => {
    let exportResult: Awaited<ReturnType<typeof exportImage>> | null = null;
    try {
      exportResult = await exportImage();
    } catch {
      return;
    }

    try {
      setIsExporting(true);

      if (Platform.OS === 'ios') {
        const savedUri = await CameraRoll.save(exportResult.filepath, { type: 'photo' });
        const instagramUrl = `instagram://library?AssetPath=${encodeURIComponent(savedUri)}`;
        await Linking.openURL(instagramUrl);
        onClose();
        return;
      }

      const options = {
        url: `file://${exportResult.filepath}`,
        type: exportResult.mime,
      };

      const result = await Share.share(options, {
        dialogTitle: t.export.shareOnInstagram,
        subject: 'Instagram',
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      console.error('Share error (Instagram):', error);
      Alert.alert(t.common.error, t.export.couldNotShareInstagram);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToX = async (): Promise<void> => {
    let exportResult: Awaited<ReturnType<typeof exportImage>> | null = null;
    try {
      exportResult = await exportImage();
    } catch {
      return;
    }

    try {
      setIsExporting(true);

      if (Platform.OS === 'ios') {
        try {
          const savedUri = await CameraRoll.save(exportResult.filepath, { type: 'photo' });
          const encodedMedia = encodeURIComponent(savedUri);
          const encodedText = encodeURIComponent('');
          const urlCandidates = [
            `twitter://post?message=${encodedText}&media=${encodedMedia}`,
            `x://post?text=${encodedText}&media=${encodedMedia}`,
          ];

          for (const targetUrl of urlCandidates) {
            try {
              await Linking.openURL(targetUrl);
              onClose();
              return;
            } catch {
              // Try the next URL scheme.
            }
          }
        } catch (openError) {
          console.warn('Failed to open X with saved media:', openError);
        }
      }

      const options = {
        url: `file://${exportResult.filepath}`,
        type: exportResult.mime,
      };

      const result = await Share.share(options, {
        dialogTitle: t.export.shareOnX,
        subject: 'X',
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      console.error('Share error (X):', error);
      Alert.alert(t.common.error, t.export.couldNotShareX);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={380}>
      <View style={styles.container}>
        {/* Export actions */}
        <View style={styles.actionList}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveToDevice}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.text.primary} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>💾</Text>
                </View>
                <Text style={styles.actionText}>{t.export.saveToDevice}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareToInstagram}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.text.primary} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Image
                    source={instagramIcon}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.actionText}>{t.export.shareOnInstagram}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareToX}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.text.primary} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Image
                    source={xIcon}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.actionText}>{t.export.shareOnX}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  actionList: {
    gap: Spacing.l,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgrounds.secondary,
    borderRadius: 16,
    padding: Spacing.l,
    paddingVertical: Spacing.l,
    gap: Spacing.l,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgrounds.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
  actionText: {
    ...Typography.body,
    color: theme.text.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  });
