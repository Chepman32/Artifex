import SwiftUI

struct StickerElementView: View {
    let element: CanvasElement
    let isSelected: Bool
    let canvasBounds: CGSize?
    let theme: Theme
    let onSelect: () -> Void
    let onUpdate: (ElementTransform) -> Void

    private var width: CGFloat { element.width ?? 100 }
    private var height: CGFloat { element.height ?? 100 }
    private var opacity: CGFloat { element.opacity ?? 1 }

    var body: some View {
        CanvasGestureView(
            elementWidth: width,
            elementHeight: height,
            canvasBounds: canvasBounds,
            isSelected: isSelected,
            initialX: element.positionCGPoint.x,
            initialY: element.positionCGPoint.y,
            initialScale: element.scale,
            initialRotation: element.rotation,
            onSelect: onSelect,
            onUpdate: onUpdate
        ) {
            Group {
                if let path = element.assetPath, let uiImage = UIImage(named: path) ?? UIImage(contentsOfFile: path) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } else {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                }
            }
            .frame(width: width, height: height)
            .opacity(opacity)
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(style: StrokeStyle(lineWidth: 1, dash: [4]))
                        .foregroundStyle(theme.accent.primary)
                }
            }
        }
    }
}
