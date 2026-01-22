// Settings screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { ThemeType } from '../constants/themes';
import { Language, languageNames } from '../localization';
import { triggerHaptic } from '../utils/haptics';
import { ProjectDatabase } from '../database/ProjectDatabase';
import { exportCanvasToImage } from '../utils/imageExporter';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import type { CanvasElement } from '../types';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const t = useTranslation();
  const preferences = useAppStore(state => state.preferences);
  const updatePreferences = useAppStore(state => state.updatePreferences);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isExportingAllProjects, setIsExportingAllProjects] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('selection');
    }
    updatePreferences({ theme: newTheme });
    setShowThemeModal(false);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('selection');
    }
    updatePreferences({ language: newLanguage });
    setShowLanguageModal(false);
  };

  const openCameraRoll = async () => {
    const iosPhotosUrl = 'photos-redirect://';
    const androidPhotosUrl = 'content://media/internal/images/media';
    const targetUrl = Platform.OS === 'ios' ? iosPhotosUrl : androidPhotosUrl;
    await Linking.openURL(targetUrl);
  };

  const handleExportAllProjects = async () => {
    if (isExportingAllProjects) return;

    if (preferences.hapticFeedback) {
      triggerHaptic('selection');
    }

    setIsExportingAllProjects(true);

    try {
      const projects = await ProjectDatabase.getAll();
      if (projects.length === 0) {
        Alert.alert(t.settings.exportAllProjects, t.export.noImageToExport);
        return;
      }

      let exportedCount = 0;

      for (const project of projects) {
        if (!project.sourceImagePath || !project.sourceImageDimensions) {
          continue;
        }

        try {
          const result = await exportCanvasToImage(
            project.sourceImagePath,
            project.sourceImageDimensions,
            project.elements as CanvasElement[],
            {
              format: preferences.defaultExportFormat,
              quality: preferences.defaultExportQuality,
              addWatermark: true,
              canvasSize: project.canvasSize,
            },
            null,
          );

          await CameraRoll.save(result.filepath, { type: 'photo' });
          exportedCount += 1;
        } catch (error) {
          console.error('Failed to export project:', project.id, error);
        }
      }

      if (exportedCount === 0) {
        Alert.alert(t.common.error, t.export.failedToExport);
        return;
      }

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
      console.error('Failed to export all projects:', error);
      Alert.alert(t.common.error, t.export.failedToExport);
    } finally {
      setIsExportingAllProjects(false);
    }
  };

  const handleRateApp = () => {
    Alert.alert(t.settings.rateApp, t.settings.rateAppAlertMessage);
  };

  const handleContactSupport = () => {
    Alert.alert(
      t.settings.contactSupport,
      t.settings.contactSupportAlertMessage,
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t.settings.clearCache,
      t.settings.clearCacheAlertMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.clear,
          onPress: () => Alert.alert(t.settings.clearCacheSuccess),
        },
      ],
    );
  };

  const handleDeleteAllProjects = () => {
    Alert.alert(
      t.settings.deleteAllProjects,
      t.settings.deleteAllProjectsAlertMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => Alert.alert(t.settings.deleteAllProjectsSuccess),
        },
      ],
    );
  };

  const getThemeName = (themeType: ThemeType) => {
    switch (themeType) {
      case 'light':
        return t.settings.themeLight;
      case 'dark':
        return t.settings.themeDark;
      case 'solar':
        return t.settings.themeSolar;
      case 'mono':
        return t.settings.themeMono;
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: theme.text.tertiary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: theme.backgrounds.secondary },
        ]}
      >
        {children}
      </View>
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
      style={[
        styles.settingRow,
        { borderBottomColor: theme.backgrounds.tertiary },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text
          style={[
            styles.settingTitle,
            { color: destructive ? theme.semantic.error : theme.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, { color: theme.text.tertiary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </TouchableOpacity>
  );

  const renderThemeModal = () => (
    <Modal
      visible={showThemeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowThemeModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.backgrounds.secondary },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
            {t.settings.theme}
          </Text>
          {(['light', 'dark', 'solar', 'mono'] as ThemeType[]).map(
            themeType => (
              <TouchableOpacity
                key={themeType}
                style={[
                  styles.modalOption,
                  { borderBottomColor: theme.backgrounds.tertiary },
                ]}
                onPress={() => handleThemeChange(themeType)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    {
                      color:
                        preferences.theme === themeType
                          ? theme.accent.primary
                          : theme.text.primary,
                    },
                  ]}
                >
                  {getThemeName(themeType)}
                </Text>
                {preferences.theme === themeType && (
                  <Text
                    style={[styles.checkmark, { color: theme.accent.primary }]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ),
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const getFlagImage = (language: Language) => {
    const flagMap: Record<Language, any> = {
      en: require('../assets/icons/flags/en.png'),
      zh: require('../assets/icons/flags/zh.png'),
      ja: require('../assets/icons/flags/ja.png'),
      ko: require('../assets/icons/flags/ko.png'),
      de: require('../assets/icons/flags/de.png'),
      fr: require('../assets/icons/flags/fr.png'),
      es: require('../assets/icons/flags/es.png'),
      pt: require('../assets/icons/flags/pt-BR.png'),
      ar: require('../assets/icons/flags/ar.png'),
      ru: require('../assets/icons/flags/ru.png'),
      it: require('../assets/icons/flags/it.png'),
      nl: require('../assets/icons/flags/nl.png'),
      tr: require('../assets/icons/flags/tr.png'),
      th: require('../assets/icons/flags/th.png'),
      vi: require('../assets/icons/flags/vi.png'),
      id: require('../assets/icons/flags/id.png'),
      pl: require('../assets/icons/flags/pl.png'),
      uk: require('../assets/icons/flags/uk.png'),
      hi: require('../assets/icons/flags/hi.png'),
      he: require('../assets/icons/flags/he.png'),
      sv: require('../assets/icons/flags/sv.png'),
      no: require('../assets/icons/flags/no.png'),
      da: require('../assets/icons/flags/da.png'),
      fi: require('../assets/icons/flags/fi.png'),
      cs: require('../assets/icons/flags/cs.png'),
      hu: require('../assets/icons/flags/hu.png'),
      ro: require('../assets/icons/flags/ro.png'),
      el: require('../assets/icons/flags/el.png'),
      ms: require('../assets/icons/flags/ms.png'),
      fil: require('../assets/icons/flags/fil.png'),
    };
    return flagMap[language];
  };

  const renderLanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowLanguageModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            styles.languageModalContent,
            { backgroundColor: theme.backgrounds.secondary },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
            {t.settings.language}
          </Text>
          <ScrollView style={styles.modalScroll}>
            {(Object.keys(languageNames) as Language[]).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.modalOption,
                  { borderBottomColor: theme.backgrounds.tertiary },
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <View style={styles.languageOption}>
                  <Image
                    source={getFlagImage(lang)}
                    style={styles.flagImage}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          preferences.language === lang
                            ? theme.accent.primary
                            : theme.text.primary,
                        marginLeft: Spacing.m,
                      },
                    ]}
                  >
                    {languageNames[lang]}
                  </Text>
                </View>
                {preferences.language === lang && (
                  <Text
                    style={[styles.checkmark, { color: theme.accent.primary }]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgrounds.primary }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.backgrounds.tertiary },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={[styles.closeIcon, { color: theme.text.secondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t.settings.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        {renderSection(
          t.settings.appearance,
          <>
            {renderSettingRow(
              t.settings.theme,
              getThemeName(preferences.theme),
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {getThemeName(preferences.theme)}
              </Text>,
              () => setShowThemeModal(true),
            )}
            {renderSettingRow(
              t.settings.haptics,
              preferences.hapticFeedback
                ? t.settings.hapticsOn
                : t.settings.hapticsOff,
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={value => {
                  if (preferences.hapticFeedback || value) {
                    triggerHaptic('selection');
                  }
                  updatePreferences({ hapticFeedback: value });
                }}
                trackColor={{
                  false: theme.backgrounds.tertiary,
                  true: theme.accent.primary,
                }}
                thumbColor={theme.text.primary}
              />,
            )}
            {renderSettingRow(
              t.settings.language,
              languageNames[preferences.language],
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {languageNames[preferences.language]}
              </Text>,
              () => setShowLanguageModal(true),
            )}
          </>,
        )}

        {/* Account Section */}
        {renderSection(
          t.settings.account,
          <>
            {renderSettingRow(
              t.settings.exportAllProjects,
              t.settings.exportAllProjectsDesc,
              isExportingAllProjects ? (
                <ActivityIndicator size="small" color={theme.text.secondary} />
              ) : undefined,
              isExportingAllProjects ? undefined : handleExportAllProjects,
            )}
          </>,
        )}

        {/* Preferences Section */}
        {renderSection(
          t.settings.preferences,
          <>
            {renderSettingRow(
              t.settings.defaultExportFormat,
              preferences.defaultExportFormat.toUpperCase(),
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {preferences.defaultExportFormat.toUpperCase()}
              </Text>,
            )}
            {renderSettingRow(
              t.settings.defaultExportQuality,
              `${preferences.defaultExportQuality}%`,
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {preferences.defaultExportQuality}%
              </Text>,
            )}
            {renderSettingRow(
              t.settings.autoSaveProjects,
              t.settings.autoSaveProjectsDesc,
              <Switch
                value={preferences.autoSaveProjects}
                onValueChange={value => {
                  if (preferences.hapticFeedback) {
                    triggerHaptic('selection');
                  }
                  updatePreferences({ autoSaveProjects: value });
                }}
                trackColor={{
                  false: theme.backgrounds.tertiary,
                  true: theme.accent.primary,
                }}
                thumbColor={theme.text.primary}
              />,
            )}
          </>,
        )}

        {/* About Section */}
        {renderSection(
          t.settings.about,
          <>
            {renderSettingRow(
              t.settings.version,
              '1.0.0',
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                1.0.0
              </Text>,
            )}
            {renderSettingRow(
              t.settings.rateApp,
              t.settings.rateAppDesc,
              undefined,
              handleRateApp,
            )}
            {renderSettingRow(
              t.settings.contactSupport,
              t.settings.contactSupportDesc,
              undefined,
              handleContactSupport,
            )}
            {renderSettingRow(
              t.settings.privacyPolicy,
              t.settings.privacyPolicyDesc,
              undefined,
              () =>
                Alert.alert(
                  t.settings.privacyPolicy,
                  t.settings.privacyPolicyAlertMessage,
                ),
            )}
            {renderSettingRow(
              t.settings.termsOfService,
              t.settings.termsOfServiceDesc,
              undefined,
              () =>
                Alert.alert(
                  t.settings.termsOfService,
                  t.settings.termsOfServiceAlertMessage,
                ),
            )}
          </>,
        )}

        {/* Danger Zone Section */}
        {renderSection(
          t.settings.dangerZone,
          <>
            {renderSettingRow(
              t.settings.clearCache,
              t.settings.clearCacheDesc,
              undefined,
              handleClearCache,
            )}
            {renderSettingRow(
              t.settings.deleteAllProjects,
              t.settings.deleteAllProjectsDesc,
              undefined,
              handleDeleteAllProjects,
              true,
            )}
          </>,
        )}
      </ScrollView>

      {renderThemeModal()}
      {renderLanguageModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
  },
  title: {
    ...Typography.display.h4,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.s,
  },
  sectionContent: {
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
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body.regular,
  },
  settingSubtitle: {
    ...Typography.body.small,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: Spacing.m,
  },
  settingValue: {
    ...Typography.body.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '99%',
    maxHeight: '75%',
    borderRadius: AppDimensions.cornerRadius.large,
    overflow: 'hidden',
  },
  languageModalContent: {
    maxHeight: '99%',
  },
  modalTitle: {
    ...Typography.display.h3,
    padding: Spacing.l,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.l,
    minHeight: 60,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    ...Typography.body.regular,
  },
  checkmark: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagImage: {
    width: 24,
    height: 16,
  },
});

export default SettingsScreen;
