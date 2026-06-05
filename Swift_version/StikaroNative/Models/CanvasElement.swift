import Foundation
import CoreGraphics

// MARK: - TextEffect

enum TextEffect: String, Codable, CaseIterable {
    case none
    case neon
    case glow
    case shadow
    case outline
}

// MARK: - CanvasElement

/// A live, in-memory canvas element used by the editor. Positions are stored
/// in pixel coordinates; rotation is stored in radians.
struct CanvasElement: Identifiable, Equatable, Codable {

    let id: String

    var type: ElementType

    /// Position in pixel coordinates within the canvas.
    var position: CodableCGPoint

    var scale: CGFloat
    /// Rotation in radians.
    var rotation: CGFloat

    var width: CGFloat?
    var height: CGFloat?
    var opacity: CGFloat?

    // MARK: Text-specific
    var textContent: String?
    var fontFamily: String?
    var fontSize: CGFloat?
    /// Hex or rgba colour string (e.g. "#FF0000" or "rgba(255,0,0,1)").
    var color: String?
    var textEffect: TextEffect?
    /// Hex or rgba colour string for the text background pill.
    var textBackground: String?

    // MARK: Image-specific
    var assetPath: String?

    // MARK: - Convenience accessors

    var positionCGPoint: CGPoint {
        get { position.cgPoint }
        set { position = CodableCGPoint(newValue) }
    }

    var size: CGSize? {
        guard let w = width, let h = height else { return nil }
        return CGSize(width: w, height: h)
    }

    // MARK: - Init

    init(
        id: String = UUID().uuidString,
        type: ElementType,
        position: CGPoint = .zero,
        scale: CGFloat = 1,
        rotation: CGFloat = 0,
        width: CGFloat? = nil,
        height: CGFloat? = nil,
        opacity: CGFloat? = 1,
        textContent: String? = nil,
        fontFamily: String? = nil,
        fontSize: CGFloat? = nil,
        color: String? = nil,
        textEffect: TextEffect? = nil,
        textBackground: String? = nil,
        assetPath: String? = nil
    ) {
        self.id             = id
        self.type           = type
        self.position       = CodableCGPoint(position)
        self.scale          = scale
        self.rotation       = rotation
        self.width          = width
        self.height         = height
        self.opacity        = opacity
        self.textContent    = textContent
        self.fontFamily     = fontFamily
        self.fontSize       = fontSize
        self.color          = color
        self.textEffect     = textEffect
        self.textBackground = textBackground
        self.assetPath      = assetPath
    }

    // MARK: - Serialisation bridge

    /// Creates a `CanvasElement` from a `SerializedElement`, converting the
    /// normalised position to pixel coordinates using the supplied canvas size.
    init(from serialized: SerializedElement, canvasSize: CGSize) {
        self.init(
            id:             serialized.id,
            type:           serialized.type,
            position:       CGPoint(
                                x: serialized.position.x * canvasSize.width,
                                y: serialized.position.y * canvasSize.height
                            ),
            scale:          serialized.scale,
            rotation:       serialized.rotation * (.pi / 180),
            width:          serialized.originalSize?.width,
            height:         serialized.originalSize?.height,
            opacity:        serialized.opacity,
            textContent:    serialized.textContent,
            fontFamily:     serialized.font,
            fontSize:       serialized.fontSize,
            color:          serialized.color,
            textBackground: nil,
            assetPath:      serialized.assetPath
        )
    }

    /// Converts back to a `SerializedElement` with normalised position.
    func toSerializedElement(canvasSize: CGSize) -> SerializedElement {
        SerializedElement(
            id:           id,
            type:         type,
            position:     CGPoint(
                              x: canvasSize.width  > 0 ? position.x / canvasSize.width  : 0,
                              y: canvasSize.height > 0 ? position.y / canvasSize.height : 0
                          ),
            scale:        scale,
            rotation:     rotation * (180 / .pi),
            opacity:      opacity ?? 1,
            zIndex:       0,
            textContent:  textContent,
            font:         fontFamily,
            fontSize:     fontSize,
            color:        color,
            assetPath:    assetPath,
            originalSize: size
        )
    }
}
