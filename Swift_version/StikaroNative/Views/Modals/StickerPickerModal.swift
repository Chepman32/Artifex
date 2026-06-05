import SwiftUI

// MARK: - StickerPickerModal

/// Sticker browser with category pills and 3-column LazyVGrid.
/// Tapping a sticker adds it as a .sticker CanvasElement centered on the canvas.
struct StickerPickerModal: View {
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var selectedCategory: StickerCategory = .all
    @State private var searchText: String = ""

    private let columns = [
        GridItem(.flexible(), spacing: Spacing.xs),
        GridItem(.flexible(), spacing: Spacing.xs),
        GridItem(.flexible(), spacing: Spacing.xs),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                VStack(spacing: 0) {
                    categoryPills
                        .padding(.vertical, Spacing.xs)

                    Divider()
                        .overlay(theme.backgrounds.tertiary)

                    stickerGrid
                }
            }
            .navigationTitle("Stickers")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Category Pills

    private var categoryPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.xs) {
                ForEach(StickerCategory.allCases, id: \.self) { category in
                    CategoryPill(
                        label: category.displayName,
                        isSelected: selectedCategory == category,
                        theme: theme
                    ) {
                        selectedCategory = category
                        if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                    }
                }
            }
            .padding(.horizontal, Spacing.m)
        }
    }

    // MARK: - Sticker Grid

    private var filteredStickers: [StickerItem] {
        StickerLibrary.stickers.filter { sticker in
            guard selectedCategory == .all || sticker.category == selectedCategory else { return false }
            return true
        }
    }

    private var stickerGrid: some View {
        ScrollView(.vertical, showsIndicators: false) {
            if filteredStickers.isEmpty {
                VStack(spacing: Spacing.m) {
                    Image(systemName: "face.smiling")
                        .font(.system(size: 40))
                        .foregroundStyle(theme.text.subtle)
                    Text("No stickers in this category")
                        .font(AppTypography.Body.regular)
                        .foregroundStyle(theme.text.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, Spacing.xxl)
            } else {
                LazyVGrid(columns: columns, spacing: Spacing.xs) {
                    ForEach(filteredStickers) { sticker in
                        StickerThumbnailCell(sticker: sticker, theme: theme) {
                            addSticker(sticker)
                        }
                    }
                }
                .padding(.horizontal, Spacing.m)
                .padding(.vertical, Spacing.s)
                .padding(.bottom, Spacing.xxl)
            }
        }
    }

    // MARK: - Add Sticker

    private func addSticker(_ sticker: StickerItem) {
        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }

        let canvasWidth = editorStore.canvasSize?.width ?? 500
        let canvasHeight = editorStore.canvasSize?.height ?? 500
        let center = CGPoint(x: canvasWidth / 2, y: canvasHeight / 2)

        let element = CanvasElement(
            type: .sticker,
            position: center,
            scale: 1.0,
            rotation: 0,
            width: 80,
            height: 80,
            opacity: 1.0,
            assetPath: sticker.assetPath
        )
        editorStore.addElement(element)
        dismiss()
    }
}

// MARK: - StickerCategory

enum StickerCategory: String, CaseIterable {
    case all
    case emoji
    case socialMedia
    case textLabels
    case seasonal
    case brandIcons
    case food
    case miscellaneous

    var displayName: String {
        switch self {
        case .all:           return "All"
        case .emoji:         return "Emoji"
        case .socialMedia:   return "Social Media"
        case .textLabels:    return "Text Labels"
        case .seasonal:      return "Seasonal"
        case .brandIcons:    return "Brand Icons"
        case .food:          return "Food"
        case .miscellaneous: return "Misc"
        }
    }
}

// MARK: - StickerItem

struct StickerItem: Identifiable {
    let id = UUID()
    let assetPath: String
    let category: StickerCategory
    let displayName: String
}

// MARK: - StickerLibrary

