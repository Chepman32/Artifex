import Foundation

enum LanguageNL {
    static let translations = Translations(
        common: .init(
            cancel: "Annuleren",
            save: "Opslaan",
            delete: "Verwijderen",
            close: "Sluiten",
            done: "Klaar",
            back: "Terug",
            ok: "OK",
            error: "Fout",
            clear: "Wissen",
            discard: "Verwerpen",
            loading: "Laden..."
        ),
        settings: .init(
            title: "Instellingen",
            theme: "Thema",
            themeLight: "Licht",
            themeDark: "Donker",
            themeSolar: "Zon",
            themeMono: "Mono",
            sound: "Geluid",
            soundOn: "Aan",
            soundOff: "Uit",
            haptics: "Haptics",
            hapticsOn: "Aan",
            hapticsOff: "Uit",
            language: "Taal",
            account: "Account",
            preferences: "Voorkeuren",
            appearance: "Uiterlijk",
            about: "Over",
            dangerZone: "Gevarenzone",
            restorePurchases: "Aankopen Herstellen",
            restorePurchasesDesc: "Voor gebruikers die Pro op een ander apparaat hebben gekocht",
            exportAllProjects: "Alle Projecten Exporteren",
            exportAllProjectsDesc: "Exporteer alle projecten in bulk naar Foto's",
            defaultExportFormat: "Standaard Exportformaat",
            defaultExportQuality: "Standaard Exportkwaliteit",
            autoSaveProjects: "Projecten Auto-Opslaan",
            autoSaveProjectsDesc: "Automatisch opslaan elke 30 seconden",
            hapticFeedback: "Haptische Feedback",
            hapticFeedbackDesc: "Trillingen voor interacties",
            version: "Versie",
            rateApp: "Beoordeel Stikaro",
            rateAppDesc: "Help ons verbeteren met je feedback",
            contactSupport: "Neem Contact op met Support",
            contactSupportDesc: "Krijg hulp of meld problemen",
            privacyPolicy: "Privacybeleid",
            privacyPolicyDesc: "Bekijk ons privacybeleid",
            termsOfService: "Servicevoorwaarden",
            termsOfServiceDesc: "Bekijk servicevoorwaarden",
            clearCache: "Cache Wissen",
            clearCacheDesc: "Verwijder gecachte miniaturen en tijdelijke bestanden",
            clearCacheAlertMessage: "Dit verwijdert gecachte miniaturen en tijdelijke bestanden. Doorgaan?",
            clearCacheSuccess: "Cache gewist",
            deleteAllProjects: "Alle Projecten Verwijderen",
            deleteAllProjectsDesc: "Verwijder permanent alle projecten",
            deleteAllProjectsAlertMessage: "Dit verwijdert alle projecten permanent. Dit kan niet ongedaan worden gemaakt. Doorgaan?",
            deleteAllProjectsSuccess: "Alle projecten verwijderd",
            resetOnboarding: "Onboarding opnieuw instellen",
            exportAllProjectsAlertMessage: "Deze Pro-functie wordt nog geïmplementeerd",
            rateAppAlertMessage: "Dit opent het App Store-beoordelingsvenster",
            contactSupportAlertMessage: "Dit opent de e-mailcomposer voor support@stikaro.app",
            privacyPolicyAlertMessage: "Dit opent stikaro.app/privacy",
            termsOfServiceAlertMessage: "Dit opent stikaro.app/terms"
        ),
        export: .init(
            saveToDevice: "Opslaan op apparaat",
            shareOnInstagram: "Delen op Instagram",
            shareOnX: "Delen op X",
            savedToPhotos: "Opgeslagen in Foto's",
            savedToPhotosDesc: "Je afbeelding is opgeslagen in de galerij.",
            viewInGallery: "Bekijk in galerij",
            noImageToExport: "Geen afbeelding om te exporteren",
            failedToExport: "Afbeelding exporteren mislukt",
            failedToSave: "Afbeelding opslaan in Foto's mislukt",
            couldNotShareInstagram: "Kon niet delen op Instagram.",
            couldNotShareX: "Kon niet delen op X."
        ),
        onboarding: .init(
            skip: "Overslaan",
            panel1HeroTitle: "Koffieshopfoto",
            panel1HeroWatermark: "Geroosterd & Gepost ☕",
            panel1Title: "Zet je stempel",
            panel1Body: "Bescherm je werk en bouw je merk met elegante watermerken, stempels en handtekeningen.",
            panel2GestureLabel: "Knijp • Draai • Sleep",
            panel2SampleText: "Jouw tekst",
            panel2Title: "Bewerken met gebaren",
            panel2Body: "Knijp, draai en sleep om je compositie te perfectioneren. Geen lompe menu\u{2019}s \u{2014} alleen natuurlijke, vloeiende controle.",
            panel3Title: "Helemaal gratis",
            panel3Body: "Alle functies ontgrendeld. Geen paywalls, geen abonnementen, geen limieten. Gewoon creëren.",
            panel3FeatureAssets: "100+ assets",
            panel3FeatureTools: "Alle tools ontgrendeld",
            panel3FeatureNoWatermarks: "Geen watermerken",
            getStarted: "Aan de slag"
        ),
        home: .init(
            emptyTitle: "Nog geen projecten",
            emptySubtitle: "Tik op de + knop om je eerste meesterwerk te maken",
            selectionTitle: "{count} geselecteerd",
            deleteProjectsTitle: "Projecten verwijderen",
            deleteProjectSingle: "Dit project verwijderen? Dit kan niet ongedaan worden gemaakt.",
            deleteProjectMultiple: "{count} projecten verwijderen? Dit kan niet ongedaan worden gemaakt.",
            timestampToday: "Vandaag",
            timestampDayAgo: "1 dag geleden",
            timestampDaysAgo: "{count} dagen geleden"
        ),
        imagePicker: .init(
            title: "Foto kiezen",
            loadingSubtitle: "Foto's laden...",
            photoAvailable: "1 foto beschikbaar",
            photosAvailable: "{count} foto's beschikbaar",
            loadingText: "Je foto's worden geladen..."
        ),
        editor: .init(
            backToGallery: "Galerij",
            export: "Exporteren",
            saveChangesTitle: "Wijzigingen opslaan?",
            saveChangesMessage: "Je hebt niet-opgeslagen wijzigingen. Wil je dit project opslaan voordat je vertrekt?",
            noImageLoaded: "Geen afbeelding geladen",
            paramsLabel: "Parameters:"
        ),
        filters: .init(
            title: "Filters",
            intensity: "Intensiteit",
            apply: "Filter toepassen",
            names: .init(
                none: "Origineel",
                bw: "Zwart-wit",
                sepia: "Sepia",
                vintage: "Vintage",
                cool: "Koel",
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
                tattoo: "Tatoeage",
                inkwell: "Inkwell",
                rise: "Rise",
                cinematic: "Cinematisch",
                film: "Filmkorrel",
                hdr: "HDR",
                portrait: "Portret",
                landscape: "Landschap",
                neon: "Neon",
                cyberpunk: "Cyberpunk",
                retro: "Retro Wave"
            )
        ),
        textToolbar: .init(
            fonts: .init(
                system: "Systeem",
                archivo: "Archivo",
                bitcount: "Bitcount",
                firaSans: "Fira Sans",
                homemade: "Homemade"
            ),
            colors: .init(
                white: "Wit",
                black: "Zwart",
                red: "Rood",
                orange: "Oranje",
                yellow: "Geel",
                green: "Groen",
                blue: "Blauw",
                purple: "Paars",
                pink: "Roze"
            ),
            effects: .init(
                none: "Geen",
                neon: "Neon",
                glow: "Gloed",
                shadow: "Schaduw",
                outline: "Omtrek"
            ),
            backgrounds: .init(
                none: "Geen",
                black: "Zwart",
                white: "Wit",
                gray: "Grijs",
                red: "Rood",
                blue: "Blauw"
            )
        ),
        textTool: .init(
            title: "Tekst toevoegen",
            placeholder: "Voer je tekst in...",
            fontLabel: "Lettertype",
            sizeLabel: "Grootte",
            colorLabel: "Kleur",
            addToCanvas: "Aan canvas toevoegen"
        ),
        stickers: .init(
            title: "Stickers",
            emptyCategory: "Geen stickers in deze categorie",
            categories: .init(
                all: "Alles",
                emoji: "Emoji",
                socialMedia: "Sociale media",
                textLabels: "Tekst en labels",
                seasonal: "Seizoens",
                brandIcons: "Merkiconen",
                food: "Eten",
                miscellaneous: "Diversen"
            )
        ),
        stamps: .init(
            title: "Stempels",
            emptyCategory: "Geen stempels in deze categorie",
            categories: .init(
                all: "Alles",
                approval: "Goedkeuring",
                labels: "Labels",
                seals: "Zegels"
            )
        ),
        watermark: .init(
            title: "Watermerktool",
            defaultText: "© Jouw merk",
            textLabel: "Watermerktekst",
            textPlaceholder: "Voer je watermerktekst in",
            apply: "Watermerk toepassen",
            backToPresets: "Terug naar presets",
            globalAdjustments: "Globale aanpassingen",
            opacity: "Opaciteit",
            size: "Grootte",
            rotation: "Rotatie",
            confirmAdjustments: "Aanpassingen bevestigen",
            selectedPreset: "Geselecteerde preset",
            markCount: "{count} markeringen",
            densities: .init(
                dense: "Dicht",
                moderate: "Gemiddeld",
                sparse: "Schaars"
            ),
            presets: .init(
                tilePattern: .init(name: "Tegelpatroon", description: "Dicht raster dat de hele afbeelding bedekt"),
                cornerBranding: .init(name: "Hoekbranding", description: "4 watermerken in de hoeken"),
                diagonalStripe: .init(name: "Diagonale streep", description: "Watermerken langs een diagonale lijn"),
                scatteredProtection: .init(name: "Verspreide bescherming", description: "Willekeurige plaatsing met variërende groottes"),
                minimalSingle: .init(name: "Minimal", description: "Eén gecentreerd watermerk"),
                borderGuard: .init(name: "Randbewaker", description: "Watermerken langs de randen van de afbeelding"),
                photographerStyle: .init(name: "Fotograafstijl", description: "Kleine handtekening rechtsonder"),
                denseGrid: .init(name: "Dicht raster", description: "Maximale dekking"),
                moderateCoverage: .init(name: "Gemiddelde dekking", description: "Gebalanceerde bescherming"),
                largeWatermarks: .init(name: "Grote", description: "Grote, zichtbare watermerken"),
                smallWatermarks: .init(name: "Kleine", description: "Subtiele, kleine watermerken"),
                microWatermarks: .init(name: "Micro", description: "Zeer kleine, nauwelijks zichtbare watermerken")
            )
        ),
        layers: .init(
            title: "Lagen",
            emptyTitle: "Nog geen lagen",
            emptySubtitle: "Voeg tekst, stickers of stempels toe om ze hier te zien",
            layerCountSingle: "1 laag",
            layerCountMultiple: "{count} lagen",
            elementTypes: .init(
                text: "Tekst",
                sticker: "Sticker",
                watermark: "Watermerk",
                stamp: "Stempel",
                element: "Element"
            )
        )
    )
}
