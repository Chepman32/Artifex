import SwiftUI

// MARK: - Particle Splash Screen
//
// 20 columns x 25 rows = 500 tiles sliced from the app icon.
// Phase 1 (0–1000ms): each tile lerps from a random scatter position to its
//   grid position using a cubic-bezier(0.25, 0.1, 0.25, 1) ease curve.
// Phase 2 (1000–1500ms): the assembled icon zooms from 1x → 3x.

struct ParticleSplashScreen: View {
    @Environment(AppStore.self) private var appStore

    private var theme: Theme {
        AppThemes.theme(for: appStore.preferences.theme)
    }

    // Grid constants
    private let columns = 20
    private let rows = 25
    private var tileCount: Int { columns * rows }

    // Source icon is 1024x1024; we read it once
    private let sourceSize: CGFloat = 1024

    // Random scatter origins — seeded deterministically so they're stable
    @State private var scatterOrigins: [CGPoint] = []
    @State private var animationPhase: AnimationPhase = .idle

    enum AnimationPhase {
        case idle
        case assembling   // phase 1: scatter → grid
        case zooming      // phase 2: scale up
    }

    var body: some View {
        GeometryReader { geo in
            let screenMin = min(geo.size.width, geo.size.height)
            let iconSize: CGFloat = screenMin * 0.55
            let tileW = iconSize / CGFloat(columns)
            let tileH = iconSize / CGFloat(rows)

            ZStack {
                theme.backgrounds.primary.ignoresSafeArea()

                TimelineView(.animation) { timeline in
                    Canvas { ctx, size in
                        guard !scatterOrigins.isEmpty,
                              let iconImage = UIImage(named: "AppIcon") ?? UIImage(named: "AppIcon60x60") ?? loadAppIconFallback() else {
                            return
                        }

                        let elapsed = timeline.date.timeIntervalSince(animationStartDate)

                        // Phase 1: 0–1.0s assembly
                        // Phase 2: 1.0–1.5s zoom
                        let assembleProgress = min(max(elapsed / 1.0, 0), 1.0)
                        let easedAssemble = cubicBezierEase(assembleProgress, p1x: 0.25, p1y: 0.1, p2x: 0.25, p2y: 1.0)

                        let zoomRaw = min(max((elapsed - 1.0) / 0.5, 0), 1.0)
                        let zoomProgress = cubicBezierEase(zoomRaw, p1x: 0.4, p1y: 0.0, p2x: 0.2, p2y: 1.0)
                        let currentScale = 1.0 + zoomProgress * 2.0  // 1x → 3x

                        let iconOriginX = (size.width - iconSize) / 2
                        let iconOriginY = (size.height - iconSize) / 2

                        ctx.scaleBy(
                            x: currentScale,
                            y: currentScale,
                            anchor: CGPoint(x: size.width / 2, y: size.height / 2)
                        )

                        for i in 0..<tileCount {
                            let col = i % columns
                            let row = i / columns

                            // Grid destination (center of tile)
                            let destX = iconOriginX + CGFloat(col) * tileW
                            let destY = iconOriginY + CGFloat(row) * tileH

                            // Lerp from scatter to destination
                            let scatter = scatterOrigins[i]
                            let currentX = scatter.x + (destX - scatter.x) * easedAssemble
                            let currentY = scatter.y + (destY - scatter.y) * easedAssemble

                            // Source crop rect within 1024x1024 icon
                            let srcTileW = sourceSize / CGFloat(columns)
                            let srcTileH = sourceSize / CGFloat(rows)
                            let srcRect = CGRect(
                                x: CGFloat(col) * srcTileW,
                                y: CGFloat(row) * srcTileH,
                                width: srcTileW,
                                height: srcTileH
                            )

                            let destRect = CGRect(x: currentX, y: currentY, width: tileW, height: tileH)

                            if let cgImage = iconImage.cgImage?.cropping(to: srcRect) {
                                ctx.draw(Image(cgImage, scale: 1.0, label: Text("")), in: destRect)
                            }
                        }
                    }
                }
                .ignoresSafeArea()
            }
            .onAppear {
                scatterOrigins = makeScatterOrigins(screenSize: geo.size, iconSize: iconSize, tileW: tileW, tileH: tileH)
                animationStartDate = Date()
                animationPhase = .assembling
            }
        }
    }

    // MARK: - Animation Start Date

    @State private var animationStartDate: Date = Date()

    // MARK: - Scatter Origin Generation

    private func makeScatterOrigins(screenSize: CGSize, iconSize: CGFloat, tileW: CGFloat, tileH: CGFloat) -> [CGPoint] {
        var rng = SeededRNG(seed: 42)
        return (0..<tileCount).map { _ in
            CGPoint(
                x: CGFloat(rng.next()) / CGFloat(UInt32.max) * screenSize.width - tileW,
                y: CGFloat(rng.next()) / CGFloat(UInt32.max) * screenSize.height - tileH
            )
        }
    }

    // MARK: - App Icon Fallback

    private func loadAppIconFallback() -> UIImage? {
        // Try to load from the bundle's icon files list
        if let icons = Bundle.main.infoDictionary?["CFBundleIcons"] as? [String: Any],
           let primaryIcon = icons["CFBundlePrimaryIcon"] as? [String: Any],
           let files = primaryIcon["CFBundleIconFiles"] as? [String],
           let firstName = files.last {
            return UIImage(named: firstName)
        }
        return nil
    }

    // MARK: - Cubic-Bezier Ease (numerical approximation)

    /// Approximates a CSS cubic-bezier(p1x, p1y, p2x, p2y) easing function for
    /// a given progress value t ∈ [0, 1]. Uses Newton-Raphson to solve for the
    /// bezier parameter, then evaluates the Y component.
    private func cubicBezierEase(_ t: Double, p1x: Double, p1y: Double, p2x: Double, p2y: Double) -> Double {
        guard t > 0 && t < 1 else { return t }

        // Coefficients for X bezier
        let cx = 3 * p1x
        let bx = 3 * (p2x - p1x) - cx
        let ax = 1 - cx - bx

        // Coefficients for Y bezier
        let cy = 3 * p1y
        let by = 3 * (p2y - p1y) - cy
        let ay = 1 - cy - by

        func sampleCurveX(_ u: Double) -> Double { ((ax * u + bx) * u + cx) * u }
        func sampleCurveDerivX(_ u: Double) -> Double { (3 * ax * u + 2 * bx) * u + cx }
        func sampleCurveY(_ u: Double) -> Double { ((ay * u + by) * u + cy) * u }

        // Newton-Raphson to solve for parameter u where sampleCurveX(u) == t
        var u = t
        for _ in 0..<8 {
            let x = sampleCurveX(u) - t
            let dx = sampleCurveDerivX(u)
            if abs(dx) < 1e-6 { break }
            u -= x / dx
        }
        return sampleCurveY(u)
    }
}

// MARK: - Seeded RNG (Xorshift32)

private struct SeededRNG {
    private var state: UInt32

    init(seed: UInt32) {
        state = seed == 0 ? 1 : seed
    }

    mutating func next() -> UInt32 {
        state ^= state << 13
        state ^= state >> 17
        state ^= state << 5
        return state
    }
}

// MARK: - Canvas Scale Extension

private extension GraphicsContext {
    mutating func scaleBy(x: CGFloat, y: CGFloat, anchor: CGPoint) {
        var transform = CGAffineTransform.identity
        transform = transform.translatedBy(x: anchor.x, y: anchor.y)
        transform = transform.scaledBy(x: x, y: y)
        transform = transform.translatedBy(x: -anchor.x, y: -anchor.y)
        concatenate(transform)
    }
}
