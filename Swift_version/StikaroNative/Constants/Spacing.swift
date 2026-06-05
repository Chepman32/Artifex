import CoreGraphics

// MARK: - Spacing (8pt grid)

enum Spacing {
    static let xxs: CGFloat = 4
    static let xs: CGFloat = 8
    static let s: CGFloat = 12
    static let m: CGFloat = 16
    static let l: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
    static let xxxl: CGFloat = 64

    // Layout margins
    static let screen: CGFloat = 16
    static let card: CGFloat = 16
    static let fullBleed: CGFloat = 0

    // Component padding
    enum ButtonPad {
        static let horizontal: CGFloat = 16
        static let vertical: CGFloat = 12
    }
    enum InputPad {
        static let all: CGFloat = 16
    }
    enum ListItemPad {
        static let horizontal: CGFloat = 16
        static let vertical: CGFloat = 12
    }
    enum ModalPad {
        static let all: CGFloat = 24
    }

    // Vertical rhythm
    static let smallGap: CGFloat = 8
    static let mediumGap: CGFloat = 16
    static let largeGap: CGFloat = 24
}

// MARK: - Component Dimensions

enum Dims {
    static let topBar: CGFloat = 56
    static let toolbar: CGFloat = 72

    enum Button {
        static let height: CGFloat = 56
        static let cornerRadius: CGFloat = 16
    }
    enum Input {
        static let height: CGFloat = 48
        static let cornerRadius: CGFloat = 12
    }
    enum FAB {
        static let size: CGFloat = 64
        static let cornerRadius: CGFloat = 32
    }

    static let minTapTarget: CGFloat = 44
    static let gridGutter: CGFloat = 16

    enum CornerRadius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xlarge: CGFloat = 24
    }
}
