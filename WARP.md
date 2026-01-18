# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Stikaro is a premium iOS photo annotation app built with React Native. It's an offline-first application for adding watermarks, text, stickers, and stamps to photos with gesture-driven editing. The app emphasizes 60fps animations, privacy-first design, and uses React Native Skia for high-performance 2D graphics rendering.

## Essential Commands

### Development Workflow
```bash
# Install dependencies (first time or after package.json changes)
yarn install
cd ios && bundle install && bundle exec pod install && cd ..

# Start Metro bundler (always with reset cache for Skia/Reanimated)
yarn start --reset-cache

# Run on iOS (in separate terminal)
npx react-native run-ios --simulator="iPhone 16 Pro" 

# Run specific configuration
yarn ios --configuration Debug
yarn ios --configuration Release
```

### Code Quality
```bash
# Run linter
yarn lint

# Run tests
yarn test

# Format code (auto-formats on save with Prettier config)
yarn format      # If configured in package.json
```

### Troubleshooting Common Issues
```bash
# Clean build (if iOS build fails or after native dependency changes)
cd ios && rm -rf build && pod install && cd ..
yarn ios

# Clear Metro cache (if seeing stale Reanimated/Skia code)
yarn start --reset-cache

# Reset iOS simulator
xcrun simctl erase all
```

## Architecture Overview

### Technology Stack
- **React Native 0.81+** - Cross-platform framework
- **React Native Reanimated 3.6+** - All animations run on UI thread via worklets for 60fps performance
- **React Native Skia 1.0+** - High-performance 2D graphics, used for canvas rendering and image export
- **Zustand 4.5+** - Lightweight state management (no Redux)
- **AsyncStorage** - Local persistence for projects and app state (instead of MMKV as originally planned)
- **TypeScript 5.3+** - Strictly typed codebase

### Key Architectural Patterns

#### State Management with Zustand
Three main stores in `src/stores/`:
- **appStore.ts**: Global app state (Pro status, onboarding, user preferences). Persisted with AsyncStorage.
- **editorStore.ts**: Canvas state (elements, history, undo/redo). Complex state with serialization to support project saving.
- **projectGalleryStore.ts**: Project list management (CRUD operations, selection mode, sorting).

All stores use Zustand's simple API: `create<StateInterface>()((set, get) => ({ ... }))`

#### Canvas Architecture
The editor uses a hybrid approach:
- **React Native views** for gesture handling (via `react-native-gesture-handler`)
- **Skia Canvas** (`SkiaCanvas.tsx`) for rendering all canvas elements at high performance
- **Element types**: `TextElement`, `StickerElement`, watermarks, stamps - all extend `CanvasElement` interface

Canvas elements have two representations:
1. **CanvasElement** (in-memory, for editing with radians for rotation)
2. **SerializedElement** (for persistence, with degrees for rotation and normalized 0-1 positions)

Conversion happens in `src/utils/canvasElements.ts`

#### Image Export System
Located in `src/utils/imageExporter.ts`:
1. Creates Skia surface matching source image dimensions
2. Draws source image with optional filter (Skia ColorMatrix)
3. Draws all canvas elements using Skia primitives
4. Optionally adds "Made with Stikaro" watermark for free users
5. Encodes to PNG/JPEG and saves to temp directory
6. Returns file path for sharing/saving to Photos

**Critical**: All text must be rasterized first (see `textRasterizer.ts`) because Skia text rendering requires careful font handling and platform-specific considerations.

#### Animation System
**Must-follow rule**: Reanimated plugin MUST be last in `babel.config.js` plugins array, and App.tsx MUST import 'react-native-reanimated' first before anything else.

All animations use:
- `useSharedValue()` for animated values on UI thread
- `useAnimatedStyle()` for style animations
- `withSpring()` for natural physics-based animations
- `withTiming()` for controlled transitions
- `runOnUI()` for worklets when needed

