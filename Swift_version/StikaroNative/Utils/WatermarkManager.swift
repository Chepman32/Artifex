import Foundation
import CoreGraphics

/// Core logic for applying watermark presets and generating watermark instances.
/// Ports the RN `watermarkManager.ts` with all 7 pattern generators.
enum WatermarkManager {

    // MARK: - Seeded Random (LCG matching RN exactly)

    private struct SeededRNG {
        var state: Int

        init(seed: Int = 12345) {
            state = seed
        }

        mutating func next() -> CGFloat {
            state = (state * 9301 + 49297) % 233280
            return CGFloat(state) / 233280
        }
    }

    private static func generateId() -> String {
        let timestamp = String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
        let random = String(Int.random(in: 0..<Int(1e9)), radix: 36)
        return timestamp + random
    }

    // MARK: - Apply Preset

    static func applyPreset(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType = .text
    ) -> [WatermarkInstance] {
        switch preset.pattern {
        case .grid:       return generateGridPattern(preset, canvasSize: canvasSize, content: content, type: type)
        case .diagonal:   return generateDiagonalPattern(preset, canvasSize: canvasSize, content: content, type: type)
        case .scattered:  return generateScatteredPattern(preset, canvasSize: canvasSize, content: content, type: type)
        case .corners:    return generateCornersPattern(preset, canvasSize: canvasSize, content: content, type: type)
        case .edges:      return generateEdgesPattern(preset, canvasSize: canvasSize, content: content, type: type)
        case .center:     return generateCenterPattern(preset, canvasSize: canvasSize, content: content, type: type)
        case .single:     return generateSinglePattern(preset, canvasSize: canvasSize, content: content, type: type)
        }
    }

    // MARK: - Pattern Generators

    private static func generateGridPattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        let spacing = preset.config.spacing ?? 100
        let cols = Int(ceil(canvasSize.width / spacing))
        let rows = Int(ceil(canvasSize.height / spacing))
        var watermarks: [WatermarkInstance] = []

