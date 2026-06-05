import SwiftUI

// MARK: - Route

enum Route: Hashable {
    case editor(projectId: String?, imageUri: String?, imageDimensions: CGSize?)
}

extension CGSize: @retroactive Hashable {
    public func hash(into hasher: inout Hasher) {
        hasher.combine(width)
        hasher.combine(height)
    }
}

// MARK: - Navigation State

@Observable
final class NavigationState {
    var path: [Route] = []
    var isSettingsPresented: Bool = false
    var isImagePickerPresented: Bool = false

    func navigateToEditor(projectId: String? = nil, imageUri: String? = nil, imageDimensions: CGSize? = nil) {
        path.append(.editor(projectId: projectId, imageUri: imageUri, imageDimensions: imageDimensions))
    }

    func popToRoot() {
        path = []
    }
}

// MARK: - AppNavigator

struct AppNavigator: View {
    @Environment(AppStore.self) private var appStore
    @Environment(EditorStore.self) private var editorStore
    @Environment(ProjectGalleryStore.self) private var galleryStore

    @State private var navigationState = NavigationState()
    @State private var showSplash: Bool = true
    @State private var showOnboarding: Bool = false

    var body: some View {
        Group {
            if showSplash {
                ParticleSplashScreen()
                    .transition(.opacity)
            } else {
                mainNavigationStack
                    .transition(.opacity)
                    .fullScreenCover(isPresented: $showOnboarding) {
                        OnboardingScreen()
                            .environment(appStore)
                    }
            }
        }
        .animation(.easeInOut(duration: 0.3), value: showSplash)
        .onAppear {
            // Sync device language on first launch (before onboarding)
            if !appStore.hasSeenOnboarding {
                let detectedLanguage = AppStore.getDeviceLanguage()
                if appStore.preferences.language != detectedLanguage {
                    appStore.updatePreferences { prefs in
                        prefs.language = detectedLanguage
                    }
                }
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation {
                    showSplash = false
                }
                if !appStore.hasSeenOnboarding {
                    showOnboarding = true
                }
            }
        }
        .onChange(of: appStore.hasSeenOnboarding) { _, hasSeen in
            if hasSeen {
                showOnboarding = false
            }
        }
    }

    // MARK: - Main Navigation Stack

    private var mainNavigationStack: some View {
        NavigationStack(path: $navigationState.path) {
            HomeScreen(navigationState: navigationState)
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .editor(let projectId, let imageUri, let imageDimensions):
                        EditorScreen(
                            projectId: projectId,
                            imageUri: imageUri,
                            imageDimensions: imageDimensions,
                            navigationState: navigationState
                        )
                    }
                }
        }
        .environment(navigationState)
        .sheet(isPresented: $navigationState.isSettingsPresented) {
            SettingsScreen()
                .environment(appStore)
        }
        .sheet(isPresented: $navigationState.isImagePickerPresented) {
            ImagePickerScreen(navigationState: navigationState)
                .environment(appStore)
        }
    }
}
