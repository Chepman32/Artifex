import UIKit
import CoreImage
import CoreImage.CIFilterBuiltins
import CoreGraphics

/// Full canvas export pipeline using UIGraphicsImageRenderer.
/// Ports the Skia-based imageExporter.ts to native iOS rendering.
enum ImageExporter {

    // MARK: - Constants

    private static let stikaroWatermarkText = "Stikaro"
    private static let watermarkFontSize: CGFloat = 14
    private static let watermarkOpacity: CGFloat = 0.6
    private static let watermarkPadding: CGFloat = 12

    // MARK: - Directories

    private static var tempDirectory: URL {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("stikaro_temp")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    private static var thumbnailDirectory: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let dir = docs.appendingPathComponent("stikaro_thumbnails")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    // MARK: - Canvas Scale

    private struct CanvasScale {
        let x: CGFloat
        let y: CGFloat
    }

    private static func getCanvasScale(
        sourceDimensions: CGSize,
        canvasSize: CGSize?
    ) -> CanvasScale {
        guard let cs = canvasSize, cs.width > 0, cs.height > 0 else {
            return CanvasScale(x: 1, y: 1)
        }

        let scaleX = sourceDimensions.width / cs.width
        let scaleY = sourceDimensions.height / cs.height

        return CanvasScale(
            x: scaleX.isFinite && scaleX > 0 ? scaleX : 1,
            y: scaleY.isFinite && scaleY > 0 ? scaleY : 1
        )
    }

    // MARK: - Image Loading

    private static func loadImage(from uri: String) -> UIImage? {
        let path: String
        if uri.hasPrefix("file://") {
            path = uri.replacingOccurrences(of: "file://", with: "")
        } else if uri.hasPrefix("file:/") {
            path = uri.replacingOccurrences(of: "file:/", with: "/")
        } else {
            path = uri
        }

        if let image = UIImage(contentsOfFile: path) {
            return image
        }
        // Try as asset name
        return UIImage(named: path)
    }

    // MARK: - Filter Application

    private static let ciContext = CIContext()

    private static func applyFilter(to image: UIImage, filter: ImageFilter?) -> UIImage {
        guard let filter, filter.type != .none,
              let ciImage = CIImage(image: image) else { return image }

        let filtered = ColorMatrixFilter.applyFilter(filter, to: ciImage)

        guard let cgImage = ciContext.createCGImage(filtered, from: filtered.extent) else {
            return image
        }
        return UIImage(cgImage: cgImage)
    }

    // MARK: - Text Rasterisation

    /// Rasterises a text element to a UIImage for compositing during export.
    private static func rasterizeTextElement(_ element: CanvasElement, scale: CanvasScale) -> UIImage? {
        guard let text = element.textContent, !text.isEmpty else { return nil }

        let fontSize = (element.fontSize ?? 24) * max(scale.x, scale.y)
        let fontName = element.fontFamily ?? "System"
        let font: UIFont
        if let customFont = UIFont(name: fontName, size: fontSize) {
            font = customFont
        } else {
            font = UIFont.systemFont(ofSize: fontSize, weight: .regular)
        }

        let textColor: UIColor
        if let colorStr = element.color {
            textColor = UIColor(hex: colorStr)
        } else {
            textColor = .white
        }

        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.alignment = .center

        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: textColor,
            .paragraphStyle: paragraphStyle,
        ]

        let nsText = text as NSString
        let textSize = nsText.boundingRect(
            with: CGSize(width: CGFloat.greatestFiniteMagnitude, height: CGFloat.greatestFiniteMagnitude),
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: attributes,
            context: nil
        ).size

        let padding: CGFloat = 8
        let renderSize = CGSize(
            width: ceil(textSize.width) + padding * 2,
            height: ceil(textSize.height) + padding * 2
        )

        guard renderSize.width > 0, renderSize.height > 0 else { return nil }

        let renderer = UIGraphicsImageRenderer(size: renderSize)
        return renderer.image { ctx in
            // Draw text background if present
            if let bgHex = element.textBackground {
                let bgColor = UIColor(hex: bgHex)
                bgColor.setFill()
                let bgRect = CGRect(origin: .zero, size: renderSize)
                UIBezierPath(roundedRect: bgRect, cornerRadius: fontSize * 0.2).fill()
            }

            // Draw text effects
            let drawOrigin = CGPoint(x: padding, y: padding)
            let effect = element.textEffect ?? .none

            switch effect {
            case .neon:
                // 3 shadow layers with decreasing radius and increasing opacity
                let neonColor = textColor
                for (radius, alpha) in [(12.0, 0.4), (6.0, 0.6), (3.0, 0.8)] as [(CGFloat, CGFloat)] {
                    ctx.cgContext.saveGState()
                    ctx.cgContext.setShadow(
                        offset: .zero,
                        blur: radius * max(scale.x, scale.y),
                        color: neonColor.withAlphaComponent(alpha).cgColor
                    )
                    nsText.draw(at: drawOrigin, withAttributes: attributes)
                    ctx.cgContext.restoreGState()
                }
                nsText.draw(at: drawOrigin, withAttributes: attributes)

            case .glow:
                // 2 glow layers
                for (radius, alpha) in [(8.0, 0.5), (4.0, 0.7)] as [(CGFloat, CGFloat)] {
                    ctx.cgContext.saveGState()
                    ctx.cgContext.setShadow(
                        offset: .zero,
                        blur: radius * max(scale.x, scale.y),
                        color: textColor.withAlphaComponent(alpha).cgColor
                    )
                    nsText.draw(at: drawOrigin, withAttributes: attributes)
                    ctx.cgContext.restoreGState()
                }
                nsText.draw(at: drawOrigin, withAttributes: attributes)

            case .shadow:
                // Single offset shadow
                ctx.cgContext.saveGState()
                ctx.cgContext.setShadow(
                    offset: CGSize(width: 2 * max(scale.x, scale.y), height: 2 * max(scale.x, scale.y)),
                    blur: 4 * max(scale.x, scale.y),
                    color: UIColor.black.withAlphaComponent(0.5).cgColor
                )
                nsText.draw(at: drawOrigin, withAttributes: attributes)
                ctx.cgContext.restoreGState()

            case .outline:
                // 9 offset layers for outline, then main text on top
                let offsets: [(CGFloat, CGFloat)] = [
                    (-1, -1), (0, -1), (1, -1),
                    (-1, 0),           (1, 0),
                    (-1, 1),  (0, 1),  (1, 1),
                    (0, 0),
                ]
                let outlineScale = max(scale.x, scale.y)
                let outlineAttrs: [NSAttributedString.Key: Any] = [
                    .font: font,
                    .foregroundColor: UIColor.black,
                    .paragraphStyle: paragraphStyle,
                ]
                for (dx, dy) in offsets.dropLast() {
                    let p = CGPoint(x: drawOrigin.x + dx * outlineScale, y: drawOrigin.y + dy * outlineScale)
                    nsText.draw(at: p, withAttributes: outlineAttrs)
                }
                nsText.draw(at: drawOrigin, withAttributes: attributes)

            case .none:
                nsText.draw(at: drawOrigin, withAttributes: attributes)
            }
        }
    }

