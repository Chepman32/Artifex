import Foundation

// MARK: - HistoryAction

enum HistoryAction: String, Codable {
    case add
    case update
    case delete
    case batchAdd
    case filter
    case reorder
}

// MARK: - EditorHistory

struct EditorHistory {
    var action: HistoryAction
    var element: CanvasElement?
    var elements: [CanvasElement]?
    var elementId: String?
    var oldState: HistoryState?
    var newState: HistoryState?
    var oldFilter: ImageFilter?
    var newFilter: ImageFilter?
    var timestamp: TimeInterval

    init(
        action: HistoryAction,
        element: CanvasElement? = nil,
        elements: [CanvasElement]? = nil,
        elementId: String? = nil,
        oldState: HistoryState? = nil,
        newState: HistoryState? = nil,
        oldFilter: ImageFilter? = nil,
        newFilter: ImageFilter? = nil,
        timestamp: TimeInterval = Date().timeIntervalSince1970
    ) {
        self.action = action
        self.element = element
        self.elements = elements
        self.elementId = elementId
        self.oldState = oldState
        self.newState = newState
        self.oldFilter = oldFilter
        self.newFilter = newFilter
        self.timestamp = timestamp
    }
}

// MARK: - HistoryState

enum HistoryState {
    case element(CanvasElement)
    case canvasElements([CanvasElement])
}
