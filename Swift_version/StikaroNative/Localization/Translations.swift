import Foundation

// MARK: - Translations

struct Translations {
    let common: Common
    let settings: Settings
    let export: Export
    let onboarding: Onboarding
    let home: Home
    let imagePicker: ImagePicker
    let editor: Editor
    let filters: Filters
    let textToolbar: TextToolbar
    let textTool: TextTool
    let stickers: Stickers
    let stamps: Stamps
    let watermark: Watermark
    let layers: Layers

    struct Common {
        let cancel: String
        let save: String
        let delete: String
        let close: String
        let done: String
        let back: String
        let ok: String
        let error: String
        let clear: String
        let discard: String
        let loading: String
    }

    struct Settings {
        let title: String
        let theme: String
        let themeLight: String
        let themeDark: String
        let themeSolar: String
        let themeMono: String
        let sound: String
        let soundOn: String
        let soundOff: String
        let haptics: String
        let hapticsOn: String
        let hapticsOff: String
        let language: String
        let account: String
        let preferences: String
        let appearance: String
        let about: String
        let dangerZone: String
        let restorePurchases: String
        let restorePurchasesDesc: String
        let exportAllProjects: String
        let exportAllProjectsDesc: String
        let defaultExportFormat: String
        let defaultExportQuality: String
        let autoSaveProjects: String
        let autoSaveProjectsDesc: String
        let hapticFeedback: String
        let hapticFeedbackDesc: String
        let version: String
        let rateApp: String
        let rateAppDesc: String
        let contactSupport: String
        let contactSupportDesc: String
        let privacyPolicy: String
        let privacyPolicyDesc: String
        let termsOfService: String
        let termsOfServiceDesc: String
        let clearCache: String
        let clearCacheDesc: String
        let clearCacheAlertMessage: String
        let clearCacheSuccess: String
        let deleteAllProjects: String
        let deleteAllProjectsDesc: String
        let deleteAllProjectsAlertMessage: String
        let deleteAllProjectsSuccess: String
        let resetOnboarding: String
        let exportAllProjectsAlertMessage: String
        let rateAppAlertMessage: String
        let contactSupportAlertMessage: String
        let privacyPolicyAlertMessage: String
        let termsOfServiceAlertMessage: String
    }

    struct Export {
        let saveToDevice: String
        let shareOnInstagram: String
        let shareOnX: String
        let savedToPhotos: String
        let savedToPhotosDesc: String
        let viewInGallery: String
        let noImageToExport: String
        let failedToExport: String
        let failedToSave: String
        let couldNotShareInstagram: String
        let couldNotShareX: String
    }

    struct Onboarding {
        let skip: String
        let panel1HeroTitle: String
        let panel1HeroWatermark: String
        let panel1Title: String
        let panel1Body: String
        let panel2GestureLabel: String
        let panel2SampleText: String
        let panel2Title: String
        let panel2Body: String
        let panel3Title: String
        let panel3Body: String
        let panel3FeatureAssets: String
        let panel3FeatureTools: String
        let panel3FeatureNoWatermarks: String
        let getStarted: String
    }

    struct Home {
        let emptyTitle: String
        let emptySubtitle: String
        let selectionTitle: String
        let deleteProjectsTitle: String
        let deleteProjectSingle: String
        let deleteProjectMultiple: String
        let timestampToday: String
        let timestampDayAgo: String
        let timestampDaysAgo: String
    }

    struct ImagePicker {
        let title: String
        let loadingSubtitle: String
        let photoAvailable: String
        let photosAvailable: String
        let loadingText: String
    }

    struct Editor {
        let backToGallery: String
        let export: String
        let saveChangesTitle: String
        let saveChangesMessage: String
        let noImageLoaded: String
        let paramsLabel: String
    }

    struct FilterNames {
        let none: String
        let bw: String
        let sepia: String
        let vintage: String
        let cool: String
        let warm: String
        let juno: String
        let gingham: String
        let clarendon: String
        let lark: String
        let ludwig: String
        let xproii: String
        let lofi: String
        let mayfair: String
        let sierra: String
        let tattoo: String
        let inkwell: String
        let rise: String
        let cinematic: String
        let film: String
        let hdr: String
        let portrait: String
        let landscape: String
        let neon: String
        let cyberpunk: String
        let retro: String
    }

    struct Filters {
        let title: String
        let intensity: String
        let apply: String
        let names: FilterNames
    }

    struct TextToolbarFonts {
        let system: String
        let archivo: String
        let bitcount: String
        let firaSans: String
        let homemade: String
    }

    struct TextToolbarColors {
        let white: String
        let black: String
        let red: String
        let orange: String
        let yellow: String
        let green: String
        let blue: String
        let purple: String
        let pink: String
    }

    struct TextToolbarEffects {
        let none: String
        let neon: String
        let glow: String
        let shadow: String
        let outline: String
    }

    struct TextToolbarBackgrounds {
        let none: String
        let black: String
        let white: String
        let gray: String
        let red: String
        let blue: String
    }

    struct TextToolbar {
        let fonts: TextToolbarFonts
        let colors: TextToolbarColors
        let effects: TextToolbarEffects
        let backgrounds: TextToolbarBackgrounds
    }

    struct TextTool {
        let title: String
        let placeholder: String
        let fontLabel: String
        let sizeLabel: String
        let colorLabel: String
        let addToCanvas: String
    }

    struct StickerCategories {
        let all: String
        let emoji: String
        let socialMedia: String
        let textLabels: String
        let seasonal: String
        let brandIcons: String
        let food: String
        let miscellaneous: String
    }

    struct Stickers {
        let title: String
        let emptyCategory: String
        let categories: StickerCategories
    }

    struct StampCategories {
        let all: String
        let approval: String
        let labels: String
        let seals: String
    }

    struct Stamps {
        let title: String
        let emptyCategory: String
        let categories: StampCategories
    }

    struct WatermarkDensities {
        let dense: String
        let moderate: String
        let sparse: String
    }

    struct WatermarkPresetStrings {
        let name: String
        let description: String
    }

    struct WatermarkPresets {
        let tilePattern: WatermarkPresetStrings
        let cornerBranding: WatermarkPresetStrings
        let diagonalStripe: WatermarkPresetStrings
        let scatteredProtection: WatermarkPresetStrings
        let minimalSingle: WatermarkPresetStrings
        let borderGuard: WatermarkPresetStrings
        let photographerStyle: WatermarkPresetStrings
        let denseGrid: WatermarkPresetStrings
        let moderateCoverage: WatermarkPresetStrings
        let largeWatermarks: WatermarkPresetStrings
        let smallWatermarks: WatermarkPresetStrings
        let microWatermarks: WatermarkPresetStrings
    }

    struct Watermark {
        let title: String
        let defaultText: String
        let textLabel: String
        let textPlaceholder: String
        let apply: String
        let backToPresets: String
        let globalAdjustments: String
        let opacity: String
        let size: String
        let rotation: String
        let confirmAdjustments: String
        let selectedPreset: String
        let markCount: String
        let densities: WatermarkDensities
        let presets: WatermarkPresets
    }

    struct LayerElementTypes {
        let text: String
        let sticker: String
        let watermark: String
        let stamp: String
        let element: String
    }

    struct Layers {
        let title: String
        let emptyTitle: String
        let emptySubtitle: String
        let layerCountSingle: String
        let layerCountMultiple: String
        let elementTypes: LayerElementTypes
    }
}
