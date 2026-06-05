import SwiftUI

// MARK: - Theme

struct Theme {
    let backgrounds: Backgrounds
    let text: TextColors
    let accent: Accent
    let semantic: Semantic
    let overlays: Overlays
    let statusBarStyle: StatusBarStyle

    struct Backgrounds {
        let primary: Color
        let secondary: Color
        let tertiary: Color
        let overlay: Color
    }

    struct TextColors {
        let primary: Color
        let secondary: Color
        let tertiary: Color
        let subtle: Color
    }

    struct Accent {
        let primary: Color
        let hover: Color
        let secondary: Color
    }

    struct Semantic {
        let success: Color
        let error: Color
        let warning: Color
        let info: Color
    }

    struct Overlays {
        let light: Color
        let dark: Color
        let blur: Color
    }

    enum StatusBarStyle {
        case lightContent
        case darkContent
    }
}

// MARK: - Theme Definitions

enum AppThemes {

    static func theme(for type: ThemeType) -> Theme {
        switch type {
        case .dark:   return dark
        case .light:  return light
        case .solar:  return solar
        case .mono:   return mono
        }
    }

    static let dark = Theme(
        backgrounds: .init(
            primary:   Color(hex: "#0F0F12"),
            secondary: Color(hex: "#1A1A1D"),
            tertiary:  Color(hex: "#2A2A2E"),
            overlay:   Color.black.opacity(0.6)
        ),
        text: .init(
            primary:   Color(hex: "#FFFFFF"),
            secondary: Color(hex: "#A0A0A0"),
            tertiary:  Color(hex: "#808080"),
            subtle:    Color(hex: "#606060")
        ),
        accent: .init(
            primary:   Color(hex: "#D4AF37"),
            hover:     Color(hex: "#C5A028"),
            secondary: Color(hex: "#0A84FF")
        ),
        semantic: .init(
            success: Color(hex: "#34C759"),
            error:   Color(hex: "#FF3B30"),
            warning: Color(hex: "#FF9500"),
            info:    Color(hex: "#0A84FF")
        ),
        overlays: .init(
            light: Color.white.opacity(0.1),
            dark:  Color.black.opacity(0.4),
            blur:  Color(hex: "#1A1A1D").opacity(0.85)
        ),
        statusBarStyle: .lightContent
    )

    static let light = Theme(
        backgrounds: .init(
            primary:   Color(hex: "#FFFFFF"),
            secondary: Color(hex: "#F5F5F7"),
            tertiary:  Color(hex: "#E8E8ED"),
            overlay:   Color.black.opacity(0.3)
        ),
        text: .init(
            primary:   Color(hex: "#000000"),
            secondary: Color(hex: "#3C3C43"),
            tertiary:  Color(hex: "#8E8E93"),
            subtle:    Color(hex: "#C7C7CC")
        ),
        accent: .init(
            primary:   Color(hex: "#D4AF37"),
            hover:     Color(hex: "#C5A028"),
            secondary: Color(hex: "#007AFF")
        ),
        semantic: .init(
            success: Color(hex: "#34C759"),
            error:   Color(hex: "#FF3B30"),
            warning: Color(hex: "#FF9500"),
            info:    Color(hex: "#007AFF")
        ),
        overlays: .init(
            light: Color.black.opacity(0.05),
            dark:  Color.black.opacity(0.2),
            blur:  Color.white.opacity(0.85)
        ),
        statusBarStyle: .darkContent
    )

    static let solar = Theme(
        backgrounds: .init(
            primary:   Color(hex: "#FFF9E6"),
            secondary: Color(hex: "#FFF4D1"),
            tertiary:  Color(hex: "#FFEDB8"),
            overlay:   Color(hex: "#FFF3CC").opacity(0.6)
        ),
        text: .init(
            primary:   Color(hex: "#3D2800"),
            secondary: Color(hex: "#6B4A00"),
            tertiary:  Color(hex: "#997000"),
            subtle:    Color(hex: "#C79600")
        ),
        accent: .init(
            primary:   Color(hex: "#FF9500"),
            hover:     Color(hex: "#E68600"),
            secondary: Color(hex: "#FF6B00")
        ),
        semantic: .init(
            success: Color(hex: "#52C41A"),
            error:   Color(hex: "#F5222D"),
            warning: Color(hex: "#FA8C16"),
            info:    Color(hex: "#1890FF")
        ),
        overlays: .init(
            light: Color(hex: "#FFF3CC").opacity(0.3),
            dark:  Color(hex: "#3D2800").opacity(0.2),
            blur:  Color(hex: "#FFF9E6").opacity(0.85)
        ),
        statusBarStyle: .darkContent
    )

    static let mono = Theme(
        backgrounds: .init(
            primary:   Color(hex: "#1C1C1E"),
            secondary: Color(hex: "#2C2C2E"),
            tertiary:  Color(hex: "#3A3A3C"),
            overlay:   Color(hex: "#1C1C1E").opacity(0.6)
        ),
        text: .init(
            primary:   Color(hex: "#FFFFFF"),
            secondary: Color(hex: "#AEAEB2"),
            tertiary:  Color(hex: "#8E8E93"),
            subtle:    Color(hex: "#636366")
        ),
        accent: .init(
            primary:   Color(hex: "#FFFFFF"),
            hover:     Color(hex: "#E5E5EA"),
            secondary: Color(hex: "#C7C7CC")
        ),
        semantic: .init(
            success: Color(hex: "#FFFFFF"),
            error:   Color(hex: "#8E8E93"),
            warning: Color(hex: "#AEAEB2"),
            info:    Color(hex: "#C7C7CC")
        ),
        overlays: .init(
            light: Color.white.opacity(0.1),
            dark:  Color.black.opacity(0.4),
            blur:  Color(hex: "#2C2C2E").opacity(0.85)
        ),
        statusBarStyle: .lightContent
    )
}

// MARK: - Gradients

enum AppGradients {
    static let gold = LinearGradient(
        colors: [Color(hex: "#D4AF37"), Color(hex: "#C5A028")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let backgroundHome = LinearGradient(
        colors: [Color(hex: "#0F0F12"), Color(hex: "#1A1A1D")],
        startPoint: .top,
        endPoint: .bottom
    )

    static let backgroundOnboarding = LinearGradient(
        colors: [Color(hex: "#0F0F12"), Color(hex: "#1A1A1D")],
        startPoint: .top,
        endPoint: .bottom
    )
}