    // MARK: - Element Drawing

    private static func drawElement(
        _ element: CanvasElement,
        in context: CGContext,
        scale: CanvasScale
    ) {
        let posX = (element.positionCGPoint.x) * scale.x
        let posY = (element.positionCGPoint.y) * scale.y
        let elementScale = max(element.scale, 0.0001)
        let rotationRadians = element.rotation

        var elementImage: UIImage?
        var drawWidth: CGFloat = 0
        var drawHeight: CGFloat = 0

        if element.type == .text {
            // Text elements get rasterised
            if let rasterised = rasterizeTextElement(element, scale: scale) {
                elementImage = rasterised
                drawWidth = rasterised.size.width
                drawHeight = rasterised.size.height
            }
        } else if let assetPath = element.assetPath {
            // Image-based elements (sticker, stamp, watermark)
            if let img = loadImage(from: assetPath) {
                elementImage = img
                drawWidth = (element.width ?? 100) * scale.x
                drawHeight = (element.height ?? 100) * scale.y
            }
        }

        guard let image = elementImage, drawWidth > 0, drawHeight > 0 else { return }

        let pivotX = drawWidth / 2
        let pivotY = drawHeight / 2

        // Apply element opacity
        let opacity = max(0, min(element.opacity ?? 1, 1))

        context.saveGState()

        // Transform: translate to position+pivot, rotate, scale, translate back
        context.translateBy(x: posX + pivotX, y: posY + pivotY)
        if rotationRadians != 0 {
            context.rotate(by: rotationRadians)
        }
        if elementScale != 1 {
            context.scaleBy(x: elementScale, y: elementScale)
        }
        context.translateBy(x: -pivotX, y: -pivotY)

        context.setAlpha(opacity)

        // Draw the image
        if let cgImage = image.cgImage {
            // UIKit drawing is top-left origin, CGContext is bottom-left — flip
            context.translateBy(x: 0, y: drawHeight)
            context.scaleBy(x: 1, y: -1)
            context.draw(cgImage, in: CGRect(x: 0, y: 0, width: drawWidth, height: drawHeight))
        }

        context.restoreGState()
    }

