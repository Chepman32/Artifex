// Image picker screen with proper iOS permissions

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  PermissionsAndroid,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Theme } from '../constants/themes';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { formatString } from '../localization/format';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { materializePhotoForEditing } from '../utils/photoImport';

const GRID_COLUMNS = 4;
const PHOTO_PAGE_SIZE = 80;
const PHOTO_LOAD_TIMEOUT_MS = 12000;

const getAndroidApiLevel = () =>
  typeof Platform.Version === 'number'
    ? Platform.Version
    : Number.parseInt(Platform.Version, 10) || 0;

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`${label} timed out`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const requestAndroidPhotoPermission = async () => {
  const apiLevel = getAndroidApiLevel();

  if (apiLevel >= 34) {
    const statuses = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED,
    ]);

    return (
      statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      statuses[
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED
      ] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  if (apiLevel >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

interface PhotoAsset {
  uri: string;
  filename: string;
  width: number;
  height: number;
  timestamp: Date;
}

// Fallback photos if CameraRoll fails
const FALLBACK_PHOTOS: PhotoAsset[] = [
  {
    uri: 'https://picsum.photos/400/400?random=1',
    filename: 'Sample Photo 1',
    width: 400,
    height: 400,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/400/600?random=2',
    filename: 'Sample Photo 2',
    width: 400,
    height: 600,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/600/400?random=3',
    filename: 'Sample Photo 3',
    width: 600,
    height: 400,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/500/500?random=4',
    filename: 'Sample Photo 4',
    width: 500,
    height: 500,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/400/700?random=5',
    filename: 'Sample Photo 5',
    width: 400,
    height: 700,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/700/400?random=6',
    filename: 'Sample Photo 6',
    width: 700,
    height: 400,
    timestamp: new Date(),
  },
];

const ImagePickerScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'ImagePicker'>>();
  const theme = useTheme();
  const t = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const gridItemSize = useMemo(
    () => (screenWidth - Spacing.xs * (GRID_COLUMNS + 1)) / GRID_COLUMNS,
    [screenWidth],
  );
  const styles = useMemo(
    () => createStyles(theme, gridItemSize),
    [theme, gridItemSize],
  );
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectingPhotoUri, setSelectingPhotoUri] = useState<string | null>(
    null,
  );
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();

  const loadPhotos = useCallback(async (loadMore = false, cursor?: string) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Request permissions first
      if (Platform.OS === 'android' && !loadMore) {
        const granted = await requestAndroidPhotoPermission();

        if (!granted) {
          console.log('Android permission denied, using fallback photos');
          setPhotos(FALLBACK_PHOTOS);
          setHasMore(false);
          return;
        }
      }

      // Try to load real photos with file URIs
      const result = await withTimeout(
        CameraRoll.getPhotos({
          first: PHOTO_PAGE_SIZE,
          after: loadMore ? cursor : undefined,
          assetType: 'Photos',
          include: ['filename', 'imageSize'], // Request additional info
        }),
        PHOTO_LOAD_TIMEOUT_MS,
        'Photo library load',
      );

      if (result.edges && result.edges.length > 0) {
        const devicePhotos: PhotoAsset[] = result.edges.map(edge => ({
          uri: edge.node.image.uri,
          filename: edge.node.image.filename || 'Photo',
          width: edge.node.image.width || 400,
          height: edge.node.image.height || 400,
          timestamp: new Date(edge.node.timestamp * 1000),
        }));

        setPhotos(prev => loadMore ? [...prev, ...devicePhotos] : devicePhotos);
        setEndCursor(result.page_info.end_cursor);
        setHasMore(result.page_info.has_next_page);
      } else {
        // No photos found, use fallback
        if (!loadMore) {
          setPhotos(FALLBACK_PHOTOS);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.log('Failed to load photos, using fallback:', error);
      if (!loadMore) {
        setPhotos(FALLBACK_PHOTOS);
      }
      setHasMore(false);
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handlePhotoSelect = async (photo: PhotoAsset) => {
    if (selectingPhotoUri) {
      return;
    }

    setSelectingPhotoUri(photo.uri);

    try {
      const editableUri = await materializePhotoForEditing(
        photo.uri,
        photo.filename,
      );

      // Close the modal first, then navigate to Editor
      navigation.goBack();

      // Small delay to ensure smooth modal dismissal
      setTimeout(() => {
        navigation.navigate('Editor', {
          imageUri: editableUri,
          imageDimensions: { width: photo.width, height: photo.height },
        });
      }, 150);
    } catch (error) {
      console.warn('Failed to prepare selected photo for editing:', error);
      navigation.goBack();

      setTimeout(() => {
        navigation.navigate('Editor', {
          imageUri: photo.uri,
          imageDimensions: { width: photo.width, height: photo.height },
        });
      }, 150);
    } finally {
      setSelectingPhotoUri(null);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !loadingMore) {
      loadPhotos(true, endCursor);
    }
  };

  const renderPhoto = ({ item, index }: { item: PhotoAsset; index: number }) => (
    <TouchableOpacity
      testID={`image-picker-photo-${index}`}
      style={styles.photoItem}
      onPress={() => handlePhotoSelect(item)}
      disabled={!!selectingPhotoUri}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.photoImage}
        onError={() => console.log('Image failed to load:', item.uri)}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="image-picker-close" style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.dragHandle} />

        <View style={styles.placeholder} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t.imagePicker.title}</Text>
        <Text style={styles.subtitle}>
          {loading
            ? t.imagePicker.loadingSubtitle
            : photos.length === 1
              ? t.imagePicker.photoAvailable
              : formatString(t.imagePicker.photosAvailable, {
                  count: photos.length,
                })}
        </Text>
      </View>

      {/* Photo Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.imagePicker.loadingText}</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, gridItemSize: number) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgrounds.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 60,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: theme.text.secondary,
    fontWeight: '300',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: theme.backgrounds.tertiary,
    borderRadius: 2.5,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.m,
    alignItems: 'center',
  },
  title: {
    ...Typography.display.h3,
    color: theme.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body.regular,
    color: theme.text.secondary,
  },
  gridContainer: {
    padding: Spacing.xs,
  },
  photoItem: {
    width: gridItemSize,
    height: gridItemSize,
    margin: Spacing.xs / 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.backgrounds.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body.regular,
    color: theme.text.secondary,
  },
  });

export default ImagePickerScreen;