        for row in 0..<rows {
            for col in 0..<cols {
                let x = CGFloat(col) * spacing + spacing / 2
                let y = CGFloat(row) * spacing + spacing / 2
                watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: x, y: y)))
            }
        }

        return Array(watermarks.prefix(preset.config.count))
    }

    private static func generateDiagonalPattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        let spacing = preset.config.spacing ?? 120
        let diagonalLength = sqrt(canvasSize.width * canvasSize.width + canvasSize.height * canvasSize.height)
        let count = min(preset.config.count, Int(ceil(diagonalLength / spacing)))
        var watermarks: [WatermarkInstance] = []

        for i in 0..<count {
            let t = count > 1 ? CGFloat(i) / CGFloat(count - 1) : 0
            let x = t * canvasSize.width
            let y = t * canvasSize.height
            watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: x, y: y)))
        }

        return watermarks
    }

    private static func generateScatteredPattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        var rng = SeededRNG(seed: 12345)
        var watermarks: [WatermarkInstance] = []

        for _ in 0..<preset.config.count {
            let x = rng.next() * canvasSize.width
            let y = rng.next() * canvasSize.height
            watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: x, y: y)))
        }

        return watermarks
    }

    private static func generateCornersPattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        let padding: CGFloat = 40
        let positions: [CGPoint] = [
            CGPoint(x: padding, y: padding),
            CGPoint(x: canvasSize.width - padding, y: padding),
            CGPoint(x: padding, y: canvasSize.height - padding),
            CGPoint(x: canvasSize.width - padding, y: canvasSize.height - padding),
        ]
        return positions.map { pos in
            createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: pos)
        }
    }

    private static func generateEdgesPattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        let spacing = preset.config.spacing ?? 100
        let padding: CGFloat = 30
        var watermarks: [WatermarkInstance] = []

        // Top edge
        let topCount = Int(floor(canvasSize.width / spacing))
        for i in 0..<topCount {
            let x = (CGFloat(i) + 0.5) * spacing
            watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: x, y: padding)))
        }

        // Bottom edge
        let bottomCount = Int(floor(canvasSize.width / spacing))
        for i in 0..<bottomCount {
            let x = (CGFloat(i) + 0.5) * spacing
            watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: x, y: canvasSize.height - padding)))
        }

        // Left edge
        let leftCount = Int(floor(canvasSize.height / spacing))
        for i in 1..<max(1, leftCount - 1) {
            let y = (CGFloat(i) + 0.5) * spacing
            watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: padding, y: y)))
        }

        // Right edge
        let rightCount = Int(floor(canvasSize.height / spacing))
        for i in 1..<max(1, rightCount - 1) {
            let y = (CGFloat(i) + 0.5) * spacing
            watermarks.append(createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: canvasSize.width - padding, y: y)))
        }

        return Array(watermarks.prefix(preset.config.count))
    }

    private static func generateCenterPattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        [createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2))]
    }

    private static func generateSinglePattern(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType
    ) -> [WatermarkInstance] {
        let padding: CGFloat = 40
        let alignment = preset.config.alignment ?? .right

        let x: CGFloat
        switch alignment {
        case .left:   x = padding
        case .center: x = canvasSize.width / 2
        case .right:  x = canvasSize.width - padding
        }

        return [createWatermarkInstance(preset, canvasSize: canvasSize, content: content, type: type, position: CGPoint(x: x, y: canvasSize.height - padding))]
    }

    // MARK: - Instance Creation

    private static func createWatermarkInstance(
        _ preset: WatermarkPreset,
        canvasSize: CGSize,
        content: String,
        type: WatermarkType,
        position: CGPoint
    ) -> WatermarkInstance {
        let config = preset.config

        // Apply size variation
        let sizeMultiplier = 1 + (CGFloat.random(in: -1...1)) * config.sizeVariation
        let width = config.baseSize.cgSize.width * sizeMultiplier
        let height = config.baseSize.cgSize.height * sizeMultiplier

        // Apply opacity variation
        let opacity = CGFloat.random(in: config.opacityRange)

        // Apply rotation variation
        let rotation = CGFloat.random(in: config.rotationRange)

        return WatermarkInstance(
            id: generateId(),
            type: type,
            content: content,
            position: position,
            size: CGSize(width: width, height: height),
            rotation: rotation,
            opacity: opacity,
            locked: false,
            visible: true,
            style: type == .text
                ? WatermarkInstanceStyle(fontFamily: "System", fontSize: 16, color: "#FFFFFF", textEffect: .none)
                : nil
        )
    }

    // MARK: - Global Settings

    static func applyGlobalSettings(
        to watermarks: [WatermarkInstance],
        settings: WatermarkGlobalSettings
    ) -> [WatermarkInstance] {
        watermarks.map { wm in
            var modified = wm
            modified.opacity = settings.opacity
            modified.size = CodableCGSize(CGSize(
                width: wm.size.cgSize.width * settings.scale,
                height: wm.size.cgSize.height * settings.scale
            ))
            modified.rotation = wm.rotation + settings.rotation
            return modified
        }
    }

    // MARK: - Convert to Canvas Elements

    static func toCanvasElements(
        _ watermarks: [WatermarkInstance],
        canvasSize: CGSize? = nil
    ) -> [CanvasElement] {
        watermarks.map { wm in
            let width = wm.size.cgSize.width
            let height = wm.size.cgSize.height

            let clampedX = clampPosition(wm.position.cgPoint.x - width / 2, size: width, maxDimension: canvasSize?.width)
            let clampedY = clampPosition(wm.position.cgPoint.y - height / 2, size: height, maxDimension: canvasSize?.height)

            if wm.type == .text {
                return CanvasElement(
                    id: wm.id,
                    type: .text,
                    position: CGPoint(x: clampedX, y: clampedY),
                    scale: 1,
                    rotation: wm.rotation * (.pi / 180),
                    width: width,
                    height: height,
                    opacity: wm.opacity,
                    textContent: wm.content,
                    fontFamily: wm.style?.fontFamily ?? "System",
                    fontSize: wm.style?.fontSize ?? 16,
                    color: wm.style?.color ?? "#FFFFFF",
                    textEffect: wm.style?.textEffect ?? .none
                )
            } else {
                return CanvasElement(
                    id: wm.id,
                    type: .watermark,
                    position: CGPoint(x: clampedX, y: clampedY),
                    scale: 1,
                    rotation: wm.rotation * (.pi / 180),
                    width: width,
                    height: height,
                    opacity: wm.opacity,
                    assetPath: wm.content
                )
            }
        }
    }

    private static func clampPosition(_ value: CGFloat, size: CGFloat, maxDimension: CGFloat?) -> CGFloat {
        guard let maxDim = maxDimension, maxDim.isFinite else {
            return max(value, 0)
        }
        let maxVal = max(maxDim - size, 0)
        return min(max(value, 0), maxVal)
    }
}
