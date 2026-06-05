import SwiftUI

struct HomeScreen: View {
    let navigationState: NavigationState

    @Environment(AppStore.self) private var appStore
    @Environment(ProjectGalleryStore.self) private var galleryStore

    private var theme: Theme {
        AppThemes.theme(for: appStore.preferences.theme)
    }

    // Staggered entrance animation
    @State private var appearedIndices: Set<Int> = []
    @State private var hasLoaded: Bool = false

    // Clipboard paste support
    @State private var showDeleteConfirm: Bool = false

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .bottomTrailing) {
                theme.backgrounds.primary.ignoresSafeArea()

                VStack(spacing: 0) {
                    topBar
                    projectGrid(screenWidth: geo.size.width)
                }

                fab
                    .padding(.trailing, Spacing.m)
                    .padding(.bottom, Spacing.l)
            }
        }
        .navigationBarHidden(true)
        .task {
            await galleryStore.loadProjects()
            animateEntrance()
        }
        .confirmationDialog(
            "Delete \(galleryStore.selectedIds.count) project\(galleryStore.selectedIds.count == 1 ? "" : "s")?",
            isPresented: $showDeleteConfirm,
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                Task {
                    if appStore.preferences.hapticFeedback {
                        HapticManager.shared.success()
                    }
                    await galleryStore.deleteProjects(ids: Array(galleryStore.selectedIds))
                }
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        ZStack {
            if galleryStore.selectionMode {
                selectionTopBar
            } else {
                normalTopBar
            }
        }
        .frame(height: Dims.topBar)
        .animation(.easeInOut(duration: 0.2), value: galleryStore.selectionMode)
    }

    private var normalTopBar: some View {
        HStack {
            // Settings button (left)
            Button {
                if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                navigationState.isSettingsPresented = true
            } label: {
                Image(systemName: "gearshape")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(theme.text.primary)
                    .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
            }

            Spacer()

            // Title (center)
            Text("Stikaro")
                .font(AppTypography.Display.h4)
                .foregroundStyle(theme.text.primary)

            Spacer()

            // Mirror spacer for visual balance
            Color.clear
                .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
        }
        .padding(.horizontal, Spacing.m)
    }

    private var selectionTopBar: some View {
        HStack {
            Button("Cancel") {
                if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                galleryStore.exitSelectionMode()
            }
            .font(AppTypography.UI.label)
            .foregroundStyle(theme.accent.primary)
            .frame(minWidth: Dims.minTapTarget, minHeight: Dims.minTapTarget)

            Spacer()

            Text("\(galleryStore.selectedIds.count) selected")
                .font(AppTypography.UI.label)
                .foregroundStyle(theme.text.primary)

            Spacer()

            Button {
                if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
                if !galleryStore.selectedIds.isEmpty {
                    showDeleteConfirm = true
                }
            } label: {
                Image(systemName: "trash")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(galleryStore.selectedIds.isEmpty ? theme.text.tertiary : theme.semantic.error)
                    .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
            }
            .disabled(galleryStore.selectedIds.isEmpty)
        }
        .padding(.horizontal, Spacing.m)
    }

    // MARK: - Project Grid

    @ViewBuilder
    private func projectGrid(screenWidth: CGFloat) -> some View {
        let itemSize = (screenWidth - Spacing.m * 2 - Spacing.m) / 2

        if galleryStore.isLoading && galleryStore.projects.isEmpty {
            Spacer()
            ProgressView()
                .tint(theme.accent.primary)
            Spacer()
        } else if galleryStore.projects.isEmpty {
            emptyState
        } else {
            ScrollView {
                LazyVGrid(
                    columns: [
                        GridItem(.fixed(itemSize), spacing: Spacing.m),
                        GridItem(.fixed(itemSize), spacing: Spacing.m)
                    ],
                    spacing: Spacing.m
                ) {
                    ForEach(Array(galleryStore.projects.enumerated()), id: \.element.id) { index, project in
                        ProjectThumbnailCard(
                            project: project,
                            itemSize: itemSize,
                            isSelectionMode: galleryStore.selectionMode,
                            isSelected: galleryStore.selectedIds.contains(project.id),
                            isVisible: appearedIndices.contains(index),
                            theme: theme
                        )
                        .onTapGesture {
                            if galleryStore.selectionMode {
                                if appStore.preferences.hapticFeedback { HapticManager.shared.selection() }
                                galleryStore.toggleSelection(id: project.id)
                            } else {
                                if appStore.preferences.hapticFeedback { HapticManager.shared.light() }
                                navigationState.navigateToEditor(projectId: project.id)
                            }
                        }
                        .onLongPressGesture(minimumDuration: 0.5) {
                            if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
                            if !galleryStore.selectionMode {
                                galleryStore.enterSelectionMode()
                            }
                            galleryStore.toggleSelection(id: project.id)
                        }
                    }
                }
                .padding(Spacing.m)
                .padding(.bottom, Dims.FAB.size + Spacing.xl)
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: Spacing.m) {
            Spacer()

            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 64, weight: .thin))
                .foregroundStyle(theme.text.tertiary)

            Text("No projects yet")
                .font(AppTypography.Display.h3)
                .foregroundStyle(theme.text.primary)

            Text("Tap the + button to create your first project")
                .font(AppTypography.Body.regular)
                .foregroundStyle(theme.text.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Spacing.xl)

            Spacer()
        }
    }

    // MARK: - FAB

    private var fab: some View {
        Button {
            if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }
            if galleryStore.selectionMode {
                // Clipboard / paste action in selection mode
                UIPasteboard.general.string.map { _ in
                    // handle clipboard paste — placeholder for future clipboard image import
                }
            } else {
                navigationState.isImagePickerPresented = true
            }
        } label: {
            ZStack {
                Circle()
                    .fill(AppGradients.gold)
                    .frame(width: Dims.FAB.size, height: Dims.FAB.size)
                    .goldGlowShadow()

                Image(systemName: galleryStore.selectionMode ? "doc.on.clipboard" : "plus")
                    .font(.system(size: 26, weight: .semibold))
                    .foregroundStyle(.black)
            }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: galleryStore.selectionMode)
    }

    // MARK: - Staggered Entrance

    private func animateEntrance() {
        guard !hasLoaded else { return }
        hasLoaded = true
        for i in 0..<galleryStore.projects.count {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.05) {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                    appearedIndices.insert(i)
                }
            }
        }
    }
}

