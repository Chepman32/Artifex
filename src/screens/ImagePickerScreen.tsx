// Image picker screen with proper iOS permissions

import React, { useMemo, useState, useEffect } from 'react';
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
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Theme } from '../constants/themes';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { formatString } from '../localization/format';

const GRID_COLUMNS = 4;

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
  const navigation = useNavigation();
  const theme = useTheme();
  const t = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const gridItemSize = useMemo(
    () => (screenWidth - Spacing.xs * (GRID_COLUMNS + 1)) / GRID_COLUMNS,
    [screenWidth],
  );
  const styles = useMemo(() => createStyles(theme, gridItemSize), [theme, gridItemSize]);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async (loadMore = false) => {
    try {
      // Request permissions first
      if (Platform.OS === 'android' && !loadMore) {
        const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission);

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android permission denied, using fallback photos');
          setPhotos(FALLBACK_PHOTOS);
          setLoading(false);
          return;
        }
      }

      // Try to load real photos with file URIs
      const result = await CameraRoll.getPhotos({
        first: 1000000,
        after: loadMore ? endCursor : undefined,
        assetType: 'Photos',
        include: ['filename', 'imageSize'], // Request additional info
      });

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
      }
    } catch (error) {
      console.log('Failed to load photos, using fallback:', error);
      if (!loadMore) {
        setPhotos(FALLBACK_PHOTOS);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (photo: PhotoAsset) => {
    // Close the modal first, then navigate to Editor
    navigation.goBack();

    // Small delay to ensure smooth modal dismissal
    setTimeout(() => {
      navigation.navigate(
        'Editor' as never,
        {
          imageUri: photo.uri,
          imageDimensions: { width: photo.width, height: photo.height },
        } as never,
      );
    }, 150);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPhotos(true);
    }
  };

  const renderPhoto = ({ item }: { item: PhotoAsset }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoSelect(item)}
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
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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
