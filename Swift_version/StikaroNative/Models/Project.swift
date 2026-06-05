import Foundation
import CoreGraphics

// MARK: - ElementType

enum ElementType: String, Codable, CaseIterable {
    case text
    case sticker
    case watermark
    case stamp
}

// MARK: - CGSize Codable

struct CodableCGSize: Codable, Equatable {
    var width: CGFloat
    var height: CGFloat

    var cgSize: CGSize { CGSize(width: width, height: height) }

    init(_ size: CGSize) {
        self.width  = size.width
        self.height = size.height
    }
}

// MARK: - CGPoint Codable

struct CodableCGPoint: Codable, Equatable {
    var x: CGFloat
    var y: CGFloat

    var cgPoint: CGPoint { CGPoint(x: x, y: y) }

    init(_ point: CGPoint) {
        self.x = point.x
        self.y = point.y
    }
}

// MARK: - SerializedElement

/// Serialisable representation of a canvas element persisted to disk.
struct SerializedElement: Codable, Identifiable, Equatable {
    let id: String

    var type: ElementType

    /// Normalised position in the range 0–1 relative to the canvas dimensions.
    var position: CodableCGPoint

    var scale: CGFloat
    /// Rotation expressed in degrees.
    var rotation: CGFloat
    var opacity: CGFloat
    var zIndex: Int

    // MARK: Text-specific
    var textContent: String?
    var font: String?
    var fontSize: CGFloat?
    var color: String?

    // MARK: Stroke
    var strokeWidth: CGFloat?
    var strokeColor: String?

    // MARK: Image-specific
    var assetPath: String?
    var originalSize: CodableCGSize?
    var tint: String?

    // MARK: - Convenience accessors

    var positionCGPoint: CGPoint {
        get { position.cgPoint }
        set { position = CodableCGPoint(newValue) }
    }

    var originalSizeCGSize: CGSize? {
        get { originalSize?.cgSize }
        set { originalSize = newValue.map { CodableCGSize($0) } }
    }

    // MARK: - Init

    init(
        id: String = UUID().uuidString,
        type: ElementType,
        position: CGPoint = .zero,
        scale: CGFloat = 1,
        rotation: CGFloat = 0,
        opacity: CGFloat = 1,
        zIndex: Int = 0,
        textContent: String? = nil,
        font: String? = nil,
        fontSize: CGFloat? = nil,
        color: String? = nil,
        strokeWidth: CGFloat? = nil,
        strokeColor: String? = nil,
        assetPath: String? = nil,
        originalSize: CGSize? = nil,
        tint: String? = nil
    ) {
        self.id           = id
        self.type         = type
        self.position     = CodableCGPoint(position)
        self.scale        = scale
        self.rotation     = rotation
        self.opacity      = opacity
        self.zIndex       = zIndex
        self.textContent  = textContent
        self.font         = font
        self.fontSize     = fontSize
        self.color        = color
        self.strokeWidth  = strokeWidth
        self.strokeColor  = strokeColor
        self.assetPath    = assetPath
        self.originalSize = originalSize.map { CodableCGSize($0) }
        self.tint         = tint
    }
}

// MARK: - Project

struct Project: Codable, Identifiable, Equatable {
    let id: String

    var sourceImagePath: String
    var sourceImageDimensions: CodableCGSize
    var canvasSize: CodableCGSize?
    var thumbnailPath: String
    var elements: [SerializedElement]
    var createdAt: Date
    var updatedAt: Date

    // MARK: - Convenience accessors

    var sourceImageDimensionsCGSize: CGSize {
        get { sourceImageDimensions.cgSize }
        set { sourceImageDimensions = CodableCGSize(newValue) }
    }

    var canvasSizeCGSize: CGSize? {
        get { canvasSize?.cgSize }
        set { canvasSize = newValue.map { CodableCGSize($0) } }
    }

    // MARK: - Init

    init(
        id: String = UUID().uuidString,
        sourceImagePath: String,
        sourceImageDimensions: CGSize,
        canvasSize: CGSize? = nil,
        thumbnailPath: String,
        elements: [SerializedElement] = [],
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id                     = id
        self.sourceImagePath        = sourceImagePath
        self.sourceImageDimensions  = CodableCGSize(sourceImageDimensions)
        self.canvasSize             = canvasSize.map { CodableCGSize($0) }
        self.thumbnailPath          = thumbnailPath
        self.elements               = elements
        self.createdAt              = createdAt
        self.updatedAt              = updatedAt
    }
}
