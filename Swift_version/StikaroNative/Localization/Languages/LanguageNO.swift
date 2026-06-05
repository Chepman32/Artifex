import Foundation

enum LanguageNO {
    static let translations = Translations(
        common: .init(
            cancel: "Avbryt",
            save: "Lagre",
            delete: "Slett",
            close: "Lukk",
            done: "Ferdig",
            back: "Tilbake",
            ok: "OK",
            error: "Feil",
            clear: "Tøm",
            discard: "Forkast",
            loading: "Laster..."
        ),
        settings: .init(
            title: "Innstillinger",
            theme: "Tema",
            themeLight: "Lys",
            themeDark: "Mørk",
            themeSolar: "Sol",
            themeMono: "Mono",
            sound: "Lyd",
            soundOn: "På",
            soundOff: "Av",
            haptics: "Haptikk",
            hapticsOn: "På",
            hapticsOff: "Av",
            language: "Språk",
            account: "Konto",
            preferences: "Preferanser",
            appearance: "Utseende",
            about: "Om",
            dangerZone: "Faresone",
            restorePurchases: "Gjenopprett kjøp",
            restorePurchasesDesc: "For brukere som har kjøpt Pro på en annen enhet",
            exportAllProjects: "Eksporter alle prosjekter",
            exportAllProjectsDesc: "Bulk-eksporter alle prosjekter til Bilder",
            defaultExportFormat: "Standard eksportformat",
            defaultExportQuality: "Standard eksportkvalitet",
            autoSaveProjects: "Auto-lagre prosjekter",
            autoSaveProjectsDesc: "Lagre automatisk hvert 30. sekund",
            hapticFeedback: "Haptisk tilbakemelding",
            hapticFeedbackDesc: "Vibrasjon for interaksjoner",
            version: "Versjon",
            rateApp: "Vurder Stikaro",
            rateAppDesc: "Hjelp oss å forbedre med din tilbakemelding",
            contactSupport: "Kontakt support",
            contactSupportDesc: "Få hjelp eller rapporter problemer",
            privacyPolicy: "Personvernpolicy",
            privacyPolicyDesc: "Vis vår personvernpolicy",
            termsOfService: "Tjenestevilkår",
            termsOfServiceDesc: "Vis tjenestevilkår",
            clearCache: "Tøm mellomlager",
            clearCacheDesc: "Fjern mellomlagrede miniatyrbilder og midlertidige filer",
            clearCacheAlertMessage: "Dette vil fjerne mellomlagrede miniatyrbilder og midlertidige filer. Fortsette?",
            clearCacheSuccess: "Mellomlager tømt",
            deleteAllProjects: "Slett alle prosjekter",
            deleteAllProjectsDesc: "Slett alle prosjekter permanent",
            deleteAllProjectsAlertMessage: "Dette vil slette alle prosjekter permanent. Dette kan ikke angres. Fortsette?",
            deleteAllProjectsSuccess: "Alle prosjekter slettet",
            resetOnboarding: "Tilbakestill onboarding",
            exportAllProjectsAlertMessage: "Denne Pro-funksjonen blir implementert",
            rateAppAlertMessage: "Dette åpner vurderingsdialogen i App Store",
            contactSupportAlertMessage: "Dette åpner e-postskjema til support@stikaro.app",
            privacyPolicyAlertMessage: "Dette åpner stikaro.app/privacy",
            termsOfServiceAlertMessage: "Dette åpner stikaro.app/terms"
        ),
        export: .init(
            saveToDevice: "Lagre på enhet",
            shareOnInstagram: "Del på Instagram",
            shareOnX: "Del på X",
            savedToPhotos: "Lagret i Bilder",
            savedToPhotosDesc: "Bildet ditt er lagret i galleriet.",
            viewInGallery: "Vis i galleri",
            noImageToExport: "Intet bilde å eksportere",
            failedToExport: "Kunne ikke eksportere bilde",
            failedToSave: "Kunne ikke lagre bilde i Bilder",
            couldNotShareInstagram: "Kunne ikke dele på Instagram.",
            couldNotShareX: "Kunne ikke dele på X."
        ),
        onboarding: .init(
            skip: "Hopp over",
            panel1HeroTitle: "Kaféfoto",
            panel1HeroWatermark: "Ristet & Publisert ☕",
            panel1Title: "Sett ditt preg",
            panel1Body: "Beskytt arbeidet ditt og bygg merkevaren med elegante vannmerker, stempler og signaturer.",
            panel2GestureLabel: "Klyp • Roter • Dra",
            panel2SampleText: "Din tekst",
            panel2Title: "Gestbasert redigering",
            panel2Body: "Klyp, roter og dra for å perfeksjonere komposisjonen. Ingen klønete menyer – bare naturlig, flytende kontroll.",
            panel3Title: "Helt gratis",
            panel3Body: "Alle funksjoner låst opp. Ingen betalingsmurer, ingen abonnementer, ingen grenser. Bare skap.",
            panel3FeatureAssets: "100+ ressurser",
            panel3FeatureTools: "Alle verktøy låst opp",
            panel3FeatureNoWatermarks: "Ingen vannmerker",
            getStarted: "Kom i gang"
        ),
        home: .init(
            emptyTitle: "Ingen prosjekter ennå",
            emptySubtitle: "Trykk på + for å lage ditt første mesterverk",
            selectionTitle: "{count} valgt",
            deleteProjectsTitle: "Slett prosjekter",
            deleteProjectSingle: "Slette dette prosjektet? Dette kan ikke angres.",
            deleteProjectMultiple: "Slette {count} prosjekter? Dette kan ikke angres.",
            timestampToday: "I dag",
            timestampDayAgo: "1 dag siden",
            timestampDaysAgo: "{count} dager siden"
        ),
        imagePicker: .init(
            title: "Velg bilde",
            loadingSubtitle: "Laster bilder...",
            photoAvailable: "1 bilde tilgjengelig",
            photosAvailable: "{count} bilder tilgjengelig",
            loadingText: "Laster bildene dine..."
        ),
        editor: .init(
            backToGallery: "Galleri",
            export: "Eksporter",
            saveChangesTitle: "Lagre endringer?",
            saveChangesMessage: "Du har endringer som ikke er lagret. Vil du lagre prosjektet før du forlater?",
            noImageLoaded: "Ingen bilde lastet",
            paramsLabel: "Parametre:"
        ),
        filters: .init(
            title: "Filtre",
            intensity: "Intensitet",
            apply: "Bruk filter",
            names: .init(
                none: "Original",
                bw: "Svart-hvitt",
                sepia: "Sepia",
                vintage: "Vintage",
                cool: "Kald",
                warm: "Varm",
                juno: "Juno",
                gingham: "Gingham",
                clarendon: "Clarendon",
                lark: "Lark",
                ludwig: "Ludwig",
                xproii: "X-Pro II",
                lofi: "Lo-Fi",
                mayfair: "Mayfair",
                sierra: "Sierra",
                tattoo: "Tatovering",
                inkwell: "Inkwell",
                rise: "Rise",
                cinematic: "Filmatisk",
                film: "Filmkorn",
                hdr: "HDR",
                portrait: "Portrett",
                landscape: "Landskap",
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
                white: "Hvit",
                black: "Svart",
                red: "Rød",
                orange: "Oransje",
                yellow: "Gul",
                green: "Grønn",
                blue: "Blå",
                purple: "Lilla",
                pink: "Rosa"
            ),
            effects: .init(
                none: "Ingen",
                neon: "Neon",
                glow: "Glød",
                shadow: "Skygge",
                outline: "Kontur"
            ),
            backgrounds: .init(
                none: "Ingen",
                black: "Svart",
                white: "Hvit",
                gray: "Grå",
                red: "Rød",
                blue: "Blå"
            )
        ),
        textTool: .init(
            title: "Legg til tekst",
            placeholder: "Skriv inn teksten...",
            fontLabel: "Skrift",
            sizeLabel: "Størrelse",
            colorLabel: "Farge",
            addToCanvas: "Legg til på lerret"
        ),
        stickers: .init(
            title: "Klistremerker",
            emptyCategory: "Ingen klistremerker i denne kategorien",
            categories: .init(
                all: "Alle",
                emoji: "Emoji",
                socialMedia: "Sosiale medier",
                textLabels: "Tekst og etiketter",
                seasonal: "Sesong",
                brandIcons: "Merkeikoner",
                food: "Mat",
                miscellaneous: "Annet"
            )
        ),
        stamps: .init(
            title: "Stempler",
            emptyCategory: "Ingen stempler i denne kategorien",
            categories: .init(
                all: "Alle",
                approval: "Godkjenning",
                labels: "Etiketter",
                seals: "Segl"
            )
        ),
        watermark: .init(
            title: "Vannmerkverktøy",
            defaultText: "© Din merkevare",
            textLabel: "Vannmerketekst",
            textPlaceholder: "Skriv inn vannmerketekst",
            apply: "Bruk vannmerke",
            backToPresets: "Tilbake til forhåndsinnstillinger",
            globalAdjustments: "Globale justeringer",
            opacity: "Opasitet",
            size: "Størrelse",
            rotation: "Rotasjon",
            confirmAdjustments: "Bekreft justeringer",
            selectedPreset: "Valgt forhåndsinnstilling",
            markCount: "{count} merker",
            densities: .init(
                dense: "Tett",
                moderate: "Moderat",
                sparse: "Sparsom"
            ),
            presets: .init(
                tilePattern: .init(name: "Flisemønster", description: "Tett rutenett som dekker hele bildet"),
                cornerBranding: .init(name: "Hjørnebranding", description: "4 vannmerker i hjørnene"),
                diagonalStripe: .init(name: "Diagonal stripe", description: "Vannmerker langs en diagonal linje"),
                scatteredProtection: .init(name: "Spredt beskyttelse", description: "Tilfeldig plassering med varierende størrelser"),
                minimalSingle: .init(name: "Minimal", description: "Ett sentrert vannmerke"),
                borderGuard: .init(name: "Kantvakt", description: "Vannmerker langs bildekantene"),
                photographerStyle: .init(name: "Fotografstil", description: "Liten signatur nede til høyre"),
                denseGrid: .init(name: "Tett rutenett", description: "Maksimal dekning"),
                moderateCoverage: .init(name: "Moderat dekning", description: "Balansert beskyttelse"),
                largeWatermarks: .init(name: "Store", description: "Store, synlige vannmerker"),
                smallWatermarks: .init(name: "Små", description: "Diskrete, små vannmerker"),
                microWatermarks: .init(name: "Mikro", description: "Svært små, knapt synlige vannmerker")
            )
        ),
        layers: .init(
            title: "Lag",
            emptyTitle: "Ingen lag ennå",
            emptySubtitle: "Legg til tekst, klistremerker eller stempler for å se dem her",
            layerCountSingle: "1 lag",
            layerCountMultiple: "{count} lag",
            elementTypes: .init(
                text: "Tekst",
                sticker: "Klistremerke",
                watermark: "Vannmerke",
                stamp: "Stempel",
                element: "Element"
            )
        )
    )
}
