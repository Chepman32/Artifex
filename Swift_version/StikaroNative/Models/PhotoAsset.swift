import Foundation
import CoreGraphics

struct PhotoAsset: Identifiable {
    let id: String
    var uri: String
    var filename: String
    var width: CGFloat
    var height: CGFloat
    var timestamp: Date

    init(id: String = UUID().uuidString, uri: String, filename: String = "",
         width: CGFloat = 0, height: CGFloat = 0, timestamp: Date = Date()) {
        self.id = id
        self.uri = uri
        self.filename = filename
        self.width = width
        self.height = height
        self.timestamp = timestamp
    }
}

struct Album {
    var title: String
    var count: Int
    var assets: [PhotoAsset]
}
