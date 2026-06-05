import Foundation

// MARK: - FilterType

enum FilterType: String, Codable, CaseIterable {
    case none
    case bw
    case sepia
    case vintage
    case cool
    case warm
    case cinematic
    case film
    case hdr
    case portrait
    case landscape
    case neon
    case cyberpunk
    case retro
    case juno
    case gingham
    case clarendon
    case lark
    case ludwig
    case xproii
    case lofi
    case mayfair
    case sierra
    case tattoo
    case inkwell
    case rise
}

// MARK: - ImageFilter

struct ImageFilter: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var intensity: Double
    var type: FilterType

    init(id: String = UUID().uuidString, name: String, intensity: Double = 1.0, type: FilterType) {
        self.id = id
        self.name = name
        self.intensity = intensity
        self.type = type
    }
}