    // MARK: - Built-in Watermark

    private static func drawBuiltInWatermark(
        in context: CGContext,
        exportSize: CGSize,
        scale: CanvasScale
    ) {
        let scaleFactor = max(scale.x, scale.y)
        let exportFontSize = round(watermarkFontSize * scaleFactor)
        let font = UIFont.systemFont(ofSize: exportFontSize, weight: .medium)
        let paddingScaled = watermarkPadding * scaleFactor

        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: UIColor.white.withAlphaComponent(watermarkOpacity),
        ]

        let nsText = stikaroWatermarkText as NSString
        let textSize = nsText.size(withAttributes: attributes)

        let x = exportSize.width - textSize.width - paddingScaled
        let y = exportSize.height - textSize.height - paddingScaled

        // Push UIKit graphics context for NSString drawing
        context.saveGState()

        // Flip context for text drawing (CGContext is bottom-left, text expects top-left)
        context.translateBy(x: 0, y: exportSize.height)
        context.scaleBy(x: 1, y: -1)

        // In flipped coords, y is measured from top
        let flippedY = exportSize.height - y - textSize.height
        nsText.draw(at: CGPoint(x: x, y: flippedY), withAttributes: attributes)

        context.restoreGState()
    }

    // MARK: - Public API

    /// Renders the canvas at the source image's full resolution.
    ///
    /// Pipeline: load source image → apply CIFilter → draw each element with transforms → add watermark → encode.
    ///
    /// - Returns: The rendered `UIImage`, or `nil` on failure.
    static func exportCanvasToImage(
        sourceImagePath: String,
        sourceImageDimensions: CGSize,
        canvasElements: [CanvasElement],
        format: ExportFormat,
        quality: Int,
        addWatermark: Bool,
        canvasSize: CGSize?,
        filter: ImageFilter?
    ) -> UIImage? {
        let width = sourceImageDimensions.width
        let height = sourceImageDimensions.height
        guard width > 0, height > 0 else { return nil }

        let exportSize = CGSize(width: width, height: height)
        let scale = getCanvasScale(sourceDimensions: sourceImageDimensions, canvasSize: canvasSize)

        // Load source image
        guard let sourceImage = loadImage(from: sourceImagePath) else { return nil }

        // Apply filter
        let filteredSource = applyFilter(to: sourceImage, filter: filter)

        // Render at source resolution
        let renderer = UIGraphicsImageRenderer(size: exportSize)
        let exported = renderer.image { ctx in
            let cgContext = ctx.cgContext

            // Draw source image (filtered)
            if let cgImage = filteredSource.cgImage {
                // Flip for correct orientation
                cgContext.saveGState()
                cgContext.translateBy(x: 0, y: height)
                cgContext.scaleBy(x: 1, y: -1)
                cgContext.draw(cgImage, in: CGRect(origin: .zero, size: exportSize))
                cgContext.restoreGState()
            }

            // Draw all canvas elements
            for element in canvasElements {
                drawElement(element, in: cgContext, scale: scale)
            }

            // Draw built-in "Stikaro" watermark
            if addWatermark {
                drawBuiltInWatermark(in: cgContext, exportSize: exportSize, scale: scale)
            }
        }

        return exported
    }

    /// Convenience that returns encoded data and a file path in the temp directory.
    static func exportToFile(
        sourceImagePath: String,
        sourceImageDimensions: CGSize,
        canvasElements: [CanvasElement],
        format: ExportFormat,
        quality: Int,
        addWatermark: Bool,
        canvasSize: CGSize?,
        filter: ImageFilter?
    ) -> (url: URL, data: Data)? {
        guard let image = exportCanvasToImage(
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: sourceImageDimensions,
            canvasElements: canvasElements,
            format: format,
            quality: quality,
            addWatermark: addWatermark,
            canvasSize: canvasSize,
            filter: filter
        ) else { return nil }

        let data: Data?
        let ext: String

        switch format {
        case .png:
            data = image.pngData()
            ext = "png"
        case .jpg:
            data = image.jpegData(compressionQuality: CGFloat(quality) / 100.0)
            ext = "jpg"
        }

        guard let encoded = data else { return nil }

        let filename = "stikaro_export_\(Int(Date().timeIntervalSince1970 * 1000)).\(ext)"
        let url = tempDirectory.appendingPathComponent(filename)

        do {
            try encoded.write(to: url)
            return (url, encoded)
        } catch {
            return nil
        }
    }

    /// Renders the full canvas and returns a `UIImage` suitable for saving to Photos
    /// or sharing. This is the simplified API used by `ExportModal`.
    static func render(
        sourceImagePath: String,
        sourceImageDimensions: CGSize,
        canvasElements: [CanvasElement],
        canvasSize: CGSize?,
        format: ExportFormat,
        quality: Int,
        filter: ImageFilter?
    ) -> UIImage? {
        exportCanvasToImage(
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: sourceImageDimensions,
            canvasElements: canvasElements,
            format: format,
            quality: quality,
            addWatermark: true,
            canvasSize: canvasSize,
            filter: filter
        )
    }

    // MARK: - Thumbnail Generation

    /// Generates a thumbnail at a reduced resolution (default 300px width).
    static func generateThumbnail(
        sourceImagePath: String,
        sourceImageDimensions: CGSize,
        canvasElements: [CanvasElement],
        canvasSize: CGSize?,
        filter: ImageFilter?,
        thumbnailWidth: CGFloat = 300,
        projectId: String? = nil
    ) -> String? {
        guard sourceImageDimensions.width > 0 else { return nil }

        let aspectRatio = sourceImageDimensions.height / sourceImageDimensions.width
        let scaledDimensions = CGSize(
            width: round(thumbnailWidth),
            height: round(thumbnailWidth * aspectRatio)
        )

        guard let image = exportCanvasToImage(
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: scaledDimensions,
            canvasElements: canvasElements,
            format: .jpg,
            quality: 80,
            addWatermark: false,
            canvasSize: canvasSize,
            filter: filter
        ) else { return nil }

        guard let jpegData = image.jpegData(compressionQuality: 0.8) else { return nil }

        let filename: String
        if let pid = projectId {
            filename = "thumbnail_\(pid).jpg"
        } else {
            filename = "thumbnail_\(Int(Date().timeIntervalSince1970 * 1000)).jpg"
        }

        let url = thumbnailDirectory.appendingPathComponent(filename)

        do {
            try jpegData.write(to: url)
            return url.path
        } catch {
            return nil
        }
    }
}

// MARK: - UIColor hex initialiser (internal helper)

private extension UIColor {
    convenience init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
        var hexValue: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&hexValue)

        let r, g, b, a: CGFloat
        switch cleaned.count {
        case 6:
            r = CGFloat((hexValue >> 16) & 0xFF) / 255
            g = CGFloat((hexValue >> 8) & 0xFF) / 255
            b = CGFloat(hexValue & 0xFF) / 255
            a = 1
        case 8:
            r = CGFloat((hexValue >> 24) & 0xFF) / 255
            g = CGFloat((hexValue >> 16) & 0xFF) / 255
            b = CGFloat((hexValue >> 8) & 0xFF) / 255
            a = CGFloat(hexValue & 0xFF) / 255
        default:
            r = 1; g = 1; b = 1; a = 1
        }

        self.init(red: r, green: g, blue: b, alpha: a)
    }
}
