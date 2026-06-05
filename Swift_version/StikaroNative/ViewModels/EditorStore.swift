import SwiftUI
import Observation

@Observable
final class EditorStore {
    var canvasElements: [CanvasElement] = []
    var selectedElementId: String?
    var selectedElementIds: [String] = []
    var history: [EditorHistory] = []
    var historyIndex: Int = -1
    var currentProjectId: String?
    var sourceImagePath: String?
    var sourceImageDimensions: CGSize?
    var canvasSize: CGSize?
    var appliedFilter: ImageFilter?
    var initialCanvasElements: [CanvasElement] = []
    var initialAppliedFilter: ImageFilter?

    // MARK: - Element Manipulation

    func addElement(_ element: CanvasElement) {
        canvasElements.append(element)

        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(action: .add, element: element)]
        historyIndex = history.count - 1

        selectedElementId = element.id
        selectedElementIds = [element.id]
    }

    func addElements(_ elements: [CanvasElement]) {
        guard !elements.isEmpty else { return }
        canvasElements.append(contentsOf: elements)

        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(action: .batchAdd, elements: elements)]
        historyIndex = history.count - 1

        let lastId = elements.last!.id
        selectedElementId = lastId
        selectedElementIds = [lastId]
    }

    func updateElement(id: String, updates: (inout CanvasElement) -> Void) {
        guard let index = canvasElements.firstIndex(where: { $0.id == id }) else { return }

        let oldElement = canvasElements[index]
        var newElement = oldElement
        updates(&newElement)
        canvasElements[index] = newElement

        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(
            action: .update,
            elementId: id,
            oldState: .element(oldElement),
            newState: .element(newElement)
        )]
        historyIndex = history.count - 1
    }

    func updateElementWithoutHistory(id: String, updates: (inout CanvasElement) -> Void) {
        guard let index = canvasElements.firstIndex(where: { $0.id == id }) else { return }
        updates(&canvasElements[index])
    }

    func deleteElement(id: String) {
        guard let element = canvasElements.first(where: { $0.id == id }) else { return }
        canvasElements.removeAll { $0.id == id }

        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(action: .delete, element: element)]
        historyIndex = history.count - 1

        selectedElementId = nil
        selectedElementIds = []
    }

    func selectElement(_ id: String?) {
        selectedElementId = id
        selectedElementIds = id.map { [$0] } ?? []
    }

    func deselectElement() {
        selectedElementId = nil
        selectedElementIds = []
    }

    func selectAllElements() {
        if canvasElements.isEmpty {
            selectedElementId = nil
            selectedElementIds = []
            return
        }
        selectedElementId = nil
        selectedElementIds = canvasElements.map(\.id)
    }

    // MARK: - Layer Management

    func moveElementUp(id: String) {
        guard let currentIndex = canvasElements.firstIndex(where: { $0.id == id }),
              currentIndex < canvasElements.count - 1 else { return }

        let oldElements = canvasElements
        let element = canvasElements.remove(at: currentIndex)
        canvasElements.insert(element, at: currentIndex + 1)

        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(
            action: .reorder,
            oldState: .canvasElements(oldElements),
            newState: .canvasElements(canvasElements)
        )]
        historyIndex = history.count - 1
    }

    func moveElementDown(id: String) {
        guard let currentIndex = canvasElements.firstIndex(where: { $0.id == id }),
              currentIndex > 0 else { return }

        let oldElements = canvasElements
        let element = canvasElements.remove(at: currentIndex)
        canvasElements.insert(element, at: currentIndex - 1)

        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(
            action: .reorder,
            oldState: .canvasElements(oldElements),
            newState: .canvasElements(canvasElements)
        )]
        historyIndex = history.count - 1
    }

    // MARK: - Undo / Redo

    var canUndo: Bool { historyIndex >= 0 }
    var canRedo: Bool { historyIndex < history.count - 1 }

    func undo() {
        guard historyIndex >= 0 else { return }
        let action = history[historyIndex]
        applyReverseAction(action)
        historyIndex -= 1
    }

    func redo() {
        guard historyIndex < history.count - 1 else { return }
        let action = history[historyIndex + 1]
        applyAction(action)
        historyIndex += 1
    }

    private func applyReverseAction(_ entry: EditorHistory) {
        switch entry.action {
        case .add:
            if let element = entry.element {
                canvasElements.removeAll { $0.id == element.id }
                selectedElementId = nil
                selectedElementIds = []
            }
        case .batchAdd:
            if let elements = entry.elements {
                let ids = Set(elements.map(\.id))
                canvasElements.removeAll { ids.contains($0.id) }
                selectedElementId = nil
                selectedElementIds = []
            }
        case .delete:
            if let element = entry.element {
                canvasElements.append(element)
            }
        case .update:
            if let elementId = entry.elementId, case .element(let oldElement) = entry.oldState {
                if let index = canvasElements.firstIndex(where: { $0.id == elementId }) {
                    canvasElements[index] = oldElement
                }
            }
        case .filter:
            appliedFilter = entry.oldFilter
        case .reorder:
            if case .canvasElements(let oldElements) = entry.oldState {
                canvasElements = oldElements
            }
        }
    }

    private func applyAction(_ entry: EditorHistory) {
        switch entry.action {
        case .add:
            if let element = entry.element {
                canvasElements.append(element)
                selectedElementId = element.id
                selectedElementIds = [element.id]
            }
        case .batchAdd:
            if let elements = entry.elements {
                canvasElements.append(contentsOf: elements)
                if let lastId = elements.last?.id {
                    selectedElementId = lastId
                    selectedElementIds = [lastId]
                }
            }
        case .delete:
            if let element = entry.element {
                canvasElements.removeAll { $0.id == element.id }
                selectedElementId = nil
                selectedElementIds = []
            }
        case .update:
            if let elementId = entry.elementId, case .element(let newElement) = entry.newState {
                if let index = canvasElements.firstIndex(where: { $0.id == elementId }) {
                    canvasElements[index] = newElement
                }
            }
        case .filter:
            appliedFilter = entry.newFilter
        case .reorder:
            if case .canvasElements(let newElements) = entry.newState {
                canvasElements = newElements
            }
        }
    }

    // MARK: - Filter Management

    func applyFilter(_ filter: ImageFilter) {
        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(
            action: .filter,
            oldFilter: appliedFilter,
            newFilter: filter
        )]
        historyIndex = history.count - 1
        appliedFilter = filter
    }

    func removeFilter() {
        let newHistory = Array(history.prefix(historyIndex + 1))
        history = newHistory + [EditorHistory(
            action: .filter,
            oldFilter: appliedFilter,
            newFilter: nil
        )]
        historyIndex = history.count - 1
        appliedFilter = nil
    }

    // MARK: - Project Management

    func loadProject(_ projectId: String) async {
        guard let project = await ProjectDatabase.shared.getById(projectId) else { return }

        let elements = project.elements.map { serialized in
            CanvasElement(from: serialized, canvasSize: project.canvasSizeCGSize ?? project.sourceImageDimensionsCGSize)
        }

        canvasElements = elements
        initialCanvasElements = elements
        initialAppliedFilter = nil
        appliedFilter = nil
        selectedElementId = nil
        selectedElementIds = []
        history = []
        historyIndex = -1
        currentProjectId = projectId
        sourceImagePath = project.sourceImagePath
        sourceImageDimensions = project.sourceImageDimensionsCGSize
        canvasSize = project.canvasSizeCGSize
    }

    func saveProject(canvasSize: CGSize? = nil) async {
        guard let projectId = currentProjectId,
              let imagePath = sourceImagePath,
              let imageDimensions = sourceImageDimensions else { return }

        let cs = canvasSize ?? self.canvasSize
        let serializedElements = canvasElements.map { element in
            element.toSerializedElement(canvasSize: cs ?? imageDimensions)
        }

        let project = Project(
            id: projectId,
            sourceImagePath: imagePath,
            sourceImageDimensions: imageDimensions,
            canvasSize: cs,
            thumbnailPath: imagePath, // TODO: generate thumbnail
            elements: serializedElements,
            createdAt: Date(),
            updatedAt: Date()
        )

        try? await ProjectDatabase.shared.save(project)
        initialCanvasElements = canvasElements
        initialAppliedFilter = appliedFilter
    }

    func initializeProject(imageUri: String, dimensions: CGSize) {
        let projectId = UUID().uuidString

        currentProjectId = projectId
        sourceImagePath = imageUri
        sourceImageDimensions = dimensions
        canvasSize = nil
        canvasElements = []
        initialCanvasElements = []
        initialAppliedFilter = nil
        selectedElementId = nil
        selectedElementIds = []
        history = []
        historyIndex = -1
        appliedFilter = nil

        let project = Project(
            id: projectId,
            sourceImagePath: imageUri,
            sourceImageDimensions: dimensions,
            thumbnailPath: imageUri
        )

        Task {
            try? await ProjectDatabase.shared.save(project)
        }
    }

    // MARK: - Change Detection

    func hasChanges() -> Bool {
        canvasElements != initialCanvasElements || appliedFilter != initialAppliedFilter
    }

    // MARK: - Reset

    func reset() {
        canvasElements = []
        initialCanvasElements = []
        initialAppliedFilter = nil
        selectedElementId = nil
        selectedElementIds = []
        history = []
        historyIndex = -1
        currentProjectId = nil
        sourceImagePath = nil
        sourceImageDimensions = nil
        canvasSize = nil
        appliedFilter = nil
    }
}
