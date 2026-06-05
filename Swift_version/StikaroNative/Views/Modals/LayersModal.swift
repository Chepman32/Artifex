import SwiftUI

// MARK: - LayersModal

/// Layer management panel. Displays elements in reverse order (top layer first),
/// with per-layer select, move-up, move-down, and delete actions.
struct LayersModal: View {
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                if editorStore.canvasElements.isEmpty {
                    emptyState
                } else {
                    layerList
                }
            }
            .navigationTitle(layerCountTitle)
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

    // MARK: - Layer Count Title

    private var layerCountTitle: String {
        let count = editorStore.canvasElements.count
        return count == 1 ? "1 Layer" : "\(count) Layers"
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: Spacing.m) {
            Image(systemName: "square.3.layers.3d")
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(theme.text.subtle)
            Text("No Layers Yet")
                .font(AppTypography.Display.h4)
                .foregroundStyle(theme.text.primary)
            Text("Add text, stickers, or stamps\nto see them here.")
                .font(AppTypography.Body.small)
                .foregroundStyle(theme.text.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Layer List

    private var layerList: some View {
        List {
            // Reversed so the topmost element appears first in the list
            ForEach(editorStore.canvasElements.reversed()) { element in
                LayerRow(
                    element: element,
                    isSelected: editorStore.selectedElementId == element.id,
                    theme: theme,
                    onSelect: {
                        editorStore.selectElement(element.id)
                        if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        dismiss()
                    },
                    onMoveUp: {
                        editorStore.moveElementUp(id: element.id)
                        if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                    },
                    onMoveDown: {
                        editorStore.moveElementDown(id: element.id)
                        if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                    },
                    onDelete: {
                        editorStore.deleteElement(id: element.id)
                        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
                    }
                )
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(theme.backgrounds.primary)
    }
}

// MARK: - LayerRow

private struct LayerRow: View {
    let element: CanvasElement
    let isSelected: Bool
    let theme: Theme
    let onSelect: () -> Void
    let onMoveUp: () -> Void
    let onMoveDown: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: Spacing.s) {
            // Type icon badge
            typeBadge

            // Preview label
            labelStack

            Spacer()

            // Action buttons
            actionButtons
        }
        .padding(.vertical, Spacing.xs)
        .padding(.horizontal, Spacing.xxs)
        .background(
            isSelected
                ? theme.accent.primary.opacity(0.08)
                : Color.clear
        )
        .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.small))
        .listRowBackground(theme.backgrounds.primary)
        .listRowSeparatorTint(theme.backgrounds.tertiary)
        .contentShape(Rectangle())
        .onTapGesture(perform: onSelect)
    }

    // MARK: - Type Badge

    private var typeBadge: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                .fill(
                    isSelected
                        ? theme.accent.primary.opacity(0.15)
                        : theme.backgrounds.secondary
                )
                .frame(width: 36, height: 36)

            Group {
                switch element.type {
                case .text:
                    Text("T")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                case .sticker:
                    Image(systemName: "face.smiling")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                case .stamp:
                    Image(systemName: "seal")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                case .watermark:
                    Image(systemName: "signature")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                }
            }
        }
    }

    // MARK: - Label Stack

    private var labelStack: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(elementTypeName)
                .font(AppTypography.UI.label)
                .foregroundStyle(isSelected ? theme.accent.primary : theme.text.primary)

            Text(elementPreviewLabel)
                .font(AppTypography.Body.caption)
                .foregroundStyle(theme.text.secondary)
                .lineLimit(1)
        }
    }

    private var elementTypeName: String {
        switch element.type {
        case .text:      return "Text"
        case .sticker:   return "Sticker"
        case .stamp:     return "Stamp"
        case .watermark: return "Watermark"
        }
    }

    private var elementPreviewLabel: String {
        if let text = element.textContent, !text.isEmpty {
            return text
        }
        if let path = element.assetPath {
            return (path as NSString).lastPathComponent
        }
        return elementTypeName
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        HStack(spacing: Spacing.xxs) {
            // Move Up (higher in z-order = higher index)
            LayerActionButton(
                systemImage: "arrow.up",
                foregroundColor: theme.text.secondary,
                action: onMoveUp
            )

            // Move Down
            LayerActionButton(
                systemImage: "arrow.down",
                foregroundColor: theme.text.secondary,
                action: onMoveDown
            )

            // Delete
            LayerActionButton(
                systemImage: "trash",
                foregroundColor: theme.semantic.error,
                action: onDelete
            )
        }
    }
}

// MARK: - LayerActionButton

private struct LayerActionButton: View {
    let systemImage: String
    let foregroundColor: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(foregroundColor)
                .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
