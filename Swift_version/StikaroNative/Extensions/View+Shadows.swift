import SwiftUI

// MARK: - Shadow Levels

enum AppShadows {
    struct Level: ViewModifier {
        let xOffset: CGFloat
        let yOffset: CGFloat
        let shadowOpacity: CGFloat
        let shadowRadius: CGFloat
        let shadowColor: Color

        func body(content: Content) -> some View {
            content.shadow(
                color: shadowColor.opacity(shadowOpacity),
                radius: shadowRadius,
                x: xOffset,
                y: yOffset
            )
        }
    }

    static let level0 = Level(xOffset: 0, yOffset: 0, shadowOpacity: 0, shadowRadius: 0, shadowColor: .black)
    static let level1 = Level(xOffset: 0, yOffset: 2, shadowOpacity: 0.2, shadowRadius: 8, shadowColor: .black)
    static let level2 = Level(xOffset: 0, yOffset: 4, shadowOpacity: 0.3, shadowRadius: 16, shadowColor: .black)
    static let level3 = Level(xOffset: 0, yOffset: 8, shadowOpacity: 0.4, shadowRadius: 24, shadowColor: .black)
    static let goldGlow = Level(xOffset: 0, yOffset: 8, shadowOpacity: 0.5, shadowRadius: 32, shadowColor: Color(hex: "#D4AF37"))
}

extension View {
    func shadowLevel0() -> some View { modifier(AppShadows.level0) }
    func shadowLevel1() -> some View { modifier(AppShadows.level1) }
    func shadowLevel2() -> some View { modifier(AppShadows.level2) }
    func shadowLevel3() -> some View { modifier(AppShadows.level3) }
    func goldGlowShadow() -> some View { modifier(AppShadows.goldGlow) }
}
