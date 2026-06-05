import SwiftUI

// MARK: - GoldButton

/// Reusable gold CTA button with press animation, disabled state, and glow shadow.
struct GoldButton: View {
    let title: String
    let isDisabled: Bool
    let action: () -> Void

    @State private var isPressed: Bool = false

    init(_ title: String, isDisabled: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: {
            guard !isDisabled else { return }
            action()
        }) {
            Text(title)
                .font(AppTypography.UI.button)
                .foregroundStyle(Color(hex: "#0F0F12"))
                .frame(maxWidth: .infinity)
                .frame(height: Dims.Button.height)
                .background(AppGradients.gold)
                .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                .goldGlowShadow()
        }
        .opacity(isDisabled ? 0.5 : 1.0)
        .scaleEffect(isPressed ? 0.96 : 1.0)
        .animation(.spring(response: 0.2, dampingFraction: 0.7), value: isPressed)
        .disabled(isDisabled)
        ._onButtonGesture(pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}
