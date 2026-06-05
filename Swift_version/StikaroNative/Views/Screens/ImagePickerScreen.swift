import SwiftUI
import Photos

// MARK: - ImagePickerScreen

struct ImagePickerScreen: View {
    let navigationState: NavigationState

    @Environment(AppStore.self) private var appStore
    @Environment(\.dismiss) private var dismiss

    private var theme: Theme {
        AppThemes.theme(for: appStore.preferences.theme)
    }

    // Photo library state
    @State private var photos: [PHAsset] = []
    @State private var permissionStatus: PHAuthorizationStatus = .notDetermined
    @State private var isLoading: Bool = false
    @State private var hasMorePhotos: Bool = true

    // Pagination
    private let pageSize = 30
    @State private var fetchResult: PHFetchResult<PHAsset>? = nil

    // Fallback sample colors when permission is denied
    private let sampleColors: [Color] = [
        Color(hex: "#FF6B6B"), Color(hex: "#4ECDC4"), Color(hex: "#45B7D1"),
        Color(hex: "#96CEB4"), Color(hex: "#FFEAA7"), Color(hex: "#DDA0DD")
    ]

    var body: some View {
        ZStack(alignment: .top) {
            theme.backgrounds.primary.ignoresSafeArea()

            VStack(spacing: 0) {
                // Drag handle
                RoundedRectangle(cornerRadius: 2.5)
                    .fill(theme.text.tertiary)
                    .frame(width: 40, height: 5)
                    .padding(.top, Spacing.s)
                    .padding(.bottom, Spacing.xs)

                // Header
                HStack {
                    Text("Choose Photo")
                        .font(AppTypography.Display.h4)
                        .foregroundStyle(theme.text.primary)

                    Spacer()

                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundStyle(theme.text.tertiary)
                            .frame(width: Dims.minTapTarget, height: Dims.minTapTarget)
                    }
                }
                .padding(.horizontal, Spacing.m)
                .padding(.bottom, Spacing.xs)

                Divider()
                    .background(theme.backgrounds.tertiary)

                // Content
                Group {
                    switch permissionStatus {
                    case .authorized, .limited:
                        photoGrid
                    case .denied, .restricted:
                        deniedState
                    case .notDetermined:
                        requestPermissionView
                    @unknown default:
                        requestPermissionView
                    }
                }
            }
        }
        .onAppear {
            checkPermission()
        }
    }

    // MARK: - Photo Grid

    private var photoGrid: some View {
        GeometryReader { geo in
            let columns = 4
            let gap: CGFloat = 2
            let itemSize = (geo.size.width - gap * CGFloat(columns - 1)) / CGFloat(columns)

            ScrollView {
                LazyVGrid(
                    columns: Array(repeating: GridItem(.fixed(itemSize), spacing: gap), count: columns),
                    spacing: gap
                ) {
                    ForEach(Array(photos.enumerated()), id: \.element.localIdentifier) { index, asset in
                        PhotoCell(asset: asset, size: itemSize, theme: theme) {
                            handlePhotoSelection(asset)
                        }
                        .onAppear {
                            // Pagination: load more when last batch comes into view
                            if index == photos.count - 5 && hasMorePhotos && !isLoading {
                                loadMorePhotos()
                            }
                        }
                    }
                }

                if isLoading {
                    ProgressView()
                        .tint(theme.accent.primary)
                        .padding(Spacing.l)
                }
            }
        }
    }

    // MARK: - Permission Denied State (6 sample colored rectangles)

    private var deniedState: some View {
        VStack(spacing: Spacing.l) {
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: Spacing.s), count: 3),
                spacing: Spacing.s
            ) {
                ForEach(Array(sampleColors.enumerated()), id: \.offset) { _, color in
                    RoundedRectangle(cornerRadius: Dims.CornerRadius.small)
                        .fill(color.opacity(0.5))
                        .aspectRatio(1, contentMode: .fit)
                        .overlay(
                            Image(systemName: "photo")
                                .font(.system(size: 28, weight: .thin))
                                .foregroundStyle(.white.opacity(0.5))
                        )
                }
            }
            .padding(.horizontal, Spacing.m)
            .padding(.top, Spacing.l)

            VStack(spacing: Spacing.xs) {
                Text("Photo Access Required")
                    .font(AppTypography.Display.h4)
                    .foregroundStyle(theme.text.primary)

                Text("Allow Stikaro to access your photos in Settings.")
                    .font(AppTypography.Body.regular)
                    .foregroundStyle(theme.text.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.xl)
            }

            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Open Settings")
                    .font(AppTypography.UI.button)
                    .foregroundStyle(.black)
                    .frame(maxWidth: .infinity)
                    .frame(height: Dims.Button.height)
                    .background(AppGradients.gold)
                    .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                    .padding(.horizontal, Spacing.m)
            }

            Spacer()
        }
    }

    // MARK: - Request Permission View

    private var requestPermissionView: some View {
        VStack(spacing: Spacing.l) {
            Spacer()

            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 64, weight: .thin))
                .foregroundStyle(theme.accent.primary)

            VStack(spacing: Spacing.xs) {
                Text("Access Your Photos")
                    .font(AppTypography.Display.h3)
                    .foregroundStyle(theme.text.primary)

                Text("Stikaro needs permission to access your photo library.")
                    .font(AppTypography.Body.regular)
                    .foregroundStyle(theme.text.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.xl)
            }

            Button {
                requestPermission()
            } label: {
                Text("Allow Access")
                    .font(AppTypography.UI.button)
                    .foregroundStyle(.black)
                    .frame(maxWidth: .infinity)
                    .frame(height: Dims.Button.height)
                    .background(AppGradients.gold)
                    .clipShape(RoundedRectangle(cornerRadius: Dims.Button.cornerRadius))
                    .padding(.horizontal, Spacing.m)
            }

            Spacer()
        }
    }

    // MARK: - Permission Handling

    private func checkPermission() {
        permissionStatus = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        if permissionStatus == .authorized || permissionStatus == .limited {
            loadInitialPhotos()
        }
    }

    private func requestPermission() {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            DispatchQueue.main.async {
                permissionStatus = status
                if status == .authorized || status == .limited {
                    loadInitialPhotos()
                }
            }
        }
    }

    // MARK: - Photo Loading

    private func loadInitialPhotos() {
        isLoading = true
        DispatchQueue.global(qos: .userInitiated).async {
            let options = PHFetchOptions()
            options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
            options.fetchLimit = pageSize

            let result = PHAsset.fetchAssets(with: .image, options: options)
            var assets: [PHAsset] = []
            result.enumerateObjects { asset, _, _ in
                assets.append(asset)
            }

            DispatchQueue.main.async {
                fetchResult = result
                photos = assets
                hasMorePhotos = result.count >= pageSize
                isLoading = false
            }
        }
    }

    private func loadMorePhotos() {
        guard !isLoading, hasMorePhotos else { return }
        isLoading = true

        DispatchQueue.global(qos: .userInitiated).async {
            let options = PHFetchOptions()
            options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
            options.fetchLimit = photos.count + pageSize

            let result = PHAsset.fetchAssets(with: .image, options: options)
            var assets: [PHAsset] = []
            result.enumerateObjects { asset, _, _ in
                assets.append(asset)
            }

            let newBatch = Array(assets.dropFirst(photos.count))

            DispatchQueue.main.async {
                photos.append(contentsOf: newBatch)
                hasMorePhotos = newBatch.count >= pageSize
                isLoading = false
            }
        }
    }

    // MARK: - Photo Selection

    private func handlePhotoSelection(_ asset: PHAsset) {
        if appStore.preferences.hapticFeedback { HapticManager.shared.medium() }

        let dimensions = CGSize(width: asset.pixelWidth, height: asset.pixelHeight)

        // Request the full-resolution image file URL
        let options = PHContentEditingInputRequestOptions()
        options.canHandleAdjustmentData = { _ in true }

        asset.requestContentEditingInput(with: options) { input, _ in
            DispatchQueue.main.async {
                if let fileURL = input?.fullSizeImageURL {
                    dismiss()
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                        navigationState.isImagePickerPresented = false
                        navigationState.navigateToEditor(
                            imageUri: fileURL.absoluteString,
                            imageDimensions: dimensions
                        )
                    }
                } else {
                    // Fallback: request as data
                    let imageManager = PHImageManager.default()
                    let requestOptions = PHImageRequestOptions()
                    requestOptions.version = .original
                    requestOptions.isSynchronous = false
                    requestOptions.deliveryMode = .highQualityFormat

                    imageManager.requestImageDataAndOrientation(for: asset, options: requestOptions) { data, _, _, _ in
                        guard let data = data else { return }

                        DispatchQueue.global(qos: .userInitiated).async {
                            let tempURL = FileManager.default.temporaryDirectory
                                .appendingPathComponent(UUID().uuidString + ".jpg")
                            try? data.write(to: tempURL)

                            DispatchQueue.main.async {
                                dismiss()
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                                    navigationState.isImagePickerPresented = false
                                    navigationState.navigateToEditor(
                                        imageUri: tempURL.absoluteString,
                                        imageDimensions: dimensions
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Photo Cell

private struct PhotoCell: View {
    let asset: PHAsset
    let size: CGFloat
    let theme: Theme
    let onTap: () -> Void

    @State private var thumbnail: UIImage? = nil

    var body: some View {
        Button(action: onTap) {
            ZStack {
                Rectangle()
                    .fill(theme.backgrounds.secondary)
                    .frame(width: size, height: size)

                if let image = thumbnail {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: size, height: size)
                        .clipped()
                } else {
                    Image(systemName: "photo")
                        .font(.system(size: 20, weight: .thin))
                        .foregroundStyle(theme.text.subtle)
                }
            }
            .frame(width: size, height: size)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .task {
            await loadThumbnail()
        }
    }

    private func loadThumbnail() async {
        let targetSize = CGSize(width: size * UIScreen.main.scale, height: size * UIScreen.main.scale)
        let options = PHImageRequestOptions()
        // Use highQualityFormat (single delivery) to avoid double-resume in withCheckedContinuation.
        // For a grid thumbnail this is fast enough; swap to .opportunistic + a separate
        // @State Bool guard if progressive loading is preferred.
        options.deliveryMode = .highQualityFormat
        options.resizeMode = .fast
        options.isSynchronous = false

        thumbnail = await withCheckedContinuation { continuation in
            PHImageManager.default().requestImage(
                for: asset,
                targetSize: targetSize,
                contentMode: .aspectFill,
                options: options
            ) { image, _ in
                continuation.resume(returning: image)
            }
        }
    }
}
