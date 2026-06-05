import SwiftUI

struct TextElementView: View {
    let element: CanvasElement
    let isSelected: Bool
    let canvasBounds: CGSize?
    let theme: Theme
    let onSelect: () -> Void
    let onUpdate: (ElementTransform) -> Void
    var onEdit: (() -> Void)?

    private var text: String { element.textContent ?? "Text" }
    private var fontSize: CGFloat { element.fontSize ?? 24 }
    private var fontFamily: String? { element.fontFamily }
    private var resolvedColor: Color {
        if let hex = element.color { return Color(hex: hex) }
        return theme.text.primary
    }
    private var textEffect: TextEffect { element.textEffect ?? .none }
    private var opacity: CGFloat { element.opacity ?? 1 }

    private var estimatedWidth: CGFloat { CGFloat(text.count) * fontSize * 0.6 }
    private var estimatedHeight: CGFloat { fontSize * 1.2 }

    var body: some View {
        CanvasGestureView(
            elementWidth: estimatedWidth,
            elementHeight: estimatedHeight,
            canvasBounds: canvasBounds,
            isSelected: isSelected,
            initialX: element.positionCGPoint.x,
            initialY: element.positionCGPoint.y,
            initialScale: element.scale,
            initialRotation: element.rotation,
            onSelect: onSelect,
            onUpdate: onUpdate,
            onEdit: onEdit
        ) {
            ZStack {
                // Text background pill
                if let bg = element.textBackground {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(hex: bg))
                        .padding(.horizontal, -8)
                        .padding(.vertical, -4)
                }

                // Text with effect
                textWithEffect
            }
            .opacity(opacity)
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(style: StrokeStyle(lineWidth: 1, dash: [4]))
                        .foregroundStyle(theme.accent.primary)
                        .padding(-4)
                }
            }
        }
    }

    // MARK: - Text Effects

    @ViewBuilder
    private var textWithEffect: some View {
        switch textEffect {
        case .neon:
            neonText
        case .glow:
            glowText
        case .shadow:
            shadowText
        case .outline:
            outlineText
        case .none:
            baseText
        }
    }

    private var baseText: some View {
        Text(text)
            .font(resolvedFont)
            .foregroundStyle(resolvedColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
    }

    // Neon: 3 layers with shadow glows
    private var neonText: some View {
        ZStack {
            // Outer glow
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
                .shadow(color: resolvedColor.opacity(0.8), radius: fontSize * 0.8)
                .opacity(0.8)

            // Middle glow
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
                .shadow(color: resolvedColor.opacity(0.9), radius: fontSize * 0.5)
                .opacity(0.9)

            // Core text
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }

    // Glow: 2 layers
    private var glowText: some View {
        ZStack {
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
                .shadow(color: resolvedColor.opacity(0.8), radius: fontSize * 0.4)
                .opacity(0.8)

            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }

    // Shadow: drop shadow offset
    private var shadowText: some View {
        ZStack {
            // Shadow layer
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(Color.black.opacity(0.75))
                .shadow(color: Color.black.opacity(0.5), radius: fontSize * 0.2,
                        x: fontSize * 0.15, y: fontSize * 0.15)

            // Core text
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }

    // Outline: 9 layers (3x3 grid offset)
    private var outlineText: some View {
        ZStack {
            ForEach([-1, 0, 1], id: \.self) { dx in
                ForEach([-1, 0, 1], id: \.self) { dy in
                    if dx != 0 || dy != 0 {
                        Text(text)
                            .font(resolvedFont)
                            .foregroundStyle(Color.black)
                            .offset(x: CGFloat(dx) * 2, y: CGFloat(dy) * 2)
                    }
                }
            }
            Text(text)
                .font(resolvedFont)
                .foregroundStyle(resolvedColor)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }

    private var resolvedFont: Font {
        if let family = fontFamily, family != "System" {
            return .custom(family, size: fontSize)
        }
        return .system(size: fontSize)
    }
}