Gestures use `react-native-gesture-handler`:
- `GestureDetector` with `Gesture.Pan()`, `Gesture.Pinch()`, `Gesture.Rotation()`
- `Gesture.Simultaneous()` to compose multi-touch gestures
- All gesture callbacks update shared values directly (runs on UI thread)

#### Watermark System
Complex system in `src/utils/watermarkManager.ts`:
- 12 preset configurations with different patterns (grid, diagonal, scattered, corners, edges)
- Pattern types: tile, diagonal stripe, scattered protection, border guard, etc.
- Each preset generates multiple watermark instances based on canvas size
- Global adjustments (opacity, scale, rotation) applied to all instances
- Converts to canvas elements for editing
- Full documentation in `docs/WATERMARK_SYSTEM_DOCUMENTATION.md`

### Project Structure Insights

```
src/
├── components/
│   ├── canvas/              # Canvas element components (TextElement, StickerElement)
│   ├── modals/              # BottomSheet base + tool modals (TextToolModal, etc)
│   ├── Button.tsx           # Base button with haptic feedback
│   ├── SkiaCanvas.tsx       # Main Skia rendering canvas
│   └── ShimmerOverlay.tsx   # For locked Pro features
├── constants/
│   ├── colors.ts            # Dark-mode-first color system
│   ├── typography.ts        # SF Pro font scale
│   ├── spacing.ts           # 8pt grid system
│   └── watermarkPresets.ts  # 12 watermark preset configurations
├── database/
│   └── ProjectDatabase.ts   # AsyncStorage wrapper for project CRUD
├── hooks/
│   └── useCanvasGestures.ts # Gesture logic for canvas manipulation
├── navigation/
│   └── AppNavigator.tsx     # React Navigation stack setup
├── screens/                 # 7 main screens
│   ├── SplashScreen.tsx     # 2.8s physics animation
│   ├── OnboardingScreen.tsx # 3-panel carousel
│   ├── HomeScreen.tsx       # Project gallery
│   ├── EditorScreen.tsx     # Main canvas editor (complex)
│   ├── ImagePickerScreen.tsx
│   ├── SettingsScreen.tsx
│   └── PaywallScreen.tsx
├── stores/                  # Zustand stores (3 files)
├── types/
│   ├── index.ts             # Core types (Project, CanvasElement, etc)
│   └── watermark.ts         # Watermark-specific types
└── utils/
    ├── animations.ts        # Reanimated helpers
    ├── assetLoader.ts       # Load bundled assets
    ├── canvasElements.ts    # Element factories and conversions
    ├── colorMatrix.ts       # Skia ColorMatrix filters (25+ filters)
    ├── haptics.ts           # Haptic feedback wrappers
    ├── imageExporter.ts     # Skia-based export system
    ├── textRasterizer.ts    # Text to Skia image conversion
    └── watermarkManager.ts  # Watermark preset system
```

## Critical Implementation Details

### Reanimated Setup
1. Import must be first in App.tsx: `import 'react-native-reanimated';`
2. Babel plugin must be last: `plugins: ['react-native-reanimated/plugin']`
3. Always run Metro with `--reset-cache` after Reanimated changes

### Skia Image Handling
- Images must be loaded into Skia format using `Skia.Image.MakeImageFromEncoded()`
- Base64 encoding: Use `RNFS.readFile(path, 'base64')` then decode
- Text rendering: Always use `textRasterizer.ts` for platform consistency
- Filter effects: Use `colorMatrix.ts` which provides 25+ filters as Skia ColorMatrix arrays

### iOS Permissions
The app requires careful permission handling:
- Photos: Read access for selection, write for saving exports
- Camera: Optional, only when user initiates
- Info.plist keys must be present (see `ios/Stikaro/Info.plist`)

### Canvas Element Coordinates
**Critical**: Canvas elements use normalized positions (0-1 range) when serialized, but absolute positions when editing.
- Serialization: `position: { x: element.x / canvasWidth, y: element.y / canvasHeight }`
- Deserialization: `position: { x: normalized.x * canvasWidth, y: normalized.y * canvasHeight }`
- This ensures projects work across different screen sizes and orientations

