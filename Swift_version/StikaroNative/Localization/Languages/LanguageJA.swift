import Foundation

enum LanguageJA {
    static let translations = Translations(
        common: .init(
            cancel: "キャンセル",
            save: "保存",
            delete: "削除",
            close: "閉じる",
            done: "完了",
            back: "戻る",
            ok: "OK",
            error: "エラー",
            clear: "クリア",
            discard: "破棄",
            loading: "読み込み中..."
        ),
        settings: .init(
            title: "設定",
            theme: "テーマ",
            themeLight: "ライト",
            themeDark: "ダーク",
            themeSolar: "ソーラー",
            themeMono: "モノ",
            sound: "サウンド",
            soundOn: "オン",
            soundOff: "オフ",
            haptics: "触覚",
            hapticsOn: "オン",
            hapticsOff: "オフ",
            language: "言語",
            account: "アカウント",
            preferences: "環境設定",
            appearance: "外観",
            about: "情報",
            dangerZone: "危険ゾーン",
            restorePurchases: "購入を復元",
            restorePurchasesDesc: "別のデバイスでProを購入したユーザー向け",
            exportAllProjects: "すべてのプロジェクトをエクスポート",
            exportAllProjectsDesc: "すべてのプロジェクトを写真に一括エクスポート",
            defaultExportFormat: "デフォルトのエクスポート形式",
            defaultExportQuality: "デフォルトのエクスポート品質",
            autoSaveProjects: "プロジェクトの自動保存",
            autoSaveProjectsDesc: "30秒ごとに自動保存",
            hapticFeedback: "触覚フィードバック",
            hapticFeedbackDesc: "インタラクションの振動",
            version: "バージョン",
            rateApp: "Stikaroを評価",
            rateAppDesc: "フィードバックで改善にご協力ください",
            contactSupport: "サポートに連絡",
            contactSupportDesc: "ヘルプを取得または問題を報告",
            privacyPolicy: "プライバシーポリシー",
            privacyPolicyDesc: "プライバシーポリシーを表示",
            termsOfService: "利用規約",
            termsOfServiceDesc: "利用規約を表示",
            clearCache: "キャッシュをクリア",
            clearCacheDesc: "キャッシュされたサムネイルと一時ファイルを削除",
            clearCacheAlertMessage: "キャッシュされたサムネイルと一時ファイルを削除します。続行しますか？",
            clearCacheSuccess: "キャッシュを削除しました",
            deleteAllProjects: "すべてのプロジェクトを削除",
            deleteAllProjectsDesc: "すべてのプロジェクトを完全に削除",
            deleteAllProjectsAlertMessage: "すべてのプロジェクトを完全に削除します。元に戻せません。続行しますか？",
            deleteAllProjectsSuccess: "すべてのプロジェクトを削除しました",
            resetOnboarding: "オンボーディングをリセット",
            exportAllProjectsAlertMessage: "このPro機能は実装予定です",
            rateAppAlertMessage: "App Storeの評価ダイアログを開きます",
            contactSupportAlertMessage: "support@stikaro.app へのメール作成画面を開きます",
            privacyPolicyAlertMessage: "stikaro.app/privacy を開きます",
            termsOfServiceAlertMessage: "stikaro.app/terms を開きます"
        ),
        export: .init(
            saveToDevice: "デバイスに保存",
            shareOnInstagram: "Instagramで共有",
            shareOnX: "Xで共有",
            savedToPhotos: "写真に保存しました",
            savedToPhotosDesc: "画像がギャラリーに保存されました。",
            viewInGallery: "ギャラリーで表示",
            noImageToExport: "エクスポートする画像がありません",
            failedToExport: "画像のエクスポートに失敗しました",
            failedToSave: "写真への保存に失敗しました",
            couldNotShareInstagram: "Instagramで共有できませんでした。",
            couldNotShareX: "Xで共有できませんでした。"
        ),
        onboarding: .init(
            skip: "スキップ",
            panel1HeroTitle: "コーヒーショップの写真",
            panel1HeroWatermark: "ロースト＆ポスト ☕",
            panel1Title: "あなたの印を",
            panel1Body: "洗練された透かし、スタンプ、サインで作品を守り、ブランドを築こう。",
            panel2GestureLabel: "ピンチ • 回転 • ドラッグ",
            panel2SampleText: "あなたのテキスト",
            panel2Title: "ジェスチャー操作の編集",
            panel2Body: "ピンチ、回転、ドラッグで構図を仕上げる。煩雑なメニューなし—自然で滑らかな操作。",
            panel3Title: "完全無料",
            panel3Body: "すべての機能が解放。課金なし、サブスクなし、制限なし。さあ作ろう。",
            panel3FeatureAssets: "100+ 素材",
            panel3FeatureTools: "全ツール解放",
            panel3FeatureNoWatermarks: "透かしなし",
            getStarted: "はじめる"
        ),
        home: .init(
            emptyTitle: "まだプロジェクトがありません",
            emptySubtitle: "+ ボタンをタップして最初の傑作を作成",
            selectionTitle: "{count}件選択",
            deleteProjectsTitle: "プロジェクトを削除",
            deleteProjectSingle: "このプロジェクトを削除しますか？元に戻せません。",
            deleteProjectMultiple: "{count}件のプロジェクトを削除しますか？元に戻せません。",
            timestampToday: "今日",
            timestampDayAgo: "1日前",
            timestampDaysAgo: "{count}日前"
        ),
        imagePicker: .init(
            title: "写真を選択",
            loadingSubtitle: "写真を読み込み中...",
            photoAvailable: "写真が1枚あります",
            photosAvailable: "写真が{count}枚あります",
            loadingText: "写真を読み込んでいます..."
        ),
        editor: .init(
            backToGallery: "ギャラリー",
            export: "エクスポート",
            saveChangesTitle: "変更を保存しますか？",
            saveChangesMessage: "未保存の変更があります。移動する前にこのプロジェクトを保存しますか？",
            noImageLoaded: "画像が読み込まれていません",
            paramsLabel: "パラメータ:"
        ),
        filters: .init(
            title: "フィルター",
            intensity: "強さ",
            apply: "フィルターを適用",
            names: .init(
                none: "オリジナル",
                bw: "モノクロ",
                sepia: "セピア",
                vintage: "ヴィンテージ",
                cool: "クール",
                warm: "ウォーム",
                juno: "Juno",
                gingham: "Gingham",
                clarendon: "Clarendon",
                lark: "Lark",
                ludwig: "Ludwig",
                xproii: "X-Pro II",
                lofi: "Lo-Fi",
                mayfair: "Mayfair",
                sierra: "Sierra",
                tattoo: "タトゥー",
                inkwell: "インクウェル",
                rise: "ライズ",
                cinematic: "シネマティック",
                film: "フィルムグレイン",
                hdr: "HDR",
                portrait: "ポートレート",
                landscape: "ランドスケープ",
                neon: "ネオン",
                cyberpunk: "サイバーパンク",
                retro: "レトロウェーブ"
            )
        ),
        textToolbar: .init(
            fonts: .init(
                system: "システム",
                archivo: "Archivo",
                bitcount: "Bitcount",
                firaSans: "Fira Sans",
                homemade: "Homemade"
            ),
            colors: .init(
                white: "白",
                black: "黒",
                red: "赤",
                orange: "オレンジ",
                yellow: "黄色",
                green: "緑",
                blue: "青",
                purple: "紫",
                pink: "ピンク"
            ),
            effects: .init(
                none: "なし",
                neon: "ネオン",
                glow: "グロー",
                shadow: "影",
                outline: "アウトライン"
            ),
            backgrounds: .init(
                none: "なし",
                black: "黒",
                white: "白",
                gray: "グレー",
                red: "赤",
                blue: "青"
            )
        ),
        textTool: .init(
            title: "テキストを追加",
            placeholder: "テキストを入力...",
            fontLabel: "フォント",
            sizeLabel: "サイズ",
            colorLabel: "色",
            addToCanvas: "キャンバスに追加"
        ),
        stickers: .init(
            title: "ステッカー",
            emptyCategory: "このカテゴリにステッカーはありません",
            categories: .init(
                all: "すべて",
                emoji: "絵文字",
                socialMedia: "ソーシャルメディア",
                textLabels: "テキスト＆ラベル",
                seasonal: "季節",
                brandIcons: "ブランドアイコン",
                food: "フード",
                miscellaneous: "その他"
            )
        ),
        stamps: .init(
            title: "スタンプ",
            emptyCategory: "このカテゴリにスタンプはありません",
            categories: .init(
                all: "すべて",
                approval: "承認",
                labels: "ラベル",
                seals: "シール"
            )
        ),
        watermark: .init(
            title: "透かしツール",
            defaultText: "© あなたのブランド",
            textLabel: "透かしテキスト",
            textPlaceholder: "透かしテキストを入力",
            apply: "透かしを適用",
            backToPresets: "プリセットに戻る",
            globalAdjustments: "全体調整",
            opacity: "不透明度",
            size: "サイズ",
            rotation: "回転",
            confirmAdjustments: "調整を確定",
            selectedPreset: "選択中のプリセット",
            markCount: "{count}個",
            densities: .init(
                dense: "濃い",
                moderate: "中",
                sparse: "疎"
            ),
            presets: .init(
                tilePattern: .init(name: "タイルパターン", description: "画像全体を覆う高密度グリッド"),
                cornerBranding: .init(name: "コーナーブランディング", description: "四隅に4つの透かし"),
                diagonalStripe: .init(name: "斜めストライプ", description: "斜めラインに沿った透かし"),
                scatteredProtection: .init(name: "散在保護", description: "ランダム配置でサイズも変化"),
                minimalSingle: .init(name: "ミニマル", description: "中央に1つの透かし"),
                borderGuard: .init(name: "ボーダーガード", description: "画像の縁に沿った透かし"),
                photographerStyle: .init(name: "フォトグラファー", description: "右下の小さな署名"),
                denseGrid: .init(name: "高密度グリッド", description: "最大カバレッジの保護"),
                moderateCoverage: .init(name: "中程度カバレッジ", description: "バランスの取れた保護"),
                largeWatermarks: .init(name: "大きい", description: "大きく目立つ透かし"),
                smallWatermarks: .init(name: "小さい", description: "控えめで小さい透かし"),
                microWatermarks: .init(name: "マイクロ", description: "とても小さく、ほとんど見えない透かし")
            )
        ),
        layers: .init(
            title: "レイヤー",
            emptyTitle: "レイヤーはまだありません",
            emptySubtitle: "テキスト、ステッカー、スタンプを追加するとここに表示されます",
            layerCountSingle: "1レイヤー",
            layerCountMultiple: "{count}レイヤー",
            elementTypes: .init(
                text: "テキスト",
                sticker: "ステッカー",
                watermark: "透かし",
                stamp: "スタンプ",
                element: "要素"
            )
        )
    )
}
