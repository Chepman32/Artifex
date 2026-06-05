import Foundation

// MARK: - LocalizationManager

enum LocalizationManager {

    /// All translations keyed by AppLanguage.
    static var allTranslations: [AppLanguage: Translations] = [
        .en: LanguageEN.translations,
    ]

    /// Returns the translations for a given language, falling back to English.
    static func translations(for language: AppLanguage) -> Translations {
        allTranslations[language] ?? allTranslations[.en]!
    }

    // MARK: - Device Language Detection

    /// Alias map for language codes that differ between platforms.
    private static let aliasMap: [String: AppLanguage] = [
        "iw": .he,
        "in": .id,
        "tl": .fil,
        "nb": .no,
        "nn": .no,
    ]

    /// Detects the device's preferred language, falling back to English.
    static func detectDeviceLanguage() -> AppLanguage {
        guard let preferred = Locale.preferredLanguages.first else { return .en }

        let normalized = preferred.replacingOccurrences(of: "_", with: "-").lowercased()
        let base = normalized.split(separator: "-").first.map(String.init) ?? normalized

        if let aliased = aliasMap[base] {
            return aliased
        }

        if let match = AppLanguage(rawValue: base) {
            return match
        }

        return .en
    }

    // MARK: - Language-to-Locale Mapping

    private static let localeMap: [AppLanguage: String] = [
        .en: "en-US", .zh: "zh-CN", .ja: "ja-JP", .ko: "ko-KR",
        .de: "de-DE", .fr: "fr-FR", .es: "es-MX", .pt: "pt-BR",
        .ar: "ar-SA", .ru: "ru-RU", .it: "it-IT", .nl: "nl-NL",
        .tr: "tr-TR", .th: "th-TH", .vi: "vi-VN", .id: "id-ID",
        .pl: "pl-PL", .uk: "uk-UA", .hi: "hi-IN", .he: "he-IL",
        .sv: "sv-SE", .no: "nb-NO", .da: "da-DK", .fi: "fi-FI",
        .cs: "cs-CZ", .hu: "hu-HU", .ro: "ro-RO", .el: "el-GR",
        .ms: "ms-MY", .fil: "fil-PH",
    ]

    static func locale(for language: AppLanguage) -> String {
        localeMap[language] ?? language.rawValue
    }

    // MARK: - String Formatting

    /// Replaces `{key}` placeholders in a string, matching the RN `formatString()`.
    static func formatString(_ template: String, _ args: [String: Any]) -> String {
        var result = template
        for (key, value) in args {
            result = result.replacingOccurrences(of: "{\(key)}", with: "\(value)")
        }
        return result
    }
}
