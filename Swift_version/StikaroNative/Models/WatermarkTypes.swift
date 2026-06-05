import Foundation
import CoreGraphics

// MARK: - Watermark Enums

enum WatermarkType: String, Codable {
    case text
    case image
    case combined
}

enum WatermarkPattern: String, Codable, CaseIterable {
    case grid
    case diagonal
    case scattered
    case corners
    case edges
    case center
    case single
}

enum WatermarkDensity: String, Codable {
    case dense
    case moderate
    case sparse
}

enum WatermarkStyle: String, Codable {
    case subtle
    case standard
    case prominent
}

enum WatermarkCategory: String, Codable {
    case coverage
    case size
    case pattern
    case density
    case style
}

// MARK: - WatermarkInstance

struct WatermarkInstance: Identifiable, Codable, Equatable {
    let id: String
    var type: WatermarkType
    var content: String
    var position: CodableCGPoint
    var size: CodableCGSize
    var rotation: CGFloat
    var opacity: CGFloat
    var locked: Bool
    var visible: Bool
    var style: WatermarkInstanceStyle?

    init(
        id: String = UUID().uuidString,
        type: WatermarkType = .text,
        content: String,
        position: CGPoint = .zero,
        size: CGSize = CGSize(width: 100, height: 30),
        rotation: CGFloat = 0,
        opacity: CGFloat = 0.3,
        locked: Bool = false,
        visible: Bool = true,
        style: WatermarkInstanceStyle? = nil
    ) {
        self.id = id
        self.type = type
        self.content = content
        self.position = CodableCGPoint(position)
        self.size = CodableCGSize(size)
        self.rotation = rotation
        self.opacity = opacity
        self.locked = locked
        self.visible = visible
        self.style = style
    }
}

struct WatermarkInstanceStyle: Codable, Equatable {
    var fontFamily: String?
    var fontSize: CGFloat?
    var color: String?
    var textEffect: TextEffect?
}

// MARK: - WatermarkPreset

struct WatermarkPreset: Identifiable, Codable {
    let id: String
    var name: String
    var description: String
    var category: WatermarkCategory
    var pattern: WatermarkPattern
    var density: WatermarkDensity
    var style: WatermarkStyle
    var config: WatermarkPresetConfig
    var thumbnail: String?
}

struct WatermarkPresetConfig: Codable {
    var count: Int
    var baseSize: CodableCGSize
    var sizeVariation: CGFloat
    var opacityRange: ClosedRange<CGFloat>
    var rotationRange: ClosedRange<CGFloat>
    var spacing: CGFloat?
    var alignment: TextAlignment?

    enum TextAlignment: String, Codable {
        case left, center, right
    }

    enum CodingKeys: String, CodingKey {
        case count, baseSize, sizeVariation, opacityMin, opacityMax, rotationMin, rotationMax, spacing, alignment
    }

    init(count: Int, baseSize: CGSize, sizeVariation: CGFloat = 0,
         opacityRange: ClosedRange<CGFloat> = 0.1...0.3,
         rotationRange: ClosedRange<CGFloat> = -30...30,
         spacing: CGFloat? = nil, alignment: TextAlignment? = nil) {
        self.count = count
        self.baseSize = CodableCGSize(baseSize)
        self.sizeVariation = sizeVariation
        self.opacityRange = opacityRange
        self.rotationRange = rotationRange
        self.spacing = spacing
        self.alignment = alignment
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        count = try container.decode(Int.self, forKey: .count)
        baseSize = try container.decode(CodableCGSize.self, forKey: .baseSize)
        sizeVariation = try container.decode(CGFloat.self, forKey: .sizeVariation)
        let oMin = try container.decode(CGFloat.self, forKey: .opacityMin)
        let oMax = try container.decode(CGFloat.self, forKey: .opacityMax)
        opacityRange = oMin...oMax
        let rMin = try container.decode(CGFloat.self, forKey: .rotationMin)
        let rMax = try container.decode(CGFloat.self, forKey: .rotationMax)
        rotationRange = rMin...rMax
        spacing = try container.decodeIfPresent(CGFloat.self, forKey: .spacing)
        alignment = try container.decodeIfPresent(TextAlignment.self, forKey: .alignment)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(count, forKey: .count)
        try container.encode(baseSize, forKey: .baseSize)
        try container.encode(sizeVariation, forKey: .sizeVariation)
        try container.encode(opacityRange.lowerBound, forKey: .opacityMin)
        try container.encode(opacityRange.upperBound, forKey: .opacityMax)
        try container.encode(rotationRange.lowerBound, forKey: .rotationMin)
        try container.encode(rotationRange.upperBound, forKey: .rotationMax)
        try container.encodeIfPresent(spacing, forKey: .spacing)
        try container.encodeIfPresent(alignment, forKey: .alignment)
    }
}

// MARK: - WatermarkGlobalSettings

struct WatermarkGlobalSettings: Codable, Equatable {
    var opacity: CGFloat = 0.3
    var scale: CGFloat = 1.0
    var rotation: CGFloat = 0
}

// MARK: - WatermarkState

struct WatermarkState {
    var watermarks: [WatermarkInstance] = []
    var activePresetId: String?
    var selectedWatermarkId: String?
    var globalSettings: WatermarkGlobalSettings = WatermarkGlobalSettings()
    var customText: String = ""
    var customImageUri: String?
}
