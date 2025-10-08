// Editor screen - Main canvas for photo annotation

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEditorStore } from '../stores/editorStore';
import { SkiaCanvas } from '../components/SkiaCanvas';

import { StickerPickerModal } from '../components/modals/StickerPickerModal';
import { ExportModal } from '../components/modals/ExportModal';
import { WatermarkToolModal } from '../components/modals/WatermarkToolModal';

import { SizeSlider } from '../components/SizeSlider';
import {
  createTextElement,
  createStickerElement,
} from '../utils/canvasElements';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EditorRouteParams {
  projectId?: string;
  imageUri?: string;
  imageDimensions?: { width: number; height: number };
}

// Filters data
const FILTERS = [
  { id: 'none', name: 'Original', emoji: '📷', color: '#666666' },
  { id: 'bw', name: 'B&W', emoji: '⚫', color: '#888888' },
  { id: 'sepia', name: 'Sepia', emoji: '🟤', color: '#D2B48C' },
  { id: 'vintage', name: 'Vintage', emoji: '📸', color: '#F4A460' },
  { id: 'cool', name: 'Cool', emoji: '🧊', color: '#87CEEB' },
  { id: 'warm', name: 'Warm', emoji: '🔥', color: '#FFB347' },
];

// Seal stamps data
const SEAL_STAMPS = [
  {
    id: 'approved-147677',
    name: 'Approved',
    uri: require('../assets/stamps/approved-147677_640.png'),
  },
  {
    id: 'approved-1966719',
    name: 'Approved Alt',
    uri: require('../assets/stamps/approved-1966719_640.png'),
  },
  {
    id: 'approved-1966719-1',
    name: 'Approved Alt 2',
    uri: require('../assets/stamps/approved-1966719_640 (1).png'),
  },
  {
    id: 'best-seller',
    name: 'Best Seller',
    uri: require('../assets/stamps/best-seller-158885_1280.png'),
  },
  {
    id: 'cancelled',
    name: 'Cancelled',
    uri: require('../assets/stamps/cancelled-5250908_640.png'),
  },
  {
    id: 'do-not-copy',
    name: 'Do Not Copy',
    uri: require('../assets/stamps/do-not-copy-160138_640.png'),
  },
  {
    id: 'draft',
    name: 'Draft',
    uri: require('../assets/stamps/draft-160133_640.png'),
  },
  {
    id: 'label',
    name: 'Label',
    uri: require('../assets/stamps/label-5419657_640.png'),
  },
  {
    id: 'original',
    name: 'Original',
    uri: require('../assets/stamps/original-160130_640.png'),
  },
  {
    id: 'paid-160126',
    name: 'Paid',
    uri: require('../assets/stamps/paid-160126_640.png'),
  },
  {
    id: 'paid-5025785',
    name: 'Paid Alt',
    uri: require('../assets/stamps/paid-5025785_640.png'),
  },
  {
    id: 'quality-5254406',
    name: 'Quality',
    uri: require('../assets/stamps/quality-5254406_640.png'),
  },
  {
    id: 'quality-5254458',
    name: 'Quality Alt',
    uri: require('../assets/stamps/quality-5254458_640.png'),
  },
  {
    id: 'real-stamp',
    name: 'Real Stamp',
    uri: require('../assets/stamps/real-stamp-7823814_640.png'),
  },
  {
    id: 'received',
    name: 'Received',
    uri: require('../assets/stamps/received-160122_640.png'),
  },
  {
    id: 'red',
    name: 'Red Stamp',
    uri: require('../assets/stamps/red-42286_640.png'),
  },
  {
    id: 'seal',
    name: 'Seal',
    uri: require('../assets/stamps/seal-1771694_640.png'),
  },
  {
    id: 'sold',
    name: 'Sold',
    uri: require('../assets/stamps/sold-5250892_640.png'),
  },
  {
    id: 'stamp',
    name: 'Stamp',
    uri: require('../assets/stamps/stamp-161691_640.png'),
  },
  {
    id: 'success',
    name: 'Success',
    uri: require('../assets/stamps/success-5025797_640.png'),
  },
  {
    id: 'winner',
    name: 'Winner',
    uri: require('../assets/stamps/winner-5257940_640.png'),
  },
];

const EditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as EditorRouteParams;

  const {
    canvasElements,
    selectedElementId,
    sourceImagePath,
    sourceImageDimensions,
    appliedFilter, // Used in SkiaCanvas via store and filter toolbar
    canUndo,
    canRedo,
    undo,
    redo,
    loadProject,
    initializeProject,
    saveProject,
    addElement,
    updateElement,
    deleteElement,
    applyFilter,
    removeFilter,
  } = useEditorStore();

  const [activeToolbar, setActiveToolbar] = useState<
    'watermark' | 'text' | 'sticker' | 'stamps' | 'filter' | null
  >(null);

  // Animated values for toolbar
  const activeToolIndex = useSharedValue(-1); // No tool selected by default
  const [showCanvasTextInput, setShowCanvasTextInput] = useState(false);
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const [watermarkModalVisible, setWatermarkModalVisible] = useState(false);

  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    console.log('EditorScreen received params:', params);

    if (params?.projectId) {
      // Load existing project
      console.log('Loading existing project:', params.projectId);
      loadProject(params.projectId);
    } else if (params?.imageUri && params?.imageDimensions) {
      // Initialize new project
      console.log('Initializing new project with image:', params.imageUri);
      initializeProject(params.imageUri, params.imageDimensions);
    } else {
      console.log('No valid params received');
    }
  }, [initializeProject, loadProject, params]);

  const handleBack = async () => {
    // Check if there are unsaved changes
    if (canvasElements.length > 0) {
      Alert.alert(
        'Save Changes?',
        'You have unsaved changes. Do you want to save this project before leaving?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Save',
            onPress: async () => {
              await saveProject();
              navigation.goBack();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleExport = () => {
    setExportModalVisible(true);
  };

  const handleDeleteElement = () => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
    }
  };

  const handleToolSelect = (tool: typeof activeToolbar) => {
    setActiveToolbar(tool);

    // Update animated indicator position
    const toolIndex = tool
      ? ['watermark', 'text', 'sticker', 'stamps', 'filter'].indexOf(tool)
      : -1;
    activeToolIndex.value = withSpring(toolIndex, {
      damping: 15.0,
      stiffness: 150.0,
    });

    // Add element to canvas based on tool type
    switch (tool) {
      case 'text':
        setShowCanvasTextInput(true);
        break;
      case 'watermark':
        setWatermarkModalVisible(true);
        break;
      case 'sticker':
        setStickerModalVisible(true);
        break;
      case 'stamps':
        // Stamps tool shows horizontal scrolling toolbar - no modal needed
        break;
      case 'filter':
        // Filter tool shows horizontal scrolling toolbar - no modal needed
        break;
    }
  };

  const handleAddText = (
    text: string,
    fontFamily: string,
    fontSize: number,
    color: string,
  ) => {
    const canvasSize = calculateCanvasSize();
    const element = createTextElement(
      text,
      fontFamily,
      fontSize,
      color,
      canvasSize.width / 2 - 100,
      canvasSize.height / 2 - fontSize,
    );
    addElement(element);
  };

  const [canvasTextValue, setCanvasTextValue] = useState('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const submissionRef = useRef(false);

  const handleCanvasTextSubmit = () => {
    if (submissionRef.current) {
      return; // Prevent double submission
    }

    submissionRef.current = true;

    if (canvasTextValue.trim()) {
      if (editingTextId) {
        // Update existing text element
        updateElement(editingTextId, {
          textContent: canvasTextValue,
        });
      } else {
        // Add new text element
        handleAddText(canvasTextValue, 'System', 24, Colors.text.primary);
      }
    }

    // Clear text editing state
    setCanvasTextValue('');
    setShowCanvasTextInput(false);
    setEditingTextId(null);

    // Deactivate text tool after editing
    setActiveToolbar(null);
    activeToolIndex.value = withSpring(-1, {
      damping: 15.0,
      stiffness: 150.0,
    });

    // Reset flag after component updates
    setTimeout(() => {
      submissionRef.current = false;
    }, 50);
  };

  const handleTextElementEdit = (elementId: string, currentText: string) => {
    console.log('handleTextElementEdit called:', elementId, currentText);

    // Set the text tool as active when editing existing text
    setActiveToolbar('text');
    activeToolIndex.value = withSpring(1, {
      // Text tool is at index 1
      damping: 15.0,
      stiffness: 150.0,
    });

    // Set up editing state
    setEditingTextId(elementId);
    setCanvasTextValue(currentText);
    setShowCanvasTextInput(true);
  };

  const handleAddSticker = (uri: string, width: number, height: number) => {
    const canvasSize = calculateCanvasSize();
    const element = createStickerElement(
      uri,
      canvasSize.width / 2 - width / 2,
      canvasSize.height / 2 - height / 2,
      width,
      height,
    );
    addElement(element);
  };

  const handleAddStamp = (stampRequire: any) => {
    const canvasSize = calculateCanvasSize();
    // Default stamp size
    const stampSize = 80;

    // Convert require object to URI string
    const resolvedAsset = Image.resolveAssetSource(stampRequire);
    const stampUri = resolvedAsset.uri;

    const element = createStickerElement(
      stampUri,
      canvasSize.width / 2 - stampSize / 2,
      canvasSize.height / 2 - stampSize / 2,
      stampSize,
      stampSize,
    );
    addElement(element);

    // Deactivate stamps tool after adding
    setActiveToolbar(null);
    activeToolIndex.value = withSpring(-1, {
      damping: 15.0,
      stiffness: 150.0,
    });
  };

  const handleFilterSelect = (filterId: string) => {
    console.log('Filter selected:', filterId);

    if (filterId === 'none') {
      removeFilter();
      console.log('Filter removed');
    } else {
      const filter = {
        id: filterId,
        name: filterId,
        intensity: 1,
        type: filterId as any,
      };
      applyFilter(filter);
      console.log('Filter applied:', filter);
    }

    // Deactivate filter tool after applying
    setActiveToolbar(null);
    activeToolIndex.value = withSpring(-1, {
      damping: 15.0,
      stiffness: 150.0,
    });
  };

  const handleAddWatermark = (uri: string, width: number, height: number) => {
    const canvasSize = calculateCanvasSize();
    // Handle custom text watermarks
    if (uri.startsWith('text:')) {
      const text = uri.replace('text:', '');
      const element = createTextElement(
        text,
        'System',
        16,
        '#FFFFFF',
        canvasSize.width - 220,
        canvasSize.height - 60,
      );
      addElement(element);
    } else {
      // Handle template watermarks
      const element = createStickerElement(
        uri,
        canvasSize.width - width - 20,
        canvasSize.height - height - 20,
        width,
        height,
      );
      addElement(element);
    }
  };

  const handleSizeChange = (newScale: number) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { scale: newScale });
    }
  };

  // Get selected element for slider
  const selectedElement = canvasElements.find(
    el => el.id === selectedElementId,
  );
  const currentScale = selectedElement?.scale || 1;

  const calculateCanvasSize = () => {
    if (!sourceImageDimensions) return { width: screenWidth, height: 300 };

    const availableHeight = screenHeight - 200; // Account for top bar and toolbar
    const aspectRatio =
      sourceImageDimensions.width / sourceImageDimensions.height;

    let canvasWidth = screenWidth;
    let canvasHeight = canvasWidth / aspectRatio;

    if (canvasHeight > availableHeight) {
      canvasHeight = availableHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }

    return { width: canvasWidth, height: canvasHeight };
  };

  const canvasSize = calculateCanvasSize();

  // Animated style for the active indicator
  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeToolIndex.value,
      [-1, 0, 1, 2, 3, 4],
      [-100, 0, 1, 2, 3, 4].map((i, index) =>
        index === 0 ? -100 : (screenWidth / 5) * i + screenWidth / 10 - 14,
      ), // Hide indicator when no tool selected (-1), center each tool otherwise
    );
    return {
      transform: [{ translateX }],
      opacity: activeToolIndex.value === -1 ? 0 : 1,
    };
  });

  const renderToolIcon = (
    tool: typeof activeToolbar,
    icon: string,
    _label: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.toolButton,
        activeToolbar === tool && styles.toolButtonActive,
      ]}
      onPress={() => handleToolSelect(tool)}
    >
      <Text
        style={[
          styles.toolIcon,
          activeToolbar === tool && styles.toolIconActive,
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              !canUndo() && styles.historyButtonDisabled,
            ]}
            onPress={undo}
            disabled={!canUndo()}
          >
            <Text style={styles.historyIcon}>↶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              !canRedo() && styles.historyButtonDisabled,
            ]}
            onPress={redo}
            disabled={!canRedo()}
          >
            <Text style={styles.historyIcon}>↷</Text>
          </TouchableOpacity>

          {/* Delete button - only visible when element is selected */}
          {selectedElementId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteElement}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Canvas Container */}
        <View style={styles.canvasContainer}>
          {sourceImagePath ? (
            <View style={styles.canvasWrapper}>
              <SkiaCanvas
                sourceImageUri={sourceImagePath}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                onTextEdit={handleTextElementEdit}
              />

              {/* Text Input - positioned over canvas without backdrop */}
              {showCanvasTextInput && (
                <View
                  style={[
                    styles.canvasTextOverlay,
                    { width: canvasSize.width, height: canvasSize.height },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.transparentOverlay}
                    onPress={handleCanvasTextSubmit}
                  />
                  <View style={styles.textInputWrapper}>
                    <TextInput
                      style={styles.canvasTextInput}
                      placeholder="Enter text..."
                      placeholderTextColor="rgba(255, 255, 255, 0.8)"
                      value={canvasTextValue}
                      onChangeText={setCanvasTextValue}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleCanvasTextSubmit}
                      multiline
                    />
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.canvas,
                { width: canvasSize.width, height: canvasSize.height },
              ]}
            >
              <View style={styles.emptyCanvas}>
                <Text style={styles.emptyCanvasText}>No image loaded</Text>
                <Text style={styles.emptyCanvasText}>
                  Params: {JSON.stringify(params)}
                </Text>
              </View>
            </View>
          )}

          {/* Size Slider - appears when element is selected */}
          <SizeSlider
            visible={!!selectedElementId}
            initialValue={currentScale}
            onValueChange={handleSizeChange}
            position={{
              x: -canvasSize.width / 2.3,
              y: -canvasSize.height / 7,
            }}
          />
        </View>

        {/* Tool Toolbar - will be pushed above keyboard by KeyboardAvoidingView */}
        <View style={styles.toolbar}>
          {activeToolbar === 'stamps' ? (
            // Stamps horizontal scrolling toolbar
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stampsScrollContainer}
              style={styles.stampsScrollView}
            >
              {SEAL_STAMPS.map(stamp => (
                <TouchableOpacity
                  key={stamp.id}
                  style={styles.stampButton}
                  onPress={() => handleAddStamp(stamp.uri)}
                >
                  <Image source={stamp.uri} style={styles.stampPreview} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : activeToolbar === 'filter' ? (
            // Filters horizontal scrolling toolbar
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContainer}
              style={styles.filtersScrollView}
            >
              {FILTERS.map(filter => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    appliedFilter?.id === filter.id &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterSelect(filter.id)}
                >
                  <View
                    style={[
                      styles.filterPreview,
                      { backgroundColor: filter.color },
                    ]}
                  >
                    <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                  </View>
                  <Text style={styles.filterName}>{filter.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            // Regular tool icons
            <>
              <View style={styles.toolContainer}>
                {renderToolIcon('watermark', '💧', 'Watermark')}
                {renderToolIcon('text', 'T', 'Text')}
                {renderToolIcon('sticker', '🎨', 'Sticker')}
                {renderToolIcon('stamps', '🔖', 'Stamps')}
                {renderToolIcon('filter', '🖼️', 'Filter')}
              </View>

              {/* Active indicator */}
              <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Sticker Picker Modal */}
      <StickerPickerModal
        visible={stickerModalVisible}
        onClose={() => setStickerModalVisible(false)}
        onSelect={handleAddSticker}
      />

      {/* Watermark Tool Modal */}
      <WatermarkToolModal
        visible={watermarkModalVisible}
        onClose={() => setWatermarkModalVisible(false)}
        onSelect={handleAddWatermark}
      />

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
    marginRight: 4,
  },
  backText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
  },
  historyButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  historyButtonDisabled: {
    opacity: 0.3,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#FF4444',
  },
  historyIcon: {
    fontSize: 20,
    color: Colors.text.primary,
  },
  exportButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
  },
  exportText: {
    ...Typography.body.regular,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.m,
  },
  canvasWrapper: {
    position: 'relative',
  },
  canvas: {
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyCanvas: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    width: 200,
    alignItems: 'center',
  },
  emptyCanvasText: {
    ...Typography.body.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  canvasTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  transparentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // No background color - completely transparent
  },
  textInputWrapper: {
    // No background - transparent wrapper
    borderRadius: 8,
    padding: Spacing.s,
    minWidth: 200,
    maxWidth: 300,
  },
  canvasTextInput: {
    ...Typography.body.regular,
    color: '#FFFFFF',
    fontSize: 24,
    minHeight: 40,
    textAlignVertical: 'center',
    backgroundColor: 'transparent', // No background
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle border for visibility
    borderRadius: 4,
  },
  toolbar: {
    height: 48,
    backgroundColor: Colors.backgrounds.secondary,
    paddingHorizontal: Spacing.m,
    justifyContent: 'center',
  },
  toolContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs,
    minWidth: 60,
  },
  toolButtonActive: {
    // Active state styling will be handled by indicator
  },
  toolIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  toolIconActive: {
    opacity: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 3,
    backgroundColor: Colors.accent.primary,
    borderRadius: 1.5,
  },
  stampsScrollView: {
    flex: 1,
  },
  stampsScrollContainer: {
    paddingHorizontal: Spacing.s,
    alignItems: 'center',
    minHeight: 48,
  },
  stampButton: {
    marginHorizontal: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stampPreview: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  filtersScrollView: {
    flex: 1,
  },
  filtersScrollContainer: {
    paddingHorizontal: Spacing.s,
    alignItems: 'center',
    minHeight: 48,
  },
  filterButton: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    padding: Spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  filterPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterName: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
    fontSize: 10,
  },
});

export default EditorScreen;
