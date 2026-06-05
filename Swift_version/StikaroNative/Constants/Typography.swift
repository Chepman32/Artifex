import SwiftUI

// MARK: - Typography

enum AppTypography {

    // Display text (Headlines, Titles) — SF Pro Display
    enum Display {
        static let hero = Font.system(size: 36, weight: .bold)
        static let h1   = Font.system(size: 32, weight: .bold)
        static let h2   = Font.system(size: 28, weight: .semibold)
        static let h3   = Font.system(size: 24, weight: .semibold)
        static let h4   = Font.system(size: 20, weight: .medium)
    }

    // Body text — SF Pro Text
    enum Body {
        static let large    = Font.system(size: 18, weight: .regular)
        static let regular  = Font.system(size: 17, weight: .regular)
        static let small    = Font.system(size: 15, weight: .regular)
        static let caption  = Font.system(size: 13, weight: .regular)
        static let finePrint = Font.system(size: 11, weight: .regular)
    }

    // UI Elements
    enum UI {
        static let button = Font.system(size: 18, weight: .semibold)
        static let tabBar = Font.system(size: 16, weight: .medium)
        static let input  = Font.system(size: 17, weight: .regular)
        static let label  = Font.system(size: 15, weight: .medium)
    }
}

// MARK: - Available Fonts for Text Tool

enum AvailableFonts {
    static let free: [String] = [
        ".SFUI-Regular",
        "HelveticaNeue",
        "Georgia",
        "CourierNewPSMT",
        "ArialRoundedMTBold",
        "Verdana",
        "TrebuchetMS",
        "Impact",
    ]

    static let pro: [String] = [
        "PlayfairDisplay-Regular",
        "Montserrat-Regular",
        "Lora-Regular",
        "Raleway-Regular",
        "Oswald-Regular",
        "Merriweather-Regular",
        "OpenSans-Regular",
        "RobotoSlab-Regular",
        "BebasNeue-Regular",
        "Pacifico-Regular",
        "DancingScript-Regular",
        "Lobster-Regular",
        "JosefinSans-Regular",
        "AbrilFatface-Regular",
        "Cinzel-Regular",
        "Anton-Regular",
        "PermanentMarker-Regular",
        "Satisfy-Regular",
        "GreatVibes-Regular",
        "Righteous-Regular",
    ]
}
