// Settings screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isProUser, preferences, updatePreferences } = useAppStore();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRestorePurchases = () => {
    Alert.alert(
      'Restore Purchases',
      'This feature will be implemented with IAP',
    );
  };

  const handleExportAllProjects = () => {
    Alert.alert('Export All Projects', 'This Pro feature will be implemented');
  };

  const handleRateApp = () => {
    Alert.alert('Rate Artifex', 'This will open the App Store rating dialog');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'This will open email composer to support@artifex.app',
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove cached thumbnails and temporary files. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Cache cleared') },
      ],
    );
  };

  const handleDeleteAllProjects = () => {
    Alert.alert(
      'Delete All Projects',
      'This will permanently delete all projects. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => Alert.alert('All projects deleted'),
        },
      ],
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const renderSettingRow = (
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void,
    destructive?: boolean,
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text
          style={[
            styles.settingTitle,
            destructive && styles.settingTitleDestructive,
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        {renderSection(
          'Account',
          <>
            {renderSettingRow(
              'Restore Purchases',
              'For users who purchased Pro on another device',
              undefined,
              handleRestorePurchases,
            )}
            {isProUser &&
              renderSettingRow(
                'Export All Projects',
                'Batch export all projects to Photos',
                undefined,
                handleExportAllProjects,
              )}
          </>,
        )}

        {/* Preferences Section */}
        {renderSection(
          'Preferences',
          <>
            {renderSettingRow(
              'Default Export Format',
              preferences.defaultExportFormat.toUpperCase(),
              <Text style={styles.settingValue}>
                {preferences.defaultExportFormat.toUpperCase()}
              </Text>,
            )}
            {renderSettingRow(
              'Default Export Quality',
              `${preferences.defaultExportQuality}%`,
              <Text style={styles.settingValue}>
                {preferences.defaultExportQuality}%
              </Text>,
            )}
            {renderSettingRow(
              'Auto-Save Projects',
              'Automatically save every 30 seconds',
              <Switch
                value={preferences.autoSaveProjects}
                onValueChange={value =>
                  updatePreferences({ autoSaveProjects: value })
                }
                trackColor={{
                  false: Colors.backgrounds.tertiary,
                  true: Colors.accent.primary,
                }}
                thumbColor={Colors.text.primary}
              />,
            )}
            {renderSettingRow(
              'Haptic Feedback',
              'Vibration for interactions',
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={value =>
                  updatePreferences({ hapticFeedback: value })
                }
                trackColor={{
                  false: Colors.backgrounds.tertiary,
                  true: Colors.accent.primary,
                }}
                thumbColor={Colors.text.primary}
              />,
            )}
          </>,
        )}

        {/* Appearance Section */}
        {renderSection(
          'Appearance',
          <>
            {renderSettingRow(
              'Color Scheme',
              'Auto follows system settings',
              <Text style={styles.settingValue}>
                {preferences.colorScheme === 'auto'
                  ? 'Auto'
                  : preferences.colorScheme === 'light'
                  ? 'Light'
                  : 'Dark'}
              </Text>,
            )}
          </>,
        )}

        {/* About Section */}
        {renderSection(
          'About',
          <>
            {renderSettingRow(
              'Version',
              '1.0.0',
              <Text style={styles.settingValue}>1.0.0</Text>,
            )}
            {renderSettingRow(
              'Rate Artifex',
              'Help us improve with your feedback',
              undefined,
              handleRateApp,
            )}
            {renderSettingRow(
              'Contact Support',
              'Get help or report issues',
              undefined,
              handleContactSupport,
            )}
            {renderSettingRow(
              'Privacy Policy',
              'View our privacy policy',
              undefined,
              () =>
                Alert.alert(
                  'Privacy Policy',
                  'This will open artifex.app/privacy',
                ),
            )}
            {renderSettingRow(
              'Terms of Service',
              'View terms of service',
              undefined,
              () =>
                Alert.alert(
                  'Terms of Service',
                  'This will open artifex.app/terms',
                ),
            )}
          </>,
        )}

        {/* Danger Zone Section */}
        {renderSection(
          'Danger Zone',
          <>
            {renderSettingRow(
              'Clear Cache',
              'Remove cached thumbnails and temporary files',
              undefined,
              handleClearCache,
            )}
            {renderSettingRow(
              'Delete All Projects',
              'Permanently delete all projects',
              undefined,
              handleDeleteAllProjects,
              true,
            )}
          </>,
        )}
      </ScrollView>
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
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgrounds.tertiary,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  title: {
    ...Typography.display.h4,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.l,
  },
  sectionHeader: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.s,
  },
  sectionContent: {
    backgroundColor: Colors.backgrounds.secondary,
    marginHorizontal: Spacing.m,
    borderRadius: AppDimensions.cornerRadius.medium,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgrounds.tertiary,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body.regular,
    color: Colors.text.primary,
  },
  settingTitleDestructive: {
    color: Colors.semantic.error,
  },
  settingSubtitle: {
    ...Typography.body.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: Spacing.m,
  },
  settingValue: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
  },
});

export default SettingsScreen;
