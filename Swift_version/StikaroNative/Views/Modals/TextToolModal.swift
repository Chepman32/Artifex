import SwiftUI

// MARK: - TextToolModal

/// Full-featured text tool modal for adding and editing text canvas elements.
struct TextToolModal: View {
    let elementId: String?
    let initialText: String
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    // Text content
    @State private var text: String = ""
    // Font
    @State private var selectedFont: String = AvailableFonts.free[0]
    // Size
    @State private var fontSize: CGFloat = 32
    // Color
    @State private var selectedColorHex: String = "#FFFFFF"
    // Effect
    @State private var selectedEffect: TextEffect = .none
    // Background
    @State private var selectedBackgroundHex: String? = nil

    var isEditing: Bool { elementId != nil }

    // MARK: - Color presets

    private struct ColorOption: Identifiable {
        let id = UUID()
        let hex: String
        let color: Color
    }

    private let colorOptions: [ColorOption] = [
        .init(hex: "#FFFFFF", color: .white),
        .init(hex: "#000000", color: .black),
        .init(hex: "#FF3B30", color: Color(hex: "#FF3B30")),
        .init(hex: "#FF9500", color: Color(hex: "#FF9500")),
        .init(hex: "#FFCC00", color: Color(hex: "#FFCC00")),
        .init(hex: "#34C759", color: Color(hex: "#34C759")),
        .init(hex: "#0A84FF", color: Color(hex: "#0A84FF")),
        .init(hex: "#AF52DE", color: Color(hex: "#AF52DE")),
        .init(hex: "#FF2D55", color: Color(hex: "#FF2D55")),
    ]

    // MARK: - Background presets

    private struct BackgroundOption: Identifiable {
        let id = UUID()
        let label: String
        let hex: String?
        let color: Color
    }

    private let backgroundOptions: [BackgroundOption] = [
        .init(label: "None",  hex: nil,       color: .clear),
        .init(label: "Black", hex: "#000000",  color: .black),
        .init(label: "White", hex: "#FFFFFF",  color: .white),
        .init(label: "Gray",  hex: "#808080",  color: Color(hex: "#808080")),
        .init(label: "Red",   hex: "#FF3B30",  color: Color(hex: "#FF3B30")),
        .init(label: "Blue",  hex: "#0A84FF",  color: Color(hex: "#0A84FF")),
    ]

    // MARK: - Size presets

