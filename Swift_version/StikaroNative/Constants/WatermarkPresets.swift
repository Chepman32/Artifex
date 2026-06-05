import Foundation
import CoreGraphics

/// All 12 watermark presets matching the React Native original.
enum WatermarkPresets {

    static let all: [WatermarkPreset] = [
        WatermarkPreset(
            id: "tile-pattern",
            name: "Tile Pattern",
            description: "Dense grid covering entire image",
            category: .coverage,
            pattern: .grid,
            density: .dense,
            style: .subtle,
            config: WatermarkPresetConfig(
                count: 20,
                baseSize: CGSize(width: 120, height: 40),
                sizeVariation: 0.1,
                opacityRange: 0.15...0.25,
                rotationRange: -15...15,
                spacing: 80
            )
        ),
        WatermarkPreset(
            id: "corner-branding",
            name: "Corner Branding",
            description: "4 watermarks in corners",
            category: .pattern,
            pattern: .corners,
            density: .sparse,
            style: .standard,
            config: WatermarkPresetConfig(
                count: 4,
                baseSize: CGSize(width: 100, height: 35),
                sizeVariation: 0,
                opacityRange: 0.6...0.6,
                rotationRange: 0...0
            )
        ),
        WatermarkPreset(
            id: "diagonal-stripe",
            name: "Diagonal Stripe",
            description: "Watermarks along diagonal line",
            category: .pattern,
            pattern: .diagonal,
            density: .moderate,
            style: .standard,
            config: WatermarkPresetConfig(
                count: 8,
                baseSize: CGSize(width: 110, height: 38),
                sizeVariation: 0.15,
                opacityRange: 0.3...0.4,
                rotationRange: -45 ... -45,
                spacing: 120
            )
        ),
        WatermarkPreset(
            id: "scattered-protection",
            name: "Scattered Protection",
            description: "Random placement with varied sizes",
            category: .pattern,
            pattern: .scattered,
            density: .moderate,
            style: .standard,
            config: WatermarkPresetConfig(
                count: 12,
                baseSize: CGSize(width: 100, height: 35),
                sizeVariation: 0.4,
                opacityRange: 0.25...0.45,
                rotationRange: -30...30
            )
        ),
        WatermarkPreset(
            id: "minimal-single",
            name: "Minimal",
            description: "Single centered watermark",
            category: .coverage,
            pattern: .center,
            density: .sparse,
            style: .subtle,
            config: WatermarkPresetConfig(
                count: 1,
                baseSize: CGSize(width: 150, height: 50),
                sizeVariation: 0,
                opacityRange: 0.5...0.5,
                rotationRange: 0...0
            )
        ),
        WatermarkPreset(
            id: "border-guard",
            name: "Border Guard",
            description: "Watermarks along image edges",
            category: .pattern,
            pattern: .edges,
            density: .moderate,
            style: .standard,
            config: WatermarkPresetConfig(
                count: 12,
                baseSize: CGSize(width: 90, height: 32),
                sizeVariation: 0.1,
                opacityRange: 0.35...0.45,
                rotationRange: -10...10,
                spacing: 100
            )
        ),
        WatermarkPreset(
            id: "photographer-style",
            name: "Photographer",
            description: "Small bottom-right signature",
            category: .style,
            pattern: .single,
            density: .sparse,
            style: .subtle,
            config: WatermarkPresetConfig(
                count: 1,
                baseSize: CGSize(width: 120, height: 40),
                sizeVariation: 0,
                opacityRange: 0.7...0.7,
                rotationRange: 0...0,
                alignment: .right
            )
        ),
        WatermarkPreset(
            id: "dense-grid",
            name: "Dense Grid",
            description: "Maximum coverage protection",
            category: .density,
            pattern: .grid,
            density: .dense,
            style: .prominent,
            config: WatermarkPresetConfig(
                count: 30,
                baseSize: CGSize(width: 100, height: 35),
                sizeVariation: 0.05,
                opacityRange: 0.2...0.3,
                rotationRange: -5...5,
                spacing: 60
            )
        ),
        WatermarkPreset(
            id: "moderate-coverage",
            name: "Moderate Coverage",
            description: "Balanced protection",
            category: .density,
            pattern: .grid,
            density: .moderate,
            style: .standard,
            config: WatermarkPresetConfig(
                count: 12,
                baseSize: CGSize(width: 110, height: 38),
                sizeVariation: 0.1,
                opacityRange: 0.3...0.4,
                rotationRange: -10...10,
                spacing: 120
            )
        ),
        WatermarkPreset(
            id: "large-watermarks",
            name: "Large",
            description: "Big, visible watermarks",
            category: .size,
            pattern: .scattered,
            density: .sparse,
            style: .prominent,
            config: WatermarkPresetConfig(
                count: 6,
                baseSize: CGSize(width: 180, height: 60),
                sizeVariation: 0.2,
                opacityRange: 0.4...0.6,
                rotationRange: -20...20
            )
        ),
        WatermarkPreset(
            id: "small-watermarks",
            name: "Small",
            description: "Subtle, small watermarks",
            category: .size,
            pattern: .scattered,
            density: .moderate,
            style: .subtle,
            config: WatermarkPresetConfig(
                count: 15,
                baseSize: CGSize(width: 70, height: 25),
                sizeVariation: 0.15,
                opacityRange: 0.25...0.35,
                rotationRange: -15...15
            )
        ),
        WatermarkPreset(
            id: "micro-watermarks",
            name: "Micro",
            description: "Tiny, barely visible watermarks",
            category: .size,
            pattern: .grid,
            density: .dense,
            style: .subtle,
            config: WatermarkPresetConfig(
                count: 40,
                baseSize: CGSize(width: 50, height: 18),
                sizeVariation: 0.1,
                opacityRange: 0.15...0.2,
                rotationRange: -5...5,
                spacing: 50
            )
        ),
    ]
}
