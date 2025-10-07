// Editor screen - Main canvas for photo annotation

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  TextInput,
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
import { FilterToolModal } from '../components/modals/FilterToolModal';
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

const EditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as EditorRouteParams;

  const {
    canvasElements,
    selectedElementId,
    sourceImagePath,
    sourceImageDimensions,
    canUndo,
    canRedo,
    undo,
    redo,
    loadProject,
    initializeProject,
    saveProject,
    addElement,
    updateElement,
  } = useEditorStore();

  const [activeToolbar, setActiveToolbar] = useState<
    'watermark' | 'text' | 'sticker' | 'stamp' | 'filter'
  >('text');

  // Animated values for toolbar
  const activeToolIndex = useSharedValue(1); // Text is default (index 1)
  const [showCanvasTextInput, setShowCanvasTextInput] = useState(false);
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const [watermarkModalVisible, setWatermarkModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Size slider state
  const [sliderPosition, setSliderPosition] = useState({ x: 0, y: 0 });

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
  }, [params]);

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

  const handleToolSelect = (tool: typeof activeToolbar) => {
    setActiveToolbar(tool);

    // Update animated indicator position
    const toolIndex = [
      'watermark',
      'text',
      'sticker',
      'stamp',
      'filter',
    ].indexOf(tool);
    activeToolIndex.value = withSpring(toolIndex, {
      damping: 15,
      stiffness: 150,
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
      case 'stamp':
        setStickerModalVisible(true); // Use same picker for stamps
        break;
      case 'filter':
        setFilterModalVisible(true);
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
  const submissionRef = useRef(false);

  const handleCanvasTextSubmit = () => {
    if (submissionRef.current) {
      return; // Prevent double submission
    }

    submissionRef.current = true;

    if (canvasTextValue.trim()) {
      handleAddText(canvasTextValue, 'System', 24, Colors.text.primary);
    }

    setCanvasTextValue('');
    setShowCanvasTextInput(false);

    // Reset flag after component updates
    setTimeout(() => {
      submissionRef.current = false;
    }, 50);
  };

  const handleCanvasTextCancel = () => {
    setCanvasTextValue('');
    setShowCanvasTextInput(false);
    submissionRef.current = false;
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

  const handleApplyFilter = (filterId: string, intensity: number) => {
    // TODO: Implement filter application with Skia shaders
    // For now, just log the filter selection
    console.log('Applying filter:', filterId, 'with intensity:', intensity);
    // This would modify the source image or add a filter layer to the canvas
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
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4].map(i => (screenWidth / 5) * i + screenWidth / 10 - 14), // Center each tool
    );
    return {
      transform: [{ translateX }],
    };
  });

  const renderToolIcon = (
    tool: typeof activeToolbar,
    icon: string,
    label: string,
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
      <Text
        style={[
          styles.toolLabel,
          activeToolbar === tool && styles.toolLabelActive,
        ]}
      >
        {label}
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
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        {sourceImagePath ? (
          <View style={{ position: 'relative' }}>
            <SkiaCanvas
              sourceImageUri={sourceImagePath}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />

            {/* Canvas Text Input - appears when text tool is active */}
            {showCanvasTextInput && (
              <View
                style={[
                  styles.canvasTextInputContainer,
                  {
                    width: canvasSize.width,
                    height: canvasSize.height,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.canvasTextInputOverlay}
                  onPress={handleCanvasTextSubmit}
                />
                <View style={styles.canvasTextInputWrapper}>
                  <TextInput
                    style={styles.canvasTextInput}
                    placeholder="Tap to add text..."
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={canvasTextValue}
                    onChangeText={setCanvasTextValue}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCanvasTextSubmit}
                    blurOnSubmit={true}
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
            x: canvasSize.width + 20, // Position to the right of canvas
            y: 50, // Vertical position
          }}
        />
      </View>

      {/* Tool Toolbar - hidden when canvas text input is active */}
      {!showCanvasTextInput && (
        <View style={styles.toolbar}>
          <View style={styles.toolContainer}>
            {renderToolIcon('watermark', '💧', 'Watermark')}
            {renderToolIcon('text', 'T', 'Text')}
            {renderToolIcon('sticker', '🎨', 'Sticker')}
            {renderToolIcon('stamp', '⭐', 'Stamp')}
            {renderToolIcon('filter', '🖼️', 'Filter')}
          </View>

          {/* Active indicator */}
          <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
        </View>
      )}

      {/* Text Tool Modal - Replaced with canvas text input */}

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

      {/* Filter Tool Modal */}
      <FilterToolModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilter}
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
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.m,
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
  toolbar: {
    height: 72,
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
    padding: Spacing.xs,
    minWidth: 60,
  },
  toolButtonActive: {
    // Active state styling will be handled by indicator
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  toolIconActive: {
    opacity: 1,
  },
  toolLabel: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
    fontSize: 10,
  },
  toolLabelActive: {
    color: Colors.accent.primary,
    fontWeight: '600',
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
  canvasTextInputContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  canvasTextInputOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  canvasTextInputWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: Spacing.m,
    minWidth: 200,
    maxWidth: 300,
  },
  canvasTextInput: {
    ...Typography.body.regular,
    color: '#FFFFFF',
    fontSize: 24,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.s,
  },
});

export default EditorScreen;
