import SwiftUI

// MARK: - Element Transform

struct ElementTransform: Equatable {
    var x: CGFloat
    var y: CGFloat
    var scale: CGFloat
    var rotation: CGFloat // radians
}

// MARK: - Canvas Gesture View

/// A container that applies pan + pinch + rotation gestures to its content,
/// replicating the RN useCanvasGestures hook behavior.
struct CanvasGestureView<Content: View>: View {
    let elementWidth: CGFloat
    let elementHeight: CGFloat
    let canvasBounds: CGSize?
    let isSelected: Bool
    let onSelect: () -> Void
    let onUpdate: (ElementTransform) -> Void
    var onEdit: (() -> Void)?
    @ViewBuilder let content: () -> Content

    @State private var offset: CGSize = .zero
    @State private var scale: CGFloat = 1
    @State private var rotation: Angle = .zero

    // Gesture-in-progress state
    @State private var dragStart: CGSize = .zero
    @State private var scaleStart: CGFloat = 1
    @State private var rotationStart: Angle = .zero

    // External position binding (set by parent for undo/redo)
    var initialX: CGFloat = 0
    var initialY: CGFloat = 0
    var initialScale: CGFloat = 1
    var initialRotation: CGFloat = 0

    init(
        elementWidth: CGFloat = 100,
        elementHeight: CGFloat = 100,
        canvasBounds: CGSize? = nil,
        isSelected: Bool,
        initialX: CGFloat = 0,
        initialY: CGFloat = 0,
        initialScale: CGFloat = 1,
        initialRotation: CGFloat = 0,
        onSelect: @escaping () -> Void,
        onUpdate: @escaping (ElementTransform) -> Void,
        onEdit: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.elementWidth = elementWidth
        self.elementHeight = elementHeight
        self.canvasBounds = canvasBounds
        self.isSelected = isSelected
        self.initialX = initialX
        self.initialY = initialY
        self.initialScale = initialScale
        self.initialRotation = initialRotation
        self.onSelect = onSelect
        self.onUpdate = onUpdate
        self.onEdit = onEdit
        self.content = content

        _offset = State(initialValue: CGSize(width: initialX, height: initialY))
        _scale = State(initialValue: initialScale)
        _rotation = State(initialValue: .radians(Double(initialRotation)))
    }

    var body: some View {
        content()
            .scaleEffect(scale)
            .rotationEffect(rotation)
            .offset(offset)
            .gesture(tapGesture)
            .gesture(doubleTapGesture)
            .simultaneousGesture(dragGesture)
            .simultaneousGesture(magnifyGesture)
            .simultaneousGesture(rotateGesture)
            .onChange(of: initialX) { _, newVal in offset.width = newVal }
            .onChange(of: initialY) { _, newVal in offset.height = newVal }
            .onChange(of: initialScale) { _, newVal in scale = newVal }
            .onChange(of: initialRotation) { _, newVal in rotation = .radians(Double(newVal)) }
    }

    // MARK: - Gestures

    private var tapGesture: some Gesture {
        TapGesture(count: 1)
            .onEnded {
                onSelect()
            }
    }

    private var doubleTapGesture: some Gesture {
        TapGesture(count: 2)
            .onEnded {
                onEdit?()
            }
    }

    private var dragGesture: some Gesture {
        DragGesture(minimumDistance: 15)
            .onChanged { value in
                if dragStart == .zero && value.translation != .zero {
                    dragStart = CGSize(
                        width: offset.width - value.translation.width,
                        height: offset.height - value.translation.height
                    )
                    onSelect()
                }
                let newX = dragStart.width + value.translation.width
                let newY = dragStart.height + value.translation.height
                let clamped = clampPosition(x: newX, y: newY, currentScale: scale)
                offset = CGSize(width: clamped.x, height: clamped.y)
            }
            .onEnded { _ in
                dragStart = .zero
                emitUpdate()
            }
    }

    private var magnifyGesture: some Gesture {
        MagnifyGesture()
            .onChanged { value in
                if scaleStart == 1 && value.magnification != 1 {
                    scaleStart = scale / value.magnification
                }
                let newScale = scaleStart * value.magnification
                scale = min(max(newScale, 0.5), 5)
            }
            .onEnded { _ in
                scaleStart = 1
                emitUpdate()
            }
    }

    private var rotateGesture: some Gesture {
        RotateGesture()
            .onChanged { value in
                if rotationStart == .zero && value.rotation != .zero {
                    rotationStart = Angle(radians: rotation.radians - value.rotation.radians)
                }
                rotation = Angle(radians: rotationStart.radians + value.rotation.radians)
            }
            .onEnded { _ in
                // Snap to 45-degree intervals if close
                let degrees = rotation.degrees.truncatingRemainder(dividingBy: 360)
                let nearestSnap = (degrees / 45).rounded() * 45
                if abs(degrees - nearestSnap) < 5 {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        rotation = .degrees(nearestSnap)
                    }
                    HapticManager.shared.snap()
                }
                rotationStart = .zero
                emitUpdate()
            }
    }

    // MARK: - Helpers

    private func clampPosition(x: CGFloat, y: CGFloat, currentScale: CGFloat) -> (x: CGFloat, y: CGFloat) {
        guard let bounds = canvasBounds else { return (x, y) }

        let scaledW = elementWidth * currentScale
        let scaledH = elementHeight * currentScale
        let halfOrigW = elementWidth / 2
        let halfOrigH = elementHeight / 2
        let scaleOff = currentScale - 1
        let leftOff = halfOrigW * scaleOff
        let topOff = halfOrigH * scaleOff
        let minX = leftOff
        let maxX = bounds.width - scaledW + leftOff
        let minY = topOff
        let maxY = bounds.height - scaledH + topOff

        return (max(minX, min(x, maxX)), max(minY, min(y, maxY)))
    }

    private func emitUpdate() {
        onUpdate(ElementTransform(
            x: offset.width,
            y: offset.height,
            scale: scale,
            rotation: CGFloat(rotation.radians)
        ))
    }
}
