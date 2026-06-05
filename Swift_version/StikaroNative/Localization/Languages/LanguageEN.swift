import Foundation

enum LanguageEN {
    static let translations = Translations(
        common: .init(
            cancel: "Cancel",
            save: "Save",
            delete: "Delete",
            close: "Close",
            done: "Done",
            back: "Back",
            ok: "OK",
            error: "Error",
            clear: "Clear",
            discard: "Discard",
            loading: "Loading..."
        ),
        settings: .init(
            title: "Settings",
            theme: "Theme",
            themeLight: "Light",
            themeDark: "Dark",
            themeSolar: "Solar",
            themeMono: "Mono",
            sound: "Sound",
            soundOn: "On",
            soundOff: "Off",
            haptics: "Haptics",
            hapticsOn: "On",
            hapticsOff: "Off",
            language: "Language",
            account: "Account",
            preferences: "Preferences",
            appearance: "Appearance",
            about: "About",
            dangerZone: "Danger Zone",
            restorePurchases: "Restore Purchases",
            restorePurchasesDesc: "For users who purchased Pro on another device",
            exportAllProjects: "Export All Projects",
            exportAllProjectsDesc: "Batch export all projects to Photos",
            defaultExportFormat: "Default Export Format",
            defaultExportQuality: "Default Export Quality",
            autoSaveProjects: "Auto-Save Projects",
            autoSaveProjectsDesc: "Automatically save every 30 seconds",
            hapticFeedback: "Haptic Feedback",
            hapticFeedbackDesc: "Vibration for interactions",
            version: "Version",
            rateApp: "Rate Stikaro",
            rateAppDesc: "Help us improve with your feedback",
            contactSupport: "Contact Support",
            contactSupportDesc: "Get help or report issues",
            privacyPolicy: "Privacy Policy",
            privacyPolicyDesc: "View our privacy policy",
            termsOfService: "Terms of Service",
            termsOfServiceDesc: "View terms of service",
            clearCache: "Clear Cache",
            clearCacheDesc: "Remove cached thumbnails and temporary files",
            clearCacheAlertMessage: "This will remove cached thumbnails and temporary files. Continue?",
            clearCacheSuccess: "Cache cleared",
            deleteAllProjects: "Delete All Projects",
            deleteAllProjectsDesc: "Permanently delete all projects",
            deleteAllProjectsAlertMessage: "This will permanently delete all projects. This cannot be undone. Continue?",
            deleteAllProjectsSuccess: "All projects deleted",
            resetOnboarding: "Reset onboarding",
            exportAllProjectsAlertMessage: "This Pro feature will be implemented",
            rateAppAlertMessage: "This will open the App Store rating dialog",
            contactSupportAlertMessage: "This will open email composer to support@stikaro.app",
            privacyPolicyAlertMessage: "This will open stikaro.app/privacy",
            termsOfServiceAlertMessage: "This will open stikaro.app/terms"
        ),
        export: .init(
            saveToDevice: "Save on device",
            shareOnInstagram: "Share on Instagram",
            shareOnX: "Share on X",
            savedToPhotos: "Saved to Photos",
            savedToPhotosDesc: "Your image has been saved to gallery.",
            viewInGallery: "View in gallery",
            noImageToExport: "No image to export",
            failedToExport: "Failed to export image",
            failedToSave: "Failed to save image to Photos",
            couldNotShareInstagram: "Could not share on Instagram.",
            couldNotShareX: "Could not share on X."
        ),
        onboarding: .init(
            skip: "Skip",
            panel1HeroTitle: "Coffee Shop Photo",
            panel1HeroWatermark: "Roasted & Posted ☕",
            panel1Title: "Add Your Mark",
            panel1Body: "Protect your work and build your brand with elegant watermarks, stamps, and signatures.",
            panel2GestureLabel: "Pinch • Rotate • Drag",
            panel2SampleText: "Your Text",
            panel2Title: "Gesture-Powered Editing",
            panel2Body: "Pinch, rotate, and drag to perfect your composition. No clunky menus—just natural, fluid control.",
            panel3Title: "Completely Free",
            panel3Body: "All features unlocked. No paywalls, no subscriptions, no limits. Just create.",
            panel3FeatureAssets: "100+ Assets",
            panel3FeatureTools: "All Tools Unlocked",
            panel3FeatureNoWatermarks: "No Watermarks",
            getStarted: "Get Started"
        ),
        home: .init(
            emptyTitle: "No Projects Yet",
            emptySubtitle: "Tap the + button to create your first masterpiece",
            selectionTitle: "{count} Selected",
            deleteProjectsTitle: "Delete Projects",
            deleteProjectSingle: "Delete this project? This cannot be undone.",
            deleteProjectMultiple: "Delete {count} projects? This cannot be undone.",
            timestampToday: "Today",
            timestampDayAgo: "1d ago",
            timestampDaysAgo: "{count}d ago"
        ),
        imagePicker: .init(
            title: "Select Photo",
            loadingSubtitle: "Loading photos...",
            photoAvailable: "1 photo available",
            photosAvailable: "{count} photos available",
            loadingText: "Loading your photos..."
        ),
        editor: .init(
            backToGallery: "Gallery",
            export: "Export",
            saveChangesTitle: "Save Changes?",
            saveChangesMessage: "You have unsaved changes. Do you want to save this project before leaving?",
            noImageLoaded: "No image loaded",
            paramsLabel: "Params:"
        ),
        filters: .init(
            title: "Filters",
            intensity: "Intensity",
            apply: "Apply Filter",
            names: .init(
                none: "Original",
                bw: "B&W",
                sepia: "Sepia",
                vintage: "Vintage",
                cool: "Cool",
                warm: "Warm",
                juno: "Juno",
                gingham: "Gingham",
                clarendon: "Clarendon",
                lark: "Lark",
                ludwig: "Ludwig",
                xproii: "X-Pro II",
                lofi: "Lo-Fi",
                mayfair: "Mayfair",
                sierra: "Sierra",
                tattoo: "Tattoo",
                inkwell: "Inkwell",
                rise: "Rise",
                cinematic: "Cinematic",
                film: "Film Grain",
                hdr: "HDR",
                portrait: "Portrait",
                landscape: "Landscape",
                neon: "Neon",
                cyberpunk: "Cyberpunk",
                retro: "Retro Wave"
            )
        ),
        textToolbar: .init(
            fonts: .init(
                system: "System",
                archivo: "Archivo",
                bitcount: "Bitcount",
                firaSans: "Fira Sans",
                homemade: "Homemade"
            ),
            colors: .init(
                white: "White",
                black: "Black",
                red: "Red",
                orange: "Orange",
                yellow: "Yellow",
                green: "Green",
                blue: "Blue",
                purple: "Purple",
                pink: "Pink"
            ),
            effects: .init(
                none: "None",
                neon: "Neon",
                glow: "Glow",
                shadow: "Shadow",
                outline: "Outline"
            ),
            backgrounds: .init(
                none: "None",
                black: "Black",
                white: "White",
                gray: "Gray",
                red: "Red",
                blue: "Blue"
            )
        ),
        textTool: .init(
            title: "Add Text",
            placeholder: "Enter your text...",
            fontLabel: "Font",
            sizeLabel: "Size",
            colorLabel: "Color",
            addToCanvas: "Add to Canvas"
        ),
        stickers: .init(
            title: "Stickers",
            emptyCategory: "No stickers in this category",
            categories: .init(
                all: "All",
                emoji: "Emoji",
                socialMedia: "Social Media",
                textLabels: "Text & Labels",
                seasonal: "Seasonal",
                brandIcons: "Brand Icons",
                food: "Food",
                miscellaneous: "Miscellaneous"
            )
        ),
        stamps: .init(
            title: "Stamps",
            emptyCategory: "No stamps in this category",
            categories: .init(
                all: "All",
                approval: "Approval",
                labels: "Labels",
                seals: "Seals"
            )
        ),
        watermark: .init(
            title: "Watermark Tool",
            defaultText: "© Your Brand",
            textLabel: "Watermark Text",
            textPlaceholder: "Enter your watermark text",
            apply: "Apply Watermark",
            backToPresets: "Back to Presets",
            globalAdjustments: "Global Adjustments",
            opacity: "Opacity",
            size: "Size",
            rotation: "Rotation",
            confirmAdjustments: "Confirm Adjustments",
            selectedPreset: "Selected Preset",
            markCount: "{count} marks",
            densities: .init(
                dense: "Dense",
                moderate: "Moderate",
                sparse: "Sparse"
            ),
            presets: .init(
                tilePattern: .init(name: "Tile Pattern", description: "Dense grid covering entire image"),
                cornerBranding: .init(name: "Corner Branding", description: "4 watermarks in corners"),
                diagonalStripe: .init(name: "Diagonal Stripe", description: "Watermarks along diagonal line"),
                scatteredProtection: .init(name: "Scattered Protection", description: "Random placement with varied sizes"),
                minimalSingle: .init(name: "Minimal", description: "Single centered watermark"),
                borderGuard: .init(name: "Border Guard", description: "Watermarks along image edges"),
                photographerStyle: .init(name: "Photographer", description: "Small bottom-right signature"),
                denseGrid: .init(name: "Dense Grid", description: "Maximum coverage protection"),
                moderateCoverage: .init(name: "Moderate Coverage", description: "Balanced protection"),
                largeWatermarks: .init(name: "Large", description: "Big, visible watermarks"),
                smallWatermarks: .init(name: "Small", description: "Subtle, small watermarks"),
                microWatermarks: .init(name: "Micro", description: "Tiny, barely visible watermarks")
            )
        ),
        layers: .init(
            title: "Layers",
            emptyTitle: "No layers yet",
            emptySubtitle: "Add text, stickers, or stamps to see them here",
            layerCountSingle: "1 layer",
            layerCountMultiple: "{count} layers",
            elementTypes: .init(
                text: "Text",
                sticker: "Sticker",
                watermark: "Watermark",
                stamp: "Stamp",
                element: "Element"
            )
        )
    )
}
