import SwiftUI

// MARK: - SettingsScreen

struct SettingsScreen: View {
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    private var theme: Theme {
        AppThemes.theme(for: appStore.preferences.theme)
    }

    // Modal presentation state
    @State private var showThemePicker: Bool = false
    @State private var showLanguagePicker: Bool = false
    @State private var showFormatPicker: Bool = false

    // Alert state
    @State private var showClearCacheConfirm: Bool = false
    @State private var showDeleteAllConfirm: Bool = false
    @State private var cacheCleared: Bool = false

    private var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                List {
                    appearanceSection
                    preferencesSection
                    exportSection
                    dataSection
                    aboutSection
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
                .background(theme.backgrounds.primary)
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .sheet(isPresented: $showThemePicker) {
            ThemePickerModal(theme: theme)
                .environment(appStore)
        }
        .sheet(isPresented: $showLanguagePicker) {
            LanguagePickerModal(theme: theme)
                .environment(appStore)
        }
        .sheet(isPresented: $showFormatPicker) {
            FormatPickerModal(theme: theme)
                .environment(appStore)
        }
        .alert("Clear Cache", isPresented: $showClearCacheConfirm) {
            Button("Clear", role: .destructive) { clearCache() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will remove all cached images and temporary files.")
        }
        .alert("Delete All Projects", isPresented: $showDeleteAllConfirm) {
            Button("Delete All", role: .destructive) { deleteAllProjects() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will permanently delete all your projects. This action cannot be undone.")
        }
    }

    // MARK: - Appearance Section

    private var appearanceSection: some View {
        Section {
            // Theme
            Button {
                showThemePicker = true
            } label: {
                SettingsRow(
                    icon: "paintpalette",
                    iconColor: .purple,
                    title: "Theme",
                    value: appStore.preferences.theme.rawValue.capitalized,
                    theme: theme
                )
            }

            // Language
            Button {
                showLanguagePicker = true
            } label: {
                SettingsRow(
                    icon: "globe",
                    iconColor: .blue,
                    title: "Language",
                    value: appStore.preferences.language.displayName,
                    theme: theme
                )
            }
        } header: {
            sectionHeader("Appearance")
        }
        .listRowBackground(theme.backgrounds.secondary)
    }

    // MARK: - Preferences Section

    private var preferencesSection: some View {
        Section {
            // Haptic feedback toggle
            SettingsToggleRow(
                icon: "iphone.radiowaves.left.and.right",
                iconColor: Color(hex: "#FF9500"),
                title: "Haptic Feedback",
                isOn: Binding(
                    get: { appStore.preferences.hapticFeedback },
                    set: { newValue in
                        appStore.updatePreferences { $0.hapticFeedback = newValue }
                        HapticManager.shared.isEnabled = newValue
                        if newValue { HapticManager.shared.light() }
                    }
                ),
                theme: theme
            )

            // Auto-save toggle
            SettingsToggleRow(
                icon: "arrow.triangle.2.circlepath",
                iconColor: Color(hex: "#34C759"),
                title: "Auto-Save Projects",
                isOn: Binding(
                    get: { appStore.preferences.autoSaveProjects },
                    set: { newValue in appStore.updatePreferences { $0.autoSaveProjects = newValue } }
                ),
                theme: theme
            )
        } header: {
            sectionHeader("Preferences")
        }
        .listRowBackground(theme.backgrounds.secondary)
    }

    // MARK: - Export Section

    private var exportSection: some View {
        Section {
            // Default format
            Button {
                showFormatPicker = true
            } label: {
                SettingsRow(
                    icon: "square.and.arrow.up",
                    iconColor: Color(hex: "#0A84FF"),
                    title: "Default Format",
                    value: appStore.preferences.defaultExportFormat.rawValue.uppercased(),
                    theme: theme
                )
            }

            // Default quality (slider row)
            VStack(spacing: Spacing.xs) {
                HStack {
                    Image(systemName: "slider.horizontal.3")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(.white)
                        .frame(width: 28, height: 28)
                        .background(Color(hex: "#5AC8FA"))
                        .clipShape(RoundedRectangle(cornerRadius: 6))

                    Text("Default Quality")
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.text.primary)

                    Spacer()

                    Text("\(appStore.preferences.defaultExportQuality)%")
                        .font(AppTypography.Body.caption)
                        .foregroundStyle(theme.text.secondary)
                }

                Slider(
                    value: Binding(
                        get: { Double(appStore.preferences.defaultExportQuality) },
                        set: { appStore.updatePreferences { $0.defaultExportQuality = Int($0) } }
                    ),
                    in: 10...100,
                    step: 5
                )
                .tint(theme.accent.primary)
            }
            .padding(.vertical, Spacing.xxs)
        } header: {
            sectionHeader("Export")
        }
        .listRowBackground(theme.backgrounds.secondary)
    }

    // MARK: - Data Section

    private var dataSection: some View {
        Section {
            // Export all projects
            Button {
                exportAllProjects()
            } label: {
                SettingsRow(
                    icon: "tray.and.arrow.up",
                    iconColor: Color(hex: "#D4AF37"),
                    title: "Export All Projects",
                    value: nil,
                    theme: theme,
                    showChevron: false
                )
            }

            // Clear cache
            Button {
                showClearCacheConfirm = true
            } label: {
                SettingsRow(
                    icon: "trash.slash",
                    iconColor: Color(hex: "#FF9500"),
                    title: cacheCleared ? "Cache Cleared" : "Clear Cache",
                    value: nil,
                    theme: theme,
                    showChevron: false,
                    titleColor: cacheCleared ? theme.semantic.success : theme.text.primary
                )
            }
            .disabled(cacheCleared)

            // Delete all projects
            Button {
                showDeleteAllConfirm = true
            } label: {
                SettingsRow(
                    icon: "trash",
                    iconColor: theme.semantic.error,
                    title: "Delete All Projects",
                    value: nil,
                    theme: theme,
                    showChevron: false,
                    titleColor: theme.semantic.error
                )
            }
        } header: {
            sectionHeader("Data")
        }
        .listRowBackground(theme.backgrounds.secondary)
    }

    // MARK: - About Section

    private var aboutSection: some View {
        Section {
            SettingsRow(
                icon: "info.circle",
                iconColor: Color(hex: "#8E8E93"),
                title: "Version",
                value: appVersion,
                theme: theme,
                showChevron: false
            )
        } header: {
            sectionHeader("About")
        }
        .listRowBackground(theme.backgrounds.secondary)
    }

    // MARK: - Section Header

    private func sectionHeader(_ text: String) -> some View {
        Text(text)
            .font(AppTypography.Body.caption)
            .foregroundStyle(theme.text.secondary)
            .textCase(.uppercase)
    }

    // MARK: - Actions

    private func clearCache() {
        let tempDir = FileManager.default.temporaryDirectory
        let caches = try? FileManager.default.contentsOfDirectory(at: tempDir, includingPropertiesForKeys: nil)
        caches?.forEach { try? FileManager.default.removeItem(at: $0) }
        if appStore.preferences.hapticFeedback { HapticManager.shared.success() }
        cacheCleared = true
    }

    private func deleteAllProjects() {
        if appStore.preferences.hapticFeedback { HapticManager.shared.heavy() }
        Task {
            let all = await ProjectDatabase.shared.getAll()
            let ids = all.map(\.id)
            try? await ProjectDatabase.shared.deleteMultiple(ids)
        }
    }

    private func exportAllProjects() {
        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
        // Full export-all implementation would zip project files
    }
}

// MARK: - Settings Row

private struct SettingsRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let value: String?
    let theme: Theme
    var showChevron: Bool = true
    var titleColor: Color? = nil