    private let sizePresets: [CGFloat] = [12, 16, 20, 24, 32, 40, 48, 64]

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: Spacing.l) {
                        textPreview
                        textEditorSection
                        fontSection
                        sizeSection
                        colorSection
                        effectSection
                        backgroundSection
                        addButton
                    }
                    .padding(.horizontal, Spacing.m)
                    .padding(.top, Spacing.m)
                    .padding(.bottom, Spacing.xxl)
                }
            }
            .navigationTitle(isEditing ? "Edit Text" : "Add Text")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(theme.text.secondary)
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .onAppear { loadInitialState() }
    }

    // MARK: - Text Preview

    private var textPreview: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                .fill(theme.backgrounds.secondary)
                .frame(height: 120)

            if text.isEmpty {
                Text("Type something…")
                    .font(.system(size: 22))
                    .foregroundStyle(theme.text.subtle)
            } else {
                let bgColor = selectedBackgroundHex.map { Color(hex: $0) }
                ZStack {
                    if let bg = bgColor {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(bg)
                            .padding(.horizontal, -8)
                            .padding(.vertical, -4)
                    }
                    previewText
                }
                .padding(Spacing.xs)
            }
        }
    }

    @ViewBuilder
    private var previewText: some View {
        let color = Color(hex: selectedColorHex)
        switch selectedEffect {
        case .none:
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(color)
                .multilineTextAlignment(.center)
        case .neon:
            ZStack {
                Text(text).font(resolvedFont).foregroundStyle(color)
                    .shadow(color: color.opacity(0.8), radius: fontSize * 0.8).opacity(0.8)
                Text(text).font(resolvedFont).foregroundStyle(color)
                    .shadow(color: color.opacity(0.9), radius: fontSize * 0.4).opacity(0.9)
                Text(text).font(resolvedFont).foregroundStyle(color)
            }
            .multilineTextAlignment(.center)
        case .glow:
            ZStack {
                Text(text).font(resolvedFont).foregroundStyle(color)
                    .shadow(color: color.opacity(0.8), radius: fontSize * 0.4).opacity(0.8)
                Text(text).font(resolvedFont).foregroundStyle(color)
            }
            .multilineTextAlignment(.center)
        case .shadow:
            ZStack {
                Text(text).font(resolvedFont).foregroundStyle(Color.black.opacity(0.7))
                    .offset(x: 3, y: 3)
                Text(text).font(resolvedFont).foregroundStyle(color)
            }
            .multilineTextAlignment(.center)
        case .outline:
            ZStack {
                ForEach([-2, 0, 2], id: \.self) { dx in
                    ForEach([-2, 0, 2], id: \.self) { dy in
                        if dx != 0 || dy != 0 {
                            Text(text).font(resolvedFont).foregroundStyle(Color.black)
                                .offset(x: CGFloat(dx), y: CGFloat(dy))
                        }
                    }
                }
                Text(text).font(resolvedFont).foregroundStyle(color)
            }
            .multilineTextAlignment(.center)
        }
    }

    private var resolvedFont: Font {
        if selectedFont == ".SFUI-Regular" || selectedFont == "System" {
            return .system(size: min(fontSize, 36))
        }
        return .custom(selectedFont, size: min(fontSize, 36))
    }

    // MARK: - Text Editor

    private var textEditorSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            SectionLabel("Text", theme: theme)
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                    .fill(theme.backgrounds.secondary)
                    .frame(minHeight: 80)

                if text.isEmpty {
                    Text("Enter your text here…")
                        .font(AppTypography.UI.input)
                        .foregroundStyle(theme.text.subtle)
                        .padding(.horizontal, Spacing.m)
                        .padding(.top, Spacing.s)
                        .allowsHitTesting(false)
                }

                TextEditor(text: $text)
                    .font(AppTypography.UI.input)
                    .foregroundStyle(theme.text.primary)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, Spacing.xs)
                    .padding(.vertical, Spacing.xs)
                    .frame(minHeight: 80)
            }
        }
    }

    // MARK: - Font Section

    private var fontSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            SectionLabel("Font", theme: theme)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(AvailableFonts.free, id: \.self) { fontName in
                        let isSelected = selectedFont == fontName
                        let displayName = fontDisplayName(fontName)
                        Button {
                            selectedFont = fontName
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            Text(displayName)
                                .font(fontName == ".SFUI-Regular" ? .system(size: 14) : .custom(fontName, size: 14))
                                .foregroundStyle(isSelected ? Color(hex: "#0F0F12") : theme.text.primary)
                                .lineLimit(1)
                                .padding(.horizontal, Spacing.s)
                                .padding(.vertical, Spacing.xs)
                                .background(
                                    isSelected
                                        ? AppGradients.gold
                                        : LinearGradient(colors: [theme.backgrounds.secondary], startPoint: .top, endPoint: .bottom)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.small))
                                .overlay(
                                    RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                                        .strokeBorder(isSelected ? Color.clear : theme.backgrounds.tertiary, lineWidth: 1)
                                )
                        }
                    }
                }
                .padding(.horizontal, Spacing.xxs)
                .padding(.vertical, Spacing.xxs)
            }
        }
    }

    private func fontDisplayName(_ name: String) -> String {
        switch name {
        case ".SFUI-Regular":    return "System"
        case "HelveticaNeue":    return "Helvetica"
        case "Georgia":          return "Georgia"
        case "CourierNewPSMT":   return "Courier"
        case "ArialRoundedMTBold": return "Arial Rounded"
        case "Verdana":          return "Verdana"
        case "TrebuchetMS":      return "Trebuchet"
        case "Impact":           return "Impact"
        default:                 return name
        }
    }

    // MARK: - Size Section

    private var sizeSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            SectionLabel("Size", theme: theme)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(sizePresets, id: \.self) { size in
                        let isSelected = fontSize == size
                        Button {
                            fontSize = size
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            Text("\(Int(size))")
                                .font(AppTypography.UI.label)
                                .foregroundStyle(isSelected ? Color(hex: "#0F0F12") : theme.text.primary)
                                .frame(width: 44, height: 36)
                                .background(
                                    isSelected
                                        ? AppGradients.gold
                                        : LinearGradient(colors: [theme.backgrounds.secondary], startPoint: .top, endPoint: .bottom)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.small))
                                .overlay(
                                    RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                                        .strokeBorder(isSelected ? Color.clear : theme.backgrounds.tertiary, lineWidth: 1)
                                )
                        }
                    }
                }
                .padding(.horizontal, Spacing.xxs)
                .padding(.vertical, Spacing.xxs)
            }
        }
    }

    // MARK: - Color Section

    private var colorSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            SectionLabel("Color", theme: theme)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.s) {
                    ForEach(colorOptions) { option in
                        let isSelected = selectedColorHex == option.hex
                        Button {
                            selectedColorHex = option.hex
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            Circle()
                                .fill(option.color)
                                .frame(width: 32, height: 32)
                                .overlay(
                                    Circle()
                                        .strokeBorder(
                                            isSelected ? theme.accent.primary : Color.white.opacity(0.15),
                                            lineWidth: isSelected ? 2.5 : 1
                                        )
                                )
                                .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 1)
                                .scaleEffect(isSelected ? 1.15 : 1.0)
                                .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isSelected)
                        }
                    }
                }
                .padding(.horizontal, Spacing.xxs)
                .padding(.vertical, Spacing.xxs)
            }
        }
    }

    // MARK: - Effect Section

    private var effectSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            SectionLabel("Effect", theme: theme)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(TextEffect.allCases, id: \.self) { effect in
                        let isSelected = selectedEffect == effect
                        Button {
                            selectedEffect = effect
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            Text(effectLabel(effect))
                                .font(AppTypography.UI.label)
                                .foregroundStyle(isSelected ? Color(hex: "#0F0F12") : theme.text.primary)
                                .padding(.horizontal, Spacing.s)
                                .padding(.vertical, Spacing.xs)
                                .background(
                                    isSelected
                                        ? AppGradients.gold
                                        : LinearGradient(colors: [theme.backgrounds.secondary], startPoint: .top, endPoint: .bottom)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.small))
                                .overlay(
                                    RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                                        .strokeBorder(isSelected ? Color.clear : theme.backgrounds.tertiary, lineWidth: 1)
                                )
                        }
                    }
                }
                .padding(.horizontal, Spacing.xxs)
                .padding(.vertical, Spacing.xxs)
            }
        }
    }

    private func effectLabel(_ effect: TextEffect) -> String {
        switch effect {
        case .none:    return "None"
        case .neon:    return "Neon"
        case .glow:    return "Glow"
        case .shadow:  return "Shadow"
        case .outline: return "Outline"
        }
    }

    // MARK: - Background Section

    private var backgroundSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            SectionLabel("Background", theme: theme)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(backgroundOptions) { option in
                        let isSelected = selectedBackgroundHex == option.hex
                        Button {
                            selectedBackgroundHex = option.hex
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            VStack(spacing: 4) {
                                ZStack {
                                    if option.hex == nil {
                                        // Transparent checker pattern representation
                                        RoundedRectangle(cornerRadius: 6)
                                            .fill(theme.backgrounds.tertiary)
                                            .frame(width: 36, height: 36)
                                        Image(systemName: "slash.circle")
                                            .font(.system(size: 16))
                                            .foregroundStyle(theme.text.tertiary)
                                    } else {
                                        RoundedRectangle(cornerRadius: 6)
                                            .fill(option.color)
                                            .frame(width: 36, height: 36)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 6)
                                                    .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
                                            )
                                    }
                                    if isSelected {
                                        RoundedRectangle(cornerRadius: 6)
                                            .strokeBorder(theme.accent.primary, lineWidth: 2.5)
                                            .frame(width: 36, height: 36)
                                    }
                                }
                                Text(option.label)
                                    .font(AppTypography.Body.finePrint)
                                    .foregroundStyle(isSelected ? theme.accent.primary : theme.text.secondary)
                            }
                        }
                    }
                }
                .padding(.horizontal, Spacing.xxs)
                .padding(.vertical, Spacing.xxs)
            }
        }
    }

    // MARK: - Add / Update Button

    private var addButton: some View {
        GoldButton(isEditing ? "Update Text" : "Add Text", isDisabled: text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) {
            commitText()
            if appStore.preferences.hapticFeedback { HapticManager.shared.success() }
            dismiss()
        }
    }

    // MARK: - Helpers

    private func loadInitialState() {
        text = initialText
        if let id = elementId,
           let element = editorStore.canvasElements.first(where: { $0.id == id }) {
            selectedFont = element.fontFamily ?? AvailableFonts.free[0]
            fontSize = element.fontSize ?? 32
            selectedColorHex = element.color ?? "#FFFFFF"
            selectedEffect = element.textEffect ?? .none
            selectedBackgroundHex = element.textBackground
        }
    }

    private func commitText() {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let bgHex = selectedBackgroundHex

        if let id = elementId {
            editorStore.updateElement(id: id) { el in
                el.textContent = trimmed
                el.fontFamily = selectedFont
                el.fontSize = fontSize
                el.color = selectedColorHex
                el.textEffect = selectedEffect
                el.textBackground = bgHex
            }
        } else {
            let center = CGPoint(
                x: (editorStore.canvasSize?.width ?? 500) / 2,
                y: (editorStore.canvasSize?.height ?? 500) / 2
            )
            let element = CanvasElement(
                type: .text,
                position: center,
                scale: 1.0,
                rotation: 0,
                opacity: 1.0,
                textContent: trimmed,
                fontFamily: selectedFont,
                fontSize: fontSize,
                color: selectedColorHex,
                textEffect: selectedEffect,
                textBackground: bgHex
            )
            editorStore.addElement(element)
        }
    }
}

// MARK: - SectionLabel helper

private struct SectionLabel: View {
    let title: String
    let theme: Theme

    init(_ title: String, theme: Theme) {
        self.title = title
        self.theme = theme
    }

    var body: some View {
        Text(title)
            .font(AppTypography.UI.label)
            .foregroundStyle(theme.text.secondary)
    }
}
