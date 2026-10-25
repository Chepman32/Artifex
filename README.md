# Marqo

Marqo is a mobile photo editor for adding text, stickers, stamps, and watermarks to photos. It runs on iOS and Android, with iPad support on iOS. Photo editing, project storage, and export rendering happen on-device and work offline; App Store network access is used for subscription actions.

## Features

### Photo editing

- Import a photo from the device photo library.
- Add and style text with fonts, colors, effects, and backgrounds.
- Add categorized stickers and stamps, including language-specific artwork where available.
- Create text or image watermarks with reusable presets and patterns.
- Apply photo-filter presets and adjust their intensity.
- Move, scale, and rotate canvas elements with gestures; manage layers and use undo/redo.

### Projects and export

- Save and reopen projects from the on-device project gallery.
- Sort, duplicate, and select multiple projects for deletion.
- Export at the source photo's dimensions as PNG or JPEG, with adjustable JPEG quality.
- Save exports to the photo library or share them from the export screen.
- Free exports include a small Marqo logo. Marqo Pro removes it. An export that uses a Pro sticker or stamp requires an active Pro subscription.

### Marqo Pro

The paywall offers monthly and yearly auto-renewing subscriptions. It unlocks clean exports and premium sticker and stamp assets. Prices and introductory-offer eligibility are loaded from App Store product data when available. Purchases can be restored or managed through Apple.

The StoreKit purchase and restore integration is currently available on iOS. Android builds support the free editing and export flow, but Android subscription billing is not wired up yet.

### Languages and preferences

The interface supports 29 languages: Arabic, Czech, Danish, Dutch, English, Filipino, Finnish, French, German, Greek, Hebrew, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Malay, Norwegian, Polish, Portuguese (Brazil), Romanian, Russian, Spanish (Mexico), Swedish, Thai, Turkish, Ukrainian, Vietnamese, and Chinese (Simplified). Marqo detects the device language and also lets you choose a language in Settings.

Settings also include light, dark, solar, and mono themes, plus a haptic-feedback toggle.

## Privacy

Photos and projects are processed and stored locally. Marqo does not upload them to its servers, require an account, or include advertising or analytics trackers. Apple processes subscription purchases and renewals through the App Store.

See the [Marqo Privacy Policy](https://marqo-privacy-policy.anton-chepur.chatgpt.site) and [Apple's Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/).

## Technology

- React Native 0.81 and TypeScript
- React Native Skia for canvas rendering and export
- Reanimated and Gesture Handler for interactions and animation
- Zustand for application state
- Native StoreKit 2 bridge for iOS subscriptions

## Project layout

```
src/
├── assets/          # Fonts, stickers, stamps, and localized artwork
├── components/      # Canvas, editor controls, and modals
├── constants/       # Themes, filters, and asset catalogs
├── database/        # Local project persistence
├── hooks/           # Editor, theme, and localization hooks
├── localization/    # Translations and locale detection
├── screens/         # Onboarding, gallery, picker, editor, and settings
├── services/        # Subscription and billing integration
├── stores/          # Zustand state stores
├── types/           # Shared application types
└── utils/           # Import, gesture, watermark, and export helpers
```

## Development

### Requirements

- Node.js 20 or newer
- Yarn 4
- Android Studio and Android SDK for Android builds
- Xcode and CocoaPods for iOS builds

### Install and run

```bash
yarn install

# iOS native dependencies
cd ios
bundle install
bundle exec pod install
cd ..

# Start Metro
yarn start
```

In a second terminal, run a platform:

```bash
yarn ios
yarn android
```

The development server uses port 8082.

### Checks

```bash
yarn test
yarn lint
```

## License

Marqo is proprietary software. All rights reserved.
