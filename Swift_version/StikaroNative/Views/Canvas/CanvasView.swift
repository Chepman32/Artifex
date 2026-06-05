import SwiftUI
import CoreImage
import CoreImage.CIFilterBuiltins

struct CanvasView: View {
    let sourceImageUri: String
    let canvasWidth: CGFloat
    let canvasHeight: CGFloat
    var onTextEdit: ((String, String) -> Void)?
    var onCanvasBackgroundTap: (() -> Void)?

    @Environment(EditorStore.self) private var editorStore
    @Environment(AppStore.self) private var appStore

    private var theme: Theme {
        AppThemes.theme(for: appStore.preferences.theme)
    }

    private var selectedIds: Set<String> {
        Set(editorStore.selectedElementIds)
    }

    var body: some View {
        ZStack {
            // Background image with filter
            filteredImage
                .frame(width: canvasWidth, height: canvasHeight)
                .clipped()

            // Interactive overlay for canvas elements
            elementOverlay
        }
        .frame(width: canvasWidth, height: canvasHeight)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .background(theme.backgrounds.secondary)
        .contentShape(Rectangle())
        .onTapGesture {
            editorStore.deselectElement()
            onCanvasBackgroundTap?()
        }
    }

    // MARK: - Filtered Image

    @ViewBuilder
    private var filteredImage: some View {
        if let uiImage = loadImage(from: sourceImageUri) {
            let filtered = applyFilter(to: uiImage)
            Image(uiImage: filtered)
                .resizable()
                .aspectRatio(contentMode: .fit)
        } else {
            Color(theme.backgrounds.secondary)
        }
    }

    private func loadImage(from uri: String) -> UIImage? {
        if uri.hasPrefix("file://") {
            let path = uri.replacingOccurrences(of: "file://", with: "")
            return UIImage(contentsOfFile: path)
        }
        return UIImage(contentsOfFile: uri) ?? UIImage(named: uri)
    }

    private func applyFilter(to image: UIImage) -> UIImage {
        guard let filter = editorStore.appliedFilter, filter.type != .none,
              let ciImage = CIImage(image: image) else { return image }

        let filtered = ColorMatrixFilter.applyFilter(filter, to: ciImage)

        let context = CIContext()
        guard let cgImage = context.createCGImage(filtered, from: filtered.extent) else { return image }
        return UIImage(cgImage: cgImage)
    }

    // MARK: - Element Overlay

    private var elementOverlay: some View {
        ZStack {
            ForEach(editorStore.canvasElements) { element in
                elementView(for: element)
            }
        }
        .frame(width: canvasWidth, height: canvasHeight)
    }

    @ViewBuilder
    private func elementView(for element: CanvasElement) -> some View {
        let isSelected = selectedIds.contains(element.id)
        let bounds = CGSize(width: canvasWidth, height: canvasHeight)

        switch element.type {
        case .text:
            TextElementView(
                element: element,
                isSelected: isSelected,
                canvasBounds: bounds,
                theme: theme,
                onSelect: { editorStore.selectElement(element.id) },
                onUpdate: { transform in
                    editorStore.updateElement(id: element.id) { el in
                        el.positionCGPoint = CGPoint(x: transform.x, y: transform.y)
                        el.scale = transform.scale
                        el.rotation = transform.rotation
                    }
                },
                onEdit: {
                    onTextEdit?(element.id, element.textContent ?? "")
                }
            )
        case .sticker, .watermark, .stamp:
            StickerElementView(
                element: element,
                isSelected: isSelected,
                canvasBounds: bounds,
                theme: theme,
                onSelect: { editorStore.selectElement(element.id) },
                onUpdate: { transform in
                    editorStore.updateElement(id: element.id) { el in
                        el.positionCGPoint = CGPoint(x: transform.x, y: transform.y)
                        el.scale = transform.scale
                        el.rotation = transform.rotation
                    }
                }
            )
        }
    }
}
