import SwiftUI

@main
struct StikaroNativeApp: App {
    @State private var appStore = AppStore()
    @State private var editorStore = EditorStore()
    @State private var galleryStore = ProjectGalleryStore()

    var body: some Scene {
        WindowGroup {
            AppNavigator()
                .environment(appStore)
                .environment(editorStore)
                .environment(galleryStore)
                .preferredColorScheme(
                    appStore.preferences.theme == .light || appStore.preferences.theme == .solar
                        ? .light
                        : .dark
                )
        }
    }
}
