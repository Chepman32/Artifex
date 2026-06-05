import Foundation
import CoreGraphics

struct ExportOptions {
    var format: ExportFormat = .png
    var quality: Int = 100
    var addWatermark: Bool = true
    var canvasSize: CGSize?
}
