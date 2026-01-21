// Home screen - Project gallery with FAB and staggered animations

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useProjectGalleryStore } from '../stores/projectGalleryStore';
import { useTheme } from '../hooks/useTheme';
import { useCurrentLanguage, useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { Shadows } from '../constants/colors';
import { Project } from '../types';
import { formatString } from '../localization/format';
import { getLanguageLocale } from '../localization/deviceLanguage';
import type { Translations } from '../localization/translations';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const GRID_ITEM_SIZE =
  (screenWidth - Spacing.m * 2 - Spacing.m) / GRID_COLUMNS;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const t = useTranslation();
  const language = useCurrentLanguage();
  const locale = getLanguageLocale(language);
  const {
    projects,
    selectionMode,
    selectedIds,
    loadProjects,
    deleteProjects,
    duplicateProject,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelection,
  } = useProjectGalleryStore();

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  const handleFabPress = () => {
    try {
      // Navigate to Image Picker
      navigation.navigate('ImagePicker' as never);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleProjectPress = (project: Project) => {
    if (selectionMode) {
      toggleSelection(project.id);
    } else {
      navigation.navigate(
        'Editor' as never,
        { projectId: project.id } as never,
      );
    }
  };

  const handleProjectLongPress = (project: Project) => {
    if (!selectionMode) {
      enterSelectionMode();
      toggleSelection(project.id);
    }
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    Alert.alert(
      t.home.deleteProjectsTitle,
      count === 1
        ? t.home.deleteProjectSingle
        : formatString(t.home.deleteProjectMultiple, { count }),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => deleteProjects(Array.from(selectedIds)),
        },
      ],
    );
  };

  const handleDuplicateSelected = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await duplicateProject(id);
    }
    exitSelectionMode();
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };


  // Animated project item component
  const AnimatedProjectItem = ({
    item,
    index,
  }: {
    item: Project;
    index: number;
  }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.9);
    const isSelected = selectedIds.has(item.id);

    useEffect(() => {
      // Staggered entrance animation
      opacity.value = withDelay(index * 50, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(
        index * 50,
        withSpring(0, { damping: 15, stiffness: 100 }),
      );
      scale.value = withDelay(
        index * 50,
        withSpring(1, { damping: 12, stiffness: 80 }),
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    return (
      <Animated.View
        style={[styles.projectItem, animatedStyle]}
        layout={Layout.springify()}
        exiting={FadeOut.duration(200)}
      >
        <TouchableOpacity
          style={[styles.touchable, isSelected && styles.projectItemSelected]}
          onPress={() => handleProjectPress(item)}
          onLongPress={() => handleProjectLongPress(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.projectThumbnail, { backgroundColor: theme.backgrounds.tertiary }]}>
            {item.thumbnailPath ? (
              <Image
                source={{ uri: item.thumbnailPath }}
                style={styles.thumbnailImage}
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.thumbnailPlaceholderText}>📷</Text>
              </View>
            )}

            {/* Timestamp badge */}
            <View style={styles.timestampBadge}>
              <Text style={[styles.timestampText, { color: theme.text.primary }]}>
                {formatTimestamp(item.updatedAt, t, locale)}
              </Text>
            </View>

            {/* Selection indicator */}
            {selectionMode && (
              <View
                style={[
                  styles.selectionIndicator,
                  { borderColor: theme.text.primary },
                  isSelected && { backgroundColor: theme.accent.secondary, borderColor: theme.accent.secondary },
                ]}
              >
                {isSelected && <Text style={[styles.checkmark, { color: theme.text.primary }]}>✓</Text>}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderProject = ({ item, index }: { item: Project; index: number }) => (
    <AnimatedProjectItem item={item} index={index} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateIconText}>🖼️</Text>
      </View>
      <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>
        {t.home.emptyTitle}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.text.tertiary }]}>
        {t.home.emptySubtitle}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgrounds.primary }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleSettingsPress}
        >
          <Image
            source={require('../assets/icons/settings.png')}
            style={styles.topBarIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.text.primary }]}>Stikaro</Text>

        <View style={styles.topBarButton} />
      </View>

      {/* Selection Mode Top Bar */}
      {selectionMode && (
        <View style={[styles.selectionTopBar, { backgroundColor: theme.backgrounds.secondary }]}>
          <TouchableOpacity onPress={exitSelectionMode}>
            <Text style={[styles.selectionAction, { color: theme.accent.secondary }]}>
              {t.common.cancel}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.selectionTitle, { color: theme.text.primary }]}>
            {formatString(t.home.selectionTitle, { count: selectedIds.size })}
          </Text>

          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={styles.deleteAction}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Project Grid */}
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: theme.accent.primary }]}
          onPress={selectionMode ? handleDuplicateSelected : handleFabPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabIcon, { color: theme.backgrounds.primary }]}>{selectionMode ? '📋' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const formatTimestamp = (
  date: Date,
  t: Translations,
  locale: string,
): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t.home.timestampToday;
  if (diffDays === 1) return t.home.timestampDayAgo;
  if (diffDays < 7) {
    return formatString(t.home.timestampDaysAgo, { count: diffDays });
  }

  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
  },
  topBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarIcon: {
    width: 20,
    height: 20,
  },
  title: {
    ...Typography.display.h4,
    letterSpacing: 0.5,
  },
  selectionTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 44,
  },
  selectionAction: {
    ...Typography.body.regular,
  },
  selectionTitle: {
    ...Typography.body.regular,
    fontWeight: '600',
  },
  deleteAction: {
    fontSize: 20,
  },
  gridContainer: {
    padding: Spacing.m,
    flexGrow: 1,
  },
  projectItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginRight: Spacing.m,
    marginBottom: Spacing.m,
  },
  touchable: {
    flex: 1,
  },
  projectItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  projectThumbnail: {
    flex: 1,
    borderRadius: AppDimensions.cornerRadius.medium,
    ...Shadows.level1,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 32,
    opacity: 0.5,
  },
  timestampBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timestampText: {
    ...Typography.body.caption,
    fontSize: 10,
    fontWeight: '500',
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  emptyStateIconText: {
    fontSize: 64,
    opacity: 0.3,
  },
  emptyStateTitle: {
    ...Typography.display.h3,
    marginBottom: Spacing.s,
  },
  emptyStateSubtitle: {
    ...Typography.body.regular,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.l + 34, // Account for safe area
    right: Spacing.l,
    width: AppDimensions.fab.size,
    height: AppDimensions.fab.size,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: AppDimensions.fab.cornerRadius,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.goldGlow,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