    var body: some View {
        HStack(spacing: Spacing.s) {
            // Icon badge
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.white)
                .frame(width: 28, height: 28)
                .background(iconColor)
                .clipShape(RoundedRectangle(cornerRadius: 6))

            Text(title)
                .font(AppTypography.UI.label)
                .foregroundStyle(titleColor ?? theme.text.primary)

            Spacer()

            if let value {
                Text(value)
                    .font(AppTypography.Body.caption)
                    .foregroundStyle(theme.text.secondary)
            }

            if showChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(theme.text.subtle)
            }
        }
        .padding(.vertical, Spacing.xxs)
        .contentShape(Rectangle())
    }
}

// MARK: - Settings Toggle Row

private struct SettingsToggleRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    @Binding var isOn: Bool
    let theme: Theme

    var body: some View {
        HStack(spacing: Spacing.s) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.white)
                .frame(width: 28, height: 28)
                .background(iconColor)
                .clipShape(RoundedRectangle(cornerRadius: 6))

            Text(title)
                .font(AppTypography.UI.label)
                .foregroundStyle(theme.text.primary)

            Spacer()

            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(theme.accent.primary)
        }
        .padding(.vertical, Spacing.xxs)
    }
}

// MARK: - Theme Picker Modal

struct ThemePickerModal: View {
    let theme: Theme
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    private let themes: [(ThemeType, String, String, Color)] = [
        (.dark,  "Dark",   "moon.fill",    Color(hex: "#0F0F12")),
        (.light, "Light",  "sun.max.fill", Color(hex: "#FFFFFF")),
        (.solar, "Solar",  "sun.haze.fill",Color(hex: "#FF9500")),
        (.mono,  "Mono",   "circle.lefthalf.filled", Color(hex: "#8E8E93"))
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                List {
                    ForEach(themes, id: \.0) { themeType, name, icon, color in
                        Button {
                            appStore.updatePreferences { $0.theme = themeType }
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            HStack(spacing: Spacing.s) {
                                Image(systemName: icon)
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundStyle(themeType == .light ? .black : .white)
                                    .frame(width: 36, height: 36)
                                    .background(color)
                                    .clipShape(Circle())
                                    .overlay(
                                        Circle().strokeBorder(Color.gray.opacity(0.2), lineWidth: 0.5)
                                    )

                                Text(name)
                                    .font(AppTypography.UI.label)
                                    .foregroundStyle(theme.text.primary)

                                Spacer()

                                if appStore.preferences.theme == themeType {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(theme.accent.primary)
                                }
                            }
                            .padding(.vertical, Spacing.xxs)
                        }
                        .listRowBackground(theme.backgrounds.secondary)
                    }
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
                .background(theme.backgrounds.primary)
            }
            .navigationTitle("Theme")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }
}