// MARK: - Project Thumbnail Card

private struct ProjectThumbnailCard: View {
    let project: Project
    let itemSize: CGFloat
    let isSelectionMode: Bool
    let isSelected: Bool
    let isVisible: Bool
    let theme: Theme

    var body: some View {
        ZStack(alignment: .topTrailing) {
            ZStack(alignment: .bottomLeading) {
                // Thumbnail image
                thumbnailView
                    .frame(width: itemSize, height: itemSize)
                    .clipShape(RoundedRectangle(cornerRadius: Dims.CornerRadius.medium))
                    .overlay(
                        RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                            .strokeBorder(
                                isSelected ? Color(hex: "#D4AF37") : Color.clear,
                                lineWidth: 2.5
                            )
                    )

                // Timestamp badge
                Text(project.updatedAt.relativeDescription)
                    .font(AppTypography.Body.finePrint)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.black.opacity(0.55))
                    .clipShape(Capsule())
                    .padding(Spacing.xs)
            }

            // Selection checkmark
            if isSelectionMode {
                ZStack {
                    Circle()
                        .fill(isSelected ? Color(hex: "#D4AF37") : Color.black.opacity(0.4))
                        .frame(width: 24, height: 24)
                    if isSelected {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.black)
                    } else {
                        Circle()
                            .strokeBorder(.white.opacity(0.6), lineWidth: 1.5)
                            .frame(width: 24, height: 24)
                    }
                }
                .padding(Spacing.xs)
                .transition(.scale.combined(with: .opacity))
            }
        }
        .opacity(isVisible ? 1 : 0)
        .offset(y: isVisible ? 0 : 20)
        .animation(.spring(response: 0.4, dampingFraction: 0.75), value: isVisible)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelectionMode)
    }

    @ViewBuilder
    private var thumbnailView: some View {
        if let uiImage = loadImage(from: project.thumbnailPath) {
            Image(uiImage: uiImage)
                .resizable()
                .aspectRatio(contentMode: .fill)
        } else {
            RoundedRectangle(cornerRadius: Dims.CornerRadius.medium)
                .fill(theme.backgrounds.secondary)
                .overlay(
                    Image(systemName: "photo")
                        .font(.system(size: 28, weight: .thin))
                        .foregroundStyle(theme.text.subtle)
                )
        }
    }

    private func loadImage(from path: String) -> UIImage? {
        if path.hasPrefix("file://") {
            return UIImage(contentsOfFile: path.replacingOccurrences(of: "file://", with: ""))
        }
        return UIImage(contentsOfFile: path) ?? UIImage(named: path)
    }
}

// MARK: - Date Extension

private extension Date {
    var relativeDescription: String {
        let now = Date()
        let components = Calendar.current.dateComponents([.minute, .hour, .day], from: self, to: now)

        if let day = components.day, day > 0 {
            return day == 1 ? "1d ago" : "\(day)d ago"
        }
        if let hour = components.hour, hour > 0 {
            return hour == 1 ? "1h ago" : "\(hour)h ago"
        }
        if let minute = components.minute, minute > 0 {
            return minute == 1 ? "1m ago" : "\(minute)m ago"
        }
        return "Just now"
    }
}
