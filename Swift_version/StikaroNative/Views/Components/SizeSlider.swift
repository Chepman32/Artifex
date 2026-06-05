import SwiftUI

// MARK: - SizeSlider

/// Vertical slider for adjusting element scale. Range 0.5–3.0.
/// Width: 40pt, Height: 200pt. Drag upward to increase value.
struct SizeSlider: View {
    @Binding var value: CGFloat
    var range: ClosedRange<CGFloat> = 0.5...3.0
    var onValueChange: ((CGFloat) -> Void)?

    private let trackHeight: CGFloat = 200
    private let trackWidth: CGFloat = 4
    private let thumbDiameter: CGFloat = 24
    private let containerWidth: CGFloat = 40

    // Normalised 0→1, where 1 = top of track = max value
    private var normalisedValue: CGFloat {
        (value - range.lowerBound) / (range.upperBound - range.lowerBound)
    }

    // Thumb Y offset: 0 = bottom of track, trackHeight = top
    private var thumbY: CGFloat {
        trackHeight * (1.0 - normalisedValue)
    }

    @State private var dragStartNorm: CGFloat = 0
    @State private var dragStartLocationY: CGFloat = 0

    var body: some View {
        ZStack(alignment: .top) {
            // Track background
            Capsule()
                .fill(Color.white.opacity(0.12))
                .frame(width: trackWidth, height: trackHeight)
                .frame(width: containerWidth)

            // Filled portion (above thumb)
            Capsule()
                .fill(AppGradients.gold)
                .frame(width: trackWidth, height: max(0, trackHeight - thumbY - thumbDiameter / 2))
                .frame(width: containerWidth, alignment: .top)
                .padding(.top, 0)
                .frame(width: containerWidth, height: trackHeight, alignment: .top)
                .mask(
                    Rectangle()
                        .frame(height: max(0, trackHeight - thumbY))
                        .frame(maxHeight: .infinity, alignment: .top)
                )

            // Thumb
            Circle()
                .fill(Color.white)
                .frame(width: thumbDiameter, height: thumbDiameter)
                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                .offset(y: thumbY - thumbDiameter / 2)
                .frame(width: containerWidth, height: trackHeight, alignment: .top)
        }
        .frame(width: containerWidth, height: trackHeight)
        .contentShape(Rectangle())
        .gesture(
            DragGesture(minimumDistance: 0)
                .onChanged { gesture in
                    if dragStartLocationY == 0 {
                        dragStartLocationY = gesture.startLocation.y
                        dragStartNorm = normalisedValue
                    }
                    let delta = gesture.location.y - dragStartLocationY
                    // Drag down = decrease, drag up = increase
                    let normDelta = delta / trackHeight
                    let newNorm = (dragStartNorm - normDelta).clamped(to: 0...1)
                    let newValue = range.lowerBound + newNorm * (range.upperBound - range.lowerBound)
                    let rounded = (newValue * 100).rounded() / 100
                    value = rounded
                    onValueChange?(rounded)
                }
                .onEnded { _ in
                    dragStartLocationY = 0
                    dragStartNorm = 0
                }
        )
    }
}

// MARK: - Comparable + clamped

private extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}