### History/Undo System
Located in `editorStore.ts`:
- Supports actions: add, update, delete, batchAdd, filter, reorder
- Stores both oldState and newState for bidirectional navigation
- History index tracks current position in history array
- Undo applies reverse action, redo reapplies forward action
- History is NOT persisted (only current state saved to project)

## Design System

### Colors (Dark Mode First)
- Primary Background: `#0F0F12` (near black with blue tint)
- Secondary Background: `#1A1A1D` (elevated surfaces)
- Accent Gold: `#D4AF37` (CTAs, Pro features)
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0A0`

All colors in `src/constants/colors.ts` and theme system in `src/constants/themes.ts`

### Typography
- Font: SF Pro (system font)
- Scale: Hero (36pt) → H1 (32pt) → H2 (28pt) → Body (17pt) → Caption (13pt)
- Supports iOS Dynamic Type for accessibility

### Spacing
8pt grid system: 4, 8, 12, 16, 24, 32, 48, 64
Use constants from `src/constants/spacing.ts`

## Known Issues & TODOs

From README.md:
- Watermarks not visible on exported image (FIXED per docs)
- Sepia filter exports broken
- Mayfair and Rise filters have wrong effect
- Lo-Fi filter effect should be stronger
- Need to add opacity slider for watermarks
- Need feeling/resizing button
- Watermark modal slider gestures need work
- Stamps and Stickers need categorization

## Testing

- Test files: `__tests__/` directory with Jest
- Run: `yarn test`
- Currently minimal test coverage
- E2E tests available via Detox but require setup: `yarn test:e2e`

## Working with Native Dependencies

When adding/updating native dependencies:
1. Add to package.json
2. Run `yarn install`
3. Run `cd ios && pod install && cd ..`
4. Clean build: `cd ios && rm -rf build && cd ..`
5. Restart Metro with `--reset-cache`

Common native deps in use:
- `@shopify/react-native-skia` - Graphics rendering
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Gestures
- `@react-native-camera-roll/camera-roll` - Photo library
- `react-native-fs` - File system operations
- `react-native-haptic-feedback` - Haptics

## Performance Considerations

1. **Canvas Performance**: Keep element count under 100 for smooth 60fps
2. **Image Export**: Large images (>4000px) may take 1-2 seconds
3. **Filters**: Skia ColorMatrix filters are fast; apply before exporting, not during editing
4. **Animations**: All UI animations must use Reanimated worklets, never setState
5. **Asset Loading**: Bundle assets in app; no network requests except IAP

## Privacy & Offline-First

- **No analytics**: No Firebase, Mixpanel, or tracking
- **No network**: App works entirely offline except IAP
- **Local storage**: All data in AsyncStorage, photos in iOS sandbox
- **No cloud sync**: Planned for v2.0 but currently fully local

## Development Workflow Tips

1. Always use `yarn start --reset-cache` to avoid stale Skia/Reanimated code
2. Test on physical device for accurate performance metrics (animations, gestures)
3. Use Flipper for debugging (built into React Native)
4. Use Xcode Instruments for performance profiling
5. Check `docs/` folder for detailed documentation on specific features
6. The codebase follows React Native 0.81 patterns (latest as of development)

## Module Resolution

TypeScript extends `@react-native/typescript-config` with default settings. No custom path aliases configured. Use relative imports.

## Important Files for Context

When working on specific features, refer to:
- Watermarks: `docs/WATERMARK_SYSTEM_DOCUMENTATION.md`
- Canvas: `docs/CANVAS_BOUNDS_FIX.md`, `docs/CANVAS_AND_PICKER_FIXES.md`
- Text editing: `docs/LIVE_TEXT_EDITING.md`, `docs/TEXT_TOOLBAR_IMPLEMENTATION.md`
- Filters: `docs/FILTERS_IMPLEMENTATION.md`
- Quick reference: `docs/QUICK_START.md`
- Full specification: `docs/SDD.md` (Software Design Document)