enum StickerLibrary {
    static let stickers: [StickerItem] = {
        var items: [StickerItem] = []

        // Emoji stickers
        let emojis: [(String, String)] = [
            ("sticker_emoji_heart",       "Heart"),
            ("sticker_emoji_fire",        "Fire"),
            ("sticker_emoji_star",        "Star"),
            ("sticker_emoji_thumbsup",    "Thumbs Up"),
            ("sticker_emoji_laugh",       "Laugh"),
            ("sticker_emoji_wow",         "Wow"),
            ("sticker_emoji_cry",         "Cry"),
            ("sticker_emoji_cool",        "Cool"),
        ]
        items += emojis.map { StickerItem(assetPath: $0.0, category: .emoji, displayName: $0.1) }

        // Social Media stickers
        let social: [(String, String)] = [
            ("sticker_social_like",       "Like"),
            ("sticker_social_share",      "Share"),
            ("sticker_social_follow",     "Follow"),
            ("sticker_social_subscribe",  "Subscribe"),
            ("sticker_social_comment",    "Comment"),
            ("sticker_social_repost",     "Repost"),
        ]
        items += social.map { StickerItem(assetPath: $0.0, category: .socialMedia, displayName: $0.1) }

        // Text Label stickers
        let labels: [(String, String)] = [
            ("sticker_label_new",         "New"),
            ("sticker_label_sale",        "Sale"),
            ("sticker_label_hot",         "Hot"),
            ("sticker_label_trending",    "Trending"),
            ("sticker_label_exclusive",   "Exclusive"),
            ("sticker_label_limited",     "Limited"),
        ]
        items += labels.map { StickerItem(assetPath: $0.0, category: .textLabels, displayName: $0.1) }

        // Seasonal stickers
        let seasonal: [(String, String)] = [
            ("sticker_seasonal_xmas",     "Christmas"),
            ("sticker_seasonal_halloween","Halloween"),
            ("sticker_seasonal_summer",   "Summer"),
            ("sticker_seasonal_spring",   "Spring"),
            ("sticker_seasonal_winter",   "Winter"),
            ("sticker_seasonal_bday",     "Birthday"),
        ]
        items += seasonal.map { StickerItem(assetPath: $0.0, category: .seasonal, displayName: $0.1) }

        // Brand Icons
        let brands: [(String, String)] = [
            ("sticker_brand_instagram",   "Instagram"),
            ("sticker_brand_tiktok",      "TikTok"),
            ("sticker_brand_youtube",     "YouTube"),
            ("sticker_brand_twitter",     "X"),
            ("sticker_brand_facebook",    "Facebook"),
            ("sticker_brand_snapchat",    "Snapchat"),
        ]
        items += brands.map { StickerItem(assetPath: $0.0, category: .brandIcons, displayName: $0.1) }

        // Food stickers
        let food: [(String, String)] = [
            ("sticker_food_pizza",        "Pizza"),
            ("sticker_food_burger",       "Burger"),
            ("sticker_food_coffee",       "Coffee"),
            ("sticker_food_cake",         "Cake"),
            ("sticker_food_taco",         "Taco"),
            ("sticker_food_sushi",        "Sushi"),
        ]
        items += food.map { StickerItem(assetPath: $0.0, category: .food, displayName: $0.1) }

        // Misc stickers
        let misc: [(String, String)] = [
            ("sticker_misc_arrow",        "Arrow"),
            ("sticker_misc_crown",        "Crown"),
            ("sticker_misc_diamond",      "Diamond"),
            ("sticker_misc_lightning",    "Lightning"),
            ("sticker_misc_music",        "Music"),
            ("sticker_misc_star4",        "4-Star"),
        ]
        items += misc.map { StickerItem(assetPath: $0.0, category: .miscellaneous, displayName: $0.1) }

        return items
    }()
}

// MARK: - StickerThumbnailCell

private struct StickerThumbnailCell: View {
    let sticker: StickerItem
    let theme: Theme
    let action: () -> Void

    @State private var isPressed: Bool = false

    var body: some View {
        Button(action: action) {
            VStack(spacing: Spacing.xxs) {
                ZStack {
                    RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                        .fill(theme.backgrounds.secondary)
                        .frame(height: 80)

                    if let uiImage = UIImage(named: sticker.assetPath) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 56, height: 56)
                    } else {
                        Image(systemName: "face.smiling.fill")
                            .font(.system(size: 32))
                            .foregroundStyle(theme.text.tertiary)
                    }
                }

                Text(sticker.displayName)
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(theme.text.secondary)
                    .lineLimit(1)
            }
        }
        .scaleEffect(isPressed ? 0.94 : 1.0)
        .animation(.spring(response: 0.2, dampingFraction: 0.7), value: isPressed)
        ._onButtonGesture(pressing: { isPressed = $0 }, perform: {})
    }
}

// MARK: - CategoryPill

private struct CategoryPill: View {
    let label: String
    let isSelected: Bool
    let theme: Theme
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(AppTypography.UI.label)
                .foregroundStyle(isSelected ? Color(hex: "#0F0F12") : theme.text.secondary)
                .padding(.horizontal, Spacing.s)
                .padding(.vertical, Spacing.xs)
                .background(
                    isSelected
                        ? AppGradients.gold
                        : LinearGradient(colors: [theme.backgrounds.secondary], startPoint: .top, endPoint: .bottom)
                )
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .strokeBorder(isSelected ? Color.clear : theme.backgrounds.tertiary, lineWidth: 1)
                )
        }
        .animation(.spring(response: 0.25, dampingFraction: 0.75), value: isSelected)
    }
}
