import SwiftUI
import UIKit

extension Color {

    // MARK: - Hex Init

    /// Accepts "#RGB", "#RRGGBB", "#RRGGBBAA" (with or without leading "#").
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&rgb)

        switch cleaned.count {
        case 3:
            let r = CGFloat((rgb & 0xF00) >> 8) / 15
            let g = CGFloat((rgb & 0x0F0) >> 4) / 15
            let b = CGFloat(rgb & 0x00F) / 15
            self.init(red: r, green: g, blue: b)

        case 6:
            let r = CGFloat((rgb & 0xFF0000) >> 16) / 255
            let g = CGFloat((rgb & 0x00FF00) >> 8) / 255
            let b = CGFloat(rgb & 0x0000FF) / 255
            self.init(red: r, green: g, blue: b)

        case 8:
            let r = CGFloat((rgb & 0xFF000000) >> 24) / 255
            let g = CGFloat((rgb & 0x00FF0000) >> 16) / 255
            let b = CGFloat((rgb & 0x0000FF00) >> 8) / 255
            let a = CGFloat(rgb & 0x000000FF) / 255
            self.init(red: r, green: g, blue: b, opacity: a)

        default:
            self.init(.gray)
        }
    }

    // MARK: - RGBA String Init

    /// Accepts CSS-style "rgba(r,g,b,a)" or "rgb(r,g,b)" where rgb components are
    /// 0–255 integers and alpha is a 0.0–1.0 float.
    init?(rgba: String) {
        let lower = rgba
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .lowercased()

        // Strip function name and parentheses
        let isRGBA = lower.hasPrefix("rgba(")
        let isRGB  = lower.hasPrefix("rgb(")
        guard isRGBA || isRGB else { return nil }

        let prefix = isRGBA ? "rgba(" : "rgb("
        guard lower.hasSuffix(")") else { return nil }

        let inner = lower
            .dropFirst(prefix.count)
            .dropLast()

        let parts = inner
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }

        let expectedCount = isRGBA ? 4 : 3
        guard parts.count == expectedCount else { return nil }

        guard
            let r = Double(parts[0]),
            let g = Double(parts[1]),
            let b = Double(parts[2])
        else { return nil }

        let alpha: Double
        if isRGBA {
            guard let a = Double(parts[3]) else { return nil }
            alpha = a
        } else {
            alpha = 1.0
        }

        self.init(
            red:     r / 255,
            green:   g / 255,
            blue:    b / 255,
            opacity: alpha
        )
    }

    // MARK: - Convenience: auto-detect format

    /// Tries hex first, then rgba/rgb. Returns `.clear` if neither parses.
    init(cssString: String) {
        let trimmed = cssString.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.hasPrefix("#") {
            self.init(hex: trimmed)
        } else if let color = Color(rgba: trimmed) {
            self = color
        } else {
            self = .clear
        }
    }

    // MARK: - Hex String Output

    /// Returns a "#RRGGBBAA" hex string for use in serialisation.
    func toHexString() -> String? {
        guard let components = UIColor(self).cgColor.components else { return nil }

        let r, g, b, a: CGFloat
        switch components.count {
        case 2:
            r = components[0]; g = components[0]; b = components[0]; a = components[1]
        case 4...:
            r = components[0]; g = components[1]; b = components[2]; a = components[3]
        default:
            return nil
        }

        return String(
            format: "#%02X%02X%02X%02X",
            Int(r * 255),
            Int(g * 255),
            Int(b * 255),
            Int(a * 255)
        )
    }
}
