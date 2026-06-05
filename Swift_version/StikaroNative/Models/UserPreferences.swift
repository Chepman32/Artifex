import Foundation

// MARK: - ExportFormat

enum ExportFormat: String, Codable {
    case png
    case jpg
}

// MARK: - ColorSchemePreference

enum ColorSchemePreference: String, Codable {
    case auto
    case light
    case dark
}

// MARK: - ThemeType

enum ThemeType: String, Codable, CaseIterable {
    case light
    case dark
    case solar
    case mono
}

// MARK: - AppLanguage

enum AppLanguage: String, Codable, CaseIterable {
    case en, zh, ja, ko, de, fr, es, pt, ar, ru
    case it, nl, tr, th, vi, id, pl, uk, hi, he
    case sv, no, da, fi, cs, hu, ro, el, ms, fil

    var displayName: String {
        switch self {
        case .en: return "English"
        case .zh: return "中文"
        case .ja: return "日本語"
        case .ko: return "한국어"
        case .de: return "Deutsch"
        case .fr: return "Français"
        case .es: return "Español"
        case .pt: return "Português"
        case .ar: return "العربية"
        case .ru: return "Русский"
        case .it: return "Italiano"
        case .nl: return "Nederlands"
        case .tr: return "Türkçe"
        case .th: return "ไทย"
        case .vi: return "Tiếng Việt"
        case .id: return "Bahasa Indonesia"
        case .pl: return "Polski"
        case .uk: return "Українська"
        case .hi: return "हिन्दी"
        case .he: return "עברית"
        case .sv: return "Svenska"
        case .no: return "Norsk"
        case .da: return "Dansk"
        case .fi: return "Suomi"
        case .cs: return "Čeština"
        case .hu: return "Magyar"
        case .ro: return "Română"
        case .el: return "Ελληνικά"
        case .ms: return "Bahasa Melayu"
        case .fil: return "Filipino"
        }
    }
}

// MARK: - UserPreferences

struct UserPreferences: Codable, Equatable {
    var defaultExportFormat: ExportFormat = .png
    var defaultExportQuality: Int = 100
    var autoSaveProjects: Bool = true
    var hapticFeedback: Bool = true
    var colorScheme: ColorSchemePreference = .auto
    var theme: ThemeType = .dark
    var soundEnabled: Bool = true
    var language: AppLanguage = .en
}
