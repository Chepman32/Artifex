import SwiftUI

// MARK: - StampsPickerModal

/// Stamp browser with category pills and 3-column LazyVGrid.
/// Tapping a stamp adds it as a .stamp CanvasElement centered on the canvas.
struct StampsPickerModal: View {
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var selectedCategory: StampCategory = .all

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

                    stampGrid
                }
            }
            .navigationTitle("Stamps")
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
                ForEach(StampCategory.allCases, id: \.self) { category in
                    StampCategoryPill(
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

    // MARK: - Stamp Grid

    private var filteredStamps: [StampItem] {
        StampLibrary.stamps.filter { stamp in
            selectedCategory == .all || stamp.category == selectedCategory
        }
    }

    private var stampGrid: some View {
        ScrollView(.vertical, showsIndicators: false) {
            if filteredStamps.isEmpty {
                VStack(spacing: Spacing.m) {
                    Image(systemName: "seal")
                        .font(.system(size: 40))
                        .foregroundStyle(theme.text.subtle)
                    Text("No stamps in this category")
                        .font(AppTypography.Body.regular)
                        .foregroundStyle(theme.text.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, Spacing.xxl)
            } else {
                LazyVGrid(columns: columns, spacing: Spacing.xs) {
                    ForEach(filteredStamps) { stamp in
                        StampThumbnailCell(stamp: stamp, theme: theme) {
                            addStamp(stamp)
                        }
                    }
                }
                .padding(.horizontal, Spacing.m)
                .padding(.vertical, Spacing.s)
                .padding(.bottom, Spacing.xxl)
            }
        }
    }

    // MARK: - Add Stamp

    private func addStamp(_ stamp: StampItem) {
        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }

        let canvasWidth = editorStore.canvasSize?.width ?? 500
        let canvasHeight = editorStore.canvasSize?.height ?? 500
        let center = CGPoint(x: canvasWidth / 2, y: canvasHeight / 2)

        let element = CanvasElement(
            type: .stamp,
            position: center,
            scale: 1.0,
            rotation: 0,
            width: 80,
            height: 80,
            opacity: 1.0,
            assetPath: stamp.assetPath
        )
        editorStore.addElement(element)
        dismiss()
    }
}

// MARK: - StampCategory

enum StampCategory: String, CaseIterable {
    case all
    case approval
    case labels
    case seals

    var displayName: String {
        switch self {
        case .all:      return "All"
        case .approval: return "Approval"
        case .labels:   return "Labels"
        case .seals:    return "Seals"
        }
    }
}

// MARK: - StampItem

struct StampItem: Identifiable {
    let id = UUID()
    let assetPath: String
    let category: StampCategory
    let displayName: String
}

// MARK: - StampLibrary

enum StampLibrary {
    static let stamps: [StampItem] = {
        var items: [StampItem] = []

        // Approval stamps
        let approval: [(String, String)] = [
            ("stamp_approval_approved",   "Approved"),
            ("stamp_approval_rejected",   "Rejected"),
            ("stamp_approval_pending",    "Pending"),
            ("stamp_approval_verified",   "Verified"),
            ("stamp_approval_certified",  "Certified"),
            ("stamp_approval_passed",     "Passed"),
            ("stamp_approval_failed",     "Failed"),
            ("stamp_approval_reviewed",   "Reviewed"),
        ]
        items += approval.map { StampItem(assetPath: $0.0, category: .approval, displayName: $0.1) }

        // Label stamps
        let labels: [(String, String)] = [
            ("stamp_label_confidential", "Confidential"),
            ("stamp_label_classified",  "Classified"),
            ("stamp_label_draft",       "Draft"),
            ("stamp_label_final",       "Final"),
            ("stamp_label_copy",        "Copy"),
            ("stamp_label_original",    "Original"),
            ("stamp_label_urgent",      "Urgent"),
            ("stamp_label_priority",    "Priority"),
        ]
        items += labels.map { StampItem(assetPath: $0.0, category: .labels, displayName: $0.1) }

        // Seal stamps
        let seals: [(String, String)] = [
            ("stamp_seal_gold",         "Gold Seal"),
            ("stamp_seal_silver",       "Silver Seal"),
            ("stamp_seal_red",          "Red Seal"),
            ("stamp_seal_official",     "Official"),
            ("stamp_seal_notary",       "Notary"),
            ("stamp_seal_wax",          "Wax Seal"),
        ]
        items += seals.map { StampItem(assetPath: $0.0, category: .seals, displayName: $0.1) }

        return items
    }()
}

// MARK: - StampThumbnailCell

private struct StampThumbnailCell: View {
    let stamp: StampItem
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

                    if let uiImage = UIImage(named: stamp.assetPath) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 56, height: 56)
                    } else {
                        // Fallback: render the name as a circular stamp preview
                        ZStack {
                            Circle()
                                .strokeBorder(theme.text.tertiary, lineWidth: 2)
                                .frame(width: 52, height: 52)
                            Text(stamp.displayName.prefix(2).uppercased())
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(theme.text.tertiary)
                        }
                    }
                }

                Text(stamp.displayName)
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

// MARK: - StampCategoryPill

private struct StampCategoryPill: View {
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
