import SwiftUI
import Photos

// MARK: - ExportModal

/// Export dialog for saving to Photos or sharing via URL schemes.
/// Supports PNG and JPG format selection with quality control for JPG.
struct ExportModal: View {
    let theme: Theme

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    @State private var exportFormat: ExportFormat = .png
    @State private var quality: Double = 90
    @State private var isExporting: Bool = false
    @State private var exportPhase: ExportPhase = .idle
    @State private var errorMessage: String? = nil

    enum ExportPhase {
        case idle
        case exporting
        case success
        case failed(String)
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: Spacing.l) {
                        formatPicker
                        if exportFormat == .jpg { qualitySlider }
                        Divider().overlay(theme.backgrounds.tertiary)
                        actionButtons
                        if case .failed(let msg) = exportPhase { errorBanner(msg) }
                    }
                    .padding(.horizontal, Spacing.l)
                    .padding(.top, Spacing.l)
                    .padding(.bottom, Spacing.xxl)
                }

                // Loading overlay
                if case .exporting = exportPhase {
                    loadingOverlay
                }
            }
            .navigationTitle("Export")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
        .onAppear {
            exportFormat = appStore.preferences.defaultExportFormat
            quality = Double(appStore.preferences.defaultExportQuality)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Format Picker

    private var formatPicker: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Format")
                .font(AppTypography.UI.label)
                .foregroundStyle(theme.text.secondary)

            HStack(spacing: Spacing.xs) {
                ForEach([ExportFormat.png, ExportFormat.jpg], id: \.self) { format in
                    Button {
                        withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                            exportFormat = format
                        }
                        if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                    } label: {
                        Text(format.rawValue.uppercased())
                            .font(AppTypography.UI.button)
                            .foregroundStyle(exportFormat == format ? Color(hex: "#0F0F12") : theme.text.primary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                exportFormat == format
                                    ? AppGradients.gold
                                    : LinearGradient(colors: [theme.backgrounds.secondary], startPoint: .top, endPoint: .bottom)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.medium))
                            .overlay(
                                RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                                    .strokeBorder(
                                        exportFormat == format ? Color.clear : theme.backgrounds.tertiary,
                                        lineWidth: 1
                                    )
                            )
                    }
                }
            }
        }
    }

    // MARK: - Quality Slider

    private var qualitySlider: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack {
                Text("Quality")
                    .font(AppTypography.UI.label)
                    .foregroundStyle(theme.text.secondary)
                Spacer()
                Text("\(Int(quality))%")
                    .font(.system(size: 15, weight: .semibold, design: .monospaced))
                    .foregroundStyle(theme.accent.primary)
                    .frame(width: 48, alignment: .trailing)
            }

            Slider(value: $quality, in: 10...100, step: 5)
                .tint(theme.accent.primary)

            HStack {
                Text("Smaller file")
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(theme.text.subtle)
                Spacer()
                Text("Best quality")
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(theme.text.subtle)
            }
        }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: Spacing.s) {
            // Save to Photos
            ExportActionButton(
                systemImage: "photo.fill.on.rectangle.fill",
                title: saveButtonTitle,
                subtitle: "Save image to your camera roll",
                isLoading: isExporting,
                isPrimary: true,
                theme: theme
            ) {
                performSaveToPhotos()
            }
            .disabled(isExporting || exportPhase == .success)

            // Share to Instagram
            ExportActionButton(
                systemImage: "camera.fill",
                title: "Share to Instagram",
                subtitle: "Open in Instagram Stories",
                isLoading: false,
                isPrimary: false,
                theme: theme
            ) {
                shareToInstagram()
            }
            .disabled(isExporting)

            // Share to X (Twitter)
            ExportActionButton(
                systemImage: "bird.fill",
                title: "Share to X",
                subtitle: "Post on X (Twitter)",
                isLoading: false,
                isPrimary: false,
                theme: theme
            ) {
                shareToX()
            }
            .disabled(isExporting)
        }
    }

    private var saveButtonTitle: String {
        switch exportPhase {
        case .idle:             return "Save to Photos"
        case .exporting:        return "Saving…"
        case .success:          return "Saved!"
        case .failed:           return "Save to Photos"
        }
    }

    // MARK: - Loading Overlay

    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            VStack(spacing: Spacing.m) {
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(theme.accent.primary)
                    .scaleEffect(1.4)
                Text("Exporting…")
                    .font(AppTypography.Body.small)
                    .foregroundStyle(theme.text.secondary)
            }
            .padding(Spacing.xl)
            .background(
                RoundedRectangle(cornerRadius: Dims.CornerRadius.large)
                    .fill(theme.backgrounds.secondary)
            )
        }
    }

    // MARK: - Error Banner

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(theme.semantic.error)
            Text(message)
                .font(AppTypography.Body.small)
                .foregroundStyle(theme.text.primary)
        }
        .padding(Spacing.m)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                .fill(theme.semantic.error.opacity(0.12))
        )
    }

    // MARK: - Export Actions

    private func performSaveToPhotos() {
        guard let image = renderCanvas() else {
            exportPhase = .failed("Could not render the canvas.")
            return
        }

        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
        exportPhase = .exporting
        isExporting = true

        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            DispatchQueue.main.async {
                guard status == .authorized || status == .limited else {
                    self.exportPhase = .failed("Photos access denied. Enable it in Settings.")
                    self.isExporting = false
                    return
                }

                PHPhotoLibrary.shared().performChanges {
                    PHAssetChangeRequest.creationRequestForAsset(from: image)
                } completionHandler: { success, error in
                    DispatchQueue.main.async {
                        self.isExporting = false
                        if success {
                            self.exportPhase = .success
                            if self.appStore.preferences.hapticFeedback { HapticManager.shared.success() }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                                self.dismiss()
                            }
                        } else {
                            let msg = error?.localizedDescription ?? "Failed to save image."
                            self.exportPhase = .failed(msg)
                            if self.appStore.preferences.hapticFeedback { HapticManager.shared.error() }
                        }
                    }
                }
            }
        }
    }

    private func shareToInstagram() {
        guard let image = renderCanvas(),
              let pngData = image.pngData() else { return }

        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }

        // Save to pasteboard for Instagram Stories
        UIPasteboard.general.setData(pngData, forPasteboardType: "com.instagram.sharedSticker.stickerImage")

        let urlString = "instagram-stories://share?source_application=\(Bundle.main.bundleIdentifier ?? "com.stikaro")"
        if let url = URL(string: urlString), UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        } else {
            // Fallback: open App Store page for Instagram
            if let appStoreUrl = URL(string: "https://apps.apple.com/app/instagram/id389801252") {
                UIApplication.shared.open(appStoreUrl)
            }
        }
    }

    private func shareToX() {
        guard let image = renderCanvas(),
              let pngData = image.pngData() else { return }

        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }

        // Save image temporarily for sharing
        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("stikaro_export.png")
        try? pngData.write(to: tempURL)

        // Use share sheet as X doesn't have a reliable URL scheme for image sharing
        let activityVC = UIActivityViewController(
            activityItems: [image],
            applicationActivities: nil
        )
        activityVC.excludedActivityTypes = [.addToReadingList, .assignToContact]

        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootVC = windowScene.windows.first?.rootViewController {
            var topVC = rootVC
            while let presented = topVC.presentedViewController { topVC = presented }
            if let popover = activityVC.popoverPresentationController {
                popover.sourceView = topVC.view
                popover.sourceRect = CGRect(x: topVC.view.bounds.midX,
                                            y: topVC.view.bounds.midY, width: 0, height: 0)
            }
            topVC.present(activityVC, animated: true)
        }
    }

    // MARK: - Canvas Rendering

    private func renderCanvas() -> UIImage? {
        guard let sourceImagePath = editorStore.sourceImagePath,
              let sourceImageDimensions = editorStore.sourceImageDimensions else {
            return nil
        }

        return ImageExporter.render(
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: sourceImageDimensions,
            canvasElements: editorStore.canvasElements,
            canvasSize: editorStore.canvasSize,
            format: exportFormat,
            quality: Int(quality),
            filter: editorStore.appliedFilter
        )
    }
}

// MARK: - ExportActionButton

private struct ExportActionButton: View {
    let systemImage: String
    let title: String
    let subtitle: String
    let isLoading: Bool
    let isPrimary: Bool
    let theme: Theme
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.m) {
                ZStack {
                    Circle()
                        .fill(
                            isPrimary
                                ? AppGradients.gold
                                : LinearGradient(colors: [theme.backgrounds.tertiary], startPoint: .top, endPoint: .bottom)
                        )
                        .frame(width: 44, height: 44)

                    if isLoading {
                        ProgressView()
                            .progressViewStyle(.circular)
                            .tint(isPrimary ? Color(hex: "#0F0F12") : theme.text.primary)
                    } else {
                        Image(systemName: systemImage)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(isPrimary ? Color(hex: "#0F0F12") : theme.text.primary)
                    }
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(AppTypography.UI.label)
                        .foregroundStyle(theme.text.primary)
                    Text(subtitle)
                        .font(AppTypography.Body.finePrint)
                        .foregroundStyle(theme.text.tertiary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(theme.text.subtle)
            }
            .padding(Spacing.m)
            .background(
                RoundedRectangle(cornerRadius: Dims.CornerRadius.large)
                    .fill(theme.backgrounds.secondary)
            )
        }
    }
}

