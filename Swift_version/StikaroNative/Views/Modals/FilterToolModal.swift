import SwiftUI

// MARK: - FilterToolModal

/// 3-column filter selection grid with colored preview circles and single-selection state.
struct FilterToolModal: View {
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    private let columns = [
        GridItem(.flexible(), spacing: Spacing.m),
        GridItem(.flexible(), spacing: Spacing.m),
        GridItem(.flexible(), spacing: Spacing.m),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    LazyVGrid(columns: columns, spacing: Spacing.m) {
                        ForEach(FilterDefinition.all) { definition in
                            FilterCell(
                                definition: definition,
                                isSelected: isSelected(definition),
                                theme: theme
                            ) {
                                applyFilter(definition)
                            }
                        }
                    }
                    .padding(.horizontal, Spacing.m)
                    .padding(.top, Spacing.m)
                    .padding(.bottom, Spacing.xxl)
                }
            }
            .navigationTitle("Filters")
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

    // MARK: - Logic

    private func isSelected(_ definition: FilterDefinition) -> Bool {
        if definition.filterType == .none {
            return editorStore.appliedFilter == nil
        }
        return editorStore.appliedFilter?.type == definition.filterType
    }

    private func applyFilter(_ definition: FilterDefinition) {
        if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
        if definition.filterType == .none {
            editorStore.removeFilter()
        } else {
            editorStore.applyFilter(
                ImageFilter(name: definition.name, intensity: 1.0, type: definition.filterType)
            )
        }
    }
}

// MARK: - FilterDefinition

private struct FilterDefinition: Identifiable {
    let id = UUID()
    let filterType: FilterType
    let name: String
    let previewColor: Color
    let isPro: Bool

    static let all: [FilterDefinition] = [
        .init(filterType: .none,       name: "Original",  previewColor: .clear,                      isPro: false),
        .init(filterType: .bw,         name: "B&W",       previewColor: Color(hex: "#888888"),        isPro: false),
        .init(filterType: .sepia,      name: "Sepia",     previewColor: Color(hex: "#D2B48C"),        isPro: false),
        .init(filterType: .vintage,    name: "Vintage",   previewColor: Color(hex: "#F4A460"),        isPro: false),
        .init(filterType: .cool,       name: "Cool",      previewColor: Color(hex: "#87CEEB"),        isPro: false),
        .init(filterType: .warm,       name: "Warm",      previewColor: Color(hex: "#FFB347"),        isPro: false),
        .init(filterType: .cinematic,  name: "Cinematic", previewColor: Color(hex: "#2C3E6B"),        isPro: true),
        .init(filterType: .film,       name: "Film",      previewColor: Color(hex: "#C8A882"),        isPro: true),
        .init(filterType: .hdr,        name: "HDR",       previewColor: Color(hex: "#4A90D9"),        isPro: true),
        .init(filterType: .portrait,   name: "Portrait",  previewColor: Color(hex: "#E8C5A0"),        isPro: true),
        .init(filterType: .landscape,  name: "Landscape", previewColor: Color(hex: "#5BA55A"),        isPro: true),
        .init(filterType: .neon,       name: "Neon",      previewColor: Color(hex: "#FF00FF"),        isPro: true),
        .init(filterType: .cyberpunk,  name: "Cyberpunk", previewColor: Color(hex: "#00FFFF"),        isPro: true),
        .init(filterType: .retro,      name: "Retro",     previewColor: Color(hex: "#E8855A"),        isPro: true),
        .init(filterType: .juno,       name: "Juno",      previewColor: Color(hex: "#C8A040"),        isPro: true),
        .init(filterType: .gingham,    name: "Gingham",   previewColor: Color(hex: "#D4C8B8"),        isPro: true),
        .init(filterType: .clarendon,  name: "Clarendon", previewColor: Color(hex: "#7090B0"),        isPro: true),
        .init(filterType: .lark,       name: "Lark",      previewColor: Color(hex: "#E0D8C0"),        isPro: true),
        .init(filterType: .ludwig,     name: "Ludwig",    previewColor: Color(hex: "#B8A090"),        isPro: true),
        .init(filterType: .xproii,     name: "X-Pro II",  previewColor: Color(hex: "#604030"),        isPro: true),
        .init(filterType: .lofi,       name: "Lo-Fi",     previewColor: Color(hex: "#806040"),        isPro: true),
        .init(filterType: .mayfair,    name: "Mayfair",   previewColor: Color(hex: "#D0A878"),        isPro: true),
        .init(filterType: .sierra,     name: "Sierra",    previewColor: Color(hex: "#C8B8A0"),        isPro: true),
        .init(filterType: .tattoo,     name: "Tattoo",    previewColor: Color(hex: "#303030"),        isPro: true),
        .init(filterType: .inkwell,    name: "Inkwell",   previewColor: Color(hex: "#404040"),        isPro: true),
        .init(filterType: .rise,       name: "Rise",      previewColor: Color(hex: "#E8C890"),        isPro: true),
    ]
}

// MARK: - FilterCell

private struct FilterCell: View {
    let definition: FilterDefinition
    let isSelected: Bool
    let theme: Theme
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: Spacing.xs) {
                ZStack {
                    Circle()
                        .fill(
                            definition.filterType == .none
                                ? AnyShapeStyle(theme.backgrounds.tertiary)
                                : AnyShapeStyle(definition.previewColor)
                        )
                        .frame(width: 56, height: 56)
                        .overlay(
                            // Checkerboard hint for None
                            definition.filterType == .none
                                ? AnyView(
                                    ZStack {
                                        Circle()
                                            .fill(
                                                LinearGradient(
                                                    colors: [Color.white.opacity(0.5), Color.gray.opacity(0.4)],
                                                    startPoint: .topLeading,
                                                    endPoint: .bottomTrailing
                                                )
                                            )
                                        Image(systemName: "photo")
                                            .font(.system(size: 18, weight: .medium))
                                            .foregroundStyle(theme.text.tertiary)
                                    }
                                )
                                : AnyView(EmptyView())
                        )
                        .overlay(
                            Circle()
                                .strokeBorder(
                                    isSelected ? theme.accent.primary : Color.clear,
                                    lineWidth: 2.5
                                )
                        )
                        .overlay(
                            isSelected
                                ? AnyView(
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.system(size: 18, weight: .semibold))
                                        .foregroundStyle(theme.accent.primary)
                                        .background(Circle().fill(Color.black.opacity(0.5)).padding(2))
                                        .offset(x: 18, y: 18)
                                )
                                : AnyView(EmptyView())
                        )

                    // Pro badge
                    if definition.isPro {
                        Text("PRO")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.black)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(AppGradients.gold)
                            .clipShape(Capsule())
                            .offset(x: -16, y: -22)
                    }
                }

                Text(definition.name)
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                    .lineLimit(1)
            }
        }
        .scaleEffect(isSelected ? 1.05 : 1.0)
        .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isSelected)
    }
}