// MARK: - Language Picker Modal

struct LanguagePickerModal: View {
    let theme: Theme
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    // Country flag emoji mapping
    private let flagMap: [AppLanguage: String] = [
        .en: "🇺🇸", .zh: "🇨🇳", .ja: "🇯🇵", .ko: "🇰🇷",
        .de: "🇩🇪", .fr: "🇫🇷", .es: "🇪🇸", .pt: "🇧🇷",
        .ar: "🇸🇦", .ru: "🇷🇺", .it: "🇮🇹", .nl: "🇳🇱",
        .tr: "🇹🇷", .th: "🇹🇭", .vi: "🇻🇳", .id: "🇮🇩",
        .pl: "🇵🇱", .uk: "🇺🇦", .hi: "🇮🇳", .he: "🇮🇱",
        .sv: "🇸🇪", .no: "🇳🇴", .da: "🇩🇰", .fi: "🇫🇮",
        .cs: "🇨🇿", .hu: "🇭🇺", .ro: "🇷🇴", .el: "🇬🇷",
        .ms: "🇲🇾", .fil: "🇵🇭"
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                List {
                    ForEach(AppLanguage.allCases, id: \.self) { language in
                        Button {
                            appStore.updatePreferences { $0.language = language }
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            HStack(spacing: Spacing.s) {
                                Text(flagMap[language] ?? "🌐")
                                    .font(.system(size: 24))
                                    .frame(width: 36, height: 36)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(language.displayName)
                                        .font(AppTypography.UI.label)
                                        .foregroundStyle(theme.text.primary)
                                    Text(language.rawValue.uppercased())
                                        .font(AppTypography.Body.finePrint)
                                        .foregroundStyle(theme.text.secondary)
                                }

                                Spacer()

                                if appStore.preferences.language == language {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(theme.accent.primary)
                                }
                            }
                            .padding(.vertical, Spacing.xxs)
                        }
                        .listRowBackground(theme.backgrounds.secondary)
                    }
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
                .background(theme.backgrounds.primary)
            }
            .navigationTitle("Language")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }
}

// MARK: - Format Picker Modal

private struct FormatPickerModal: View {
    let theme: Theme
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                List {
                    ForEach([ExportFormat.png, ExportFormat.jpg], id: \.self) { format in
                        Button {
                            appStore.updatePreferences { $0.defaultExportFormat = format }
                            if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(format.rawValue.uppercased())
                                        .font(AppTypography.UI.label)
                                        .foregroundStyle(theme.text.primary)
                                    Text(format == .png ? "Lossless, supports transparency" : "Smaller file size")
                                        .font(AppTypography.Body.caption)
                                        .foregroundStyle(theme.text.secondary)
                                }

                                Spacer()

                                if appStore.preferences.defaultExportFormat == format {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(theme.accent.primary)
                                }
                            }
                            .padding(.vertical, Spacing.xxs)
                        }
                        .listRowBackground(theme.backgrounds.secondary)
                    }
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
                .background(theme.backgrounds.primary)
            }
            .navigationTitle("Default Format")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }
}
