// Image picker modal for selecting photos

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
// import CameraRoll from '@react-native-camera-roll/camera-roll'; // Temporarily disabled
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { PhotoAsset } from '../types';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 4;
const GRID_ITEM_SIZE =
  (screenWidth - Spacing.xs * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

const ImagePickerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'recents' | 'favorites' | 'albums'
  >('recents');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // Request permission
      const hasPermission = await requestPhotoPermission();
      if (!hasPermission) {
        Alert.alert(
          'Photos Access Required',
          'Artifex needs permission to access your photos. Please enable access in Settings.',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            {
              text: 'Open Settings',
              onPress: () => {
                /* Open settings */
              },
            },
          ],
        );
        return;
      }

      // For now, create some mock photos for testing
      const mockPhotos: PhotoAsset[] = [
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
      ];

      setPhotos(mockPhotos);
    } catch (error) {
      console.error('Failed to load photos:', error);
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestPhotoPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);

      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid.request(permission);
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }

    // iOS permissions are handled automatically by CameraRoll
    return true;
  };

  const handlePhotoSelect = (photo: PhotoAsset) => {
    navigation.navigate(
      'Editor' as never,
      {
        imageUri: photo.uri,
        imageDimensions: { width: photo.width, height: photo.height },
      } as never,
    );
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCameraPress = () => {
    // TODO: Implement camera functionality
    Alert.alert(
      'Camera',
      'Camera functionality will be implemented with react-native-vision-camera',
    );
  };

  const renderPhoto = ({ item }: { item: PhotoAsset }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoSelect(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
    </TouchableOpacity>
  );

  const renderTab = (
    tab: 'recents' | 'favorites' | 'albums',
    label: string,
  ) => (
    <TouchableOpacity style={styles.tab} onPress={() => setActiveTab(tab)}>
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
      {activeTab === tab && <View style={styles.tabIndicator} />}
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

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleCameraPress}
        >
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {renderTab('recents', 'Recents')}
        {renderTab('favorites', 'Favorites')}
        {renderTab('albums', 'Albums')}
      </View>

      {/* Photo Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
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
    color: Colors.text.secondary,
    fontWeight: '300',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 2.5,
  },
  cameraButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 22,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.m,
    height: 48,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  tabText: {
    ...Typography.ui.tabBar,
    color: Colors.text.tertiary,
  },
  tabTextActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: 3,
    backgroundColor: Colors.accent.primary,
    borderRadius: 1.5,
  },
  gridContainer: {
    padding: Spacing.xs,
  },
  photoItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    margin: Spacing.xs / 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
  },
});

export default ImagePickerScreen;
