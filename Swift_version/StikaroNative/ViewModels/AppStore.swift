import SwiftUI
import Observation

@Observable
final class AppStore {
    var hasSeenOnboarding: Bool = false
    var hasHydrated: Bool = false
    var preferences: UserPreferences = UserPreferences()

    private let storageKey = "app-storage"

    init() {
        loadFromStorage()
        hasHydrated = true
    }

    // MARK: - Actions

    func setOnboardingSeen() {
        hasSeenOnboarding = true
        saveToStorage()
    }

    func resetOnboarding() {
        hasSeenOnboarding = false
        saveToStorage()
    }

    func updatePreferences(_ updates: (inout UserPreferences) -> Void) {
        updates(&preferences)
        saveToStorage()
    }

    func updatePreferences(partial: [String: Any]) {
        // Convenience for partial updates matching RN pattern
        if let format = partial["defaultExportFormat"] as? String,
           let f = ExportFormat(rawValue: format) {
            preferences.defaultExportFormat = f
        }
        if let quality = partial["defaultExportQuality"] as? Int {
            preferences.defaultExportQuality = quality
        }
        if let autoSave = partial["autoSaveProjects"] as? Bool {
            preferences.autoSaveProjects = autoSave
        }
        if let haptic = partial["hapticFeedback"] as? Bool {
            preferences.hapticFeedback = haptic
        }
        if let theme = partial["theme"] as? String,
           let t = ThemeType(rawValue: theme) {
            preferences.theme = t
        }
        if let sound = partial["soundEnabled"] as? Bool {
            preferences.soundEnabled = sound
        }
        if let lang = partial["language"] as? String,
           let l = AppLanguage(rawValue: lang) {
            preferences.language = l
        }
        saveToStorage()
    }

    // MARK: - Device Language Detection

    static func getDeviceLanguage() -> AppLanguage {
        guard let preferred = Locale.preferredLanguages.first else { return .en }
        let code = String(preferred.prefix(while: { $0 != "-" && $0 != "_" })).lowercased()

        // Alias map matching RN deviceLanguage.ts
        let aliasMap: [String: String] = [
            "iw": "he", "in": "id", "tl": "fil", "nb": "no", "nn": "no"
        ]
        let normalized = aliasMap[code] ?? code

        return AppLanguage(rawValue: normalized) ?? .en
    }

    // MARK: - Persistence

    private struct StorableState: Codable {
        var hasSeenOnboarding: Bool
        var preferences: UserPreferences
    }

    private func loadFromStorage() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let state = try? JSONDecoder().decode(StorableState.self, from: data) else {
            // First launch — detect device language
            preferences.language = Self.getDeviceLanguage()
            return
        }
        hasSeenOnboarding = state.hasSeenOnboarding
        preferences = state.preferences
    }

    private func saveToStorage() {
        let state = StorableState(
            hasSeenOnboarding: hasSeenOnboarding,
            preferences: preferences
        )
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}
