import Foundation
import CoreGraphics

/// Factory functions for creating canvas elements with sensible defaults.
enum CanvasElementFactory {

    private static func generateId() -> String {
        let timestamp = String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
        let random = String(Int.random(in: 0..<Int(1e9)), radix: 36)
        return timestamp + random
    }

    static func createTextElement(
        text: String,
        fontFamily: String,
        fontSize: CGFloat,
        color: String,
        x: CGFloat = 0,
        y: CGFloat = 0,
        textEffect: TextEffect = .none,
        textBackground: String? = nil
    ) -> CanvasElement {
        CanvasElement(
            id: generateId(),
            type: .text,
            position: CGPoint(x: x, y: y),
            scale: 1,
            rotation: 0,
            width: 200,
            height: fontSize * 1.5,
            opacity: 1,
            textContent: text,
            fontFamily: fontFamily,
            fontSize: fontSize,
            color: color,
            textEffect: textEffect,
            textBackground: textBackground
        )
    }

    static func createStickerElement(
        assetPath: String,
        x: CGFloat = 0,
        y: CGFloat = 0,
        width: CGFloat = 100,
        height: CGFloat = 100
    ) -> CanvasElement {
        CanvasElement(
            id: generateId(),
            type: .sticker,
            position: CGPoint(x: x, y: y),
            scale: 1,
            rotation: 0,
            width: width,
            height: height,
            opacity: 1,
            assetPath: assetPath
        )
    }

    static func createWatermarkElement(
        assetPath: String,
        x: CGFloat = 0,
        y: CGFloat = 0,
        width: CGFloat = 150,
        height: CGFloat = 50
    ) -> CanvasElement {
        CanvasElement(
            id: generateId(),
            type: .watermark,
            position: CGPoint(x: x, y: y),
            scale: 1,
            rotation: 0,
            width: width,
            height: height,
            opacity: 1,
            assetPath: assetPath
        )
    }

    static func createStampElement(
        assetPath: String,
        x: CGFloat = 0,
        y: CGFloat = 0,
        width: CGFloat = 80,
        height: CGFloat = 80
    ) -> CanvasElement {
        CanvasElement(
            id: generateId(),
            type: .stamp,
            position: CGPoint(x: x, y: y),
            scale: 1,
            rotation: 0,
            width: width,
            height: height,
            opacity: 1,
            assetPath: assetPath
        )
    }
}
