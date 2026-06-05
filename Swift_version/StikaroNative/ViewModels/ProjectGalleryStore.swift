import SwiftUI
import Observation

@Observable
final class ProjectGalleryStore {

    enum SortOrder: String {
        case newest
        case oldest
        case alphabetical
    }

    var projects: [Project] = []
    var selectionMode: Bool = false
    var selectedIds: Set<String> = []
    var sortOrder: SortOrder = .newest
    var isLoading: Bool = false

    // MARK: - Actions

    func loadProjects() async {
        isLoading = true
        let loaded = await ProjectDatabase.shared.getAll()
        projects = Self.sortProjects(loaded, order: sortOrder)
        isLoading = false
    }

    func addProject(_ project: Project) {
        projects.insert(project, at: 0)
    }

    func deleteProjects(ids: [String]) async {
        try? await ProjectDatabase.shared.deleteMultiple(ids)
        projects.removeAll { ids.contains($0.id) }
        selectedIds = []
        selectionMode = false
    }

    func duplicateProject(id: String) async {
        guard let original = projects.first(where: { $0.id == id }) else { return }
        let duplicate = Project(
            id: UUID().uuidString,
            sourceImagePath: original.sourceImagePath,
            sourceImageDimensions: original.sourceImageDimensionsCGSize,
            canvasSize: original.canvasSizeCGSize,
            thumbnailPath: original.thumbnailPath,
            elements: original.elements,
            createdAt: Date(),
            updatedAt: Date()
        )
        try? await ProjectDatabase.shared.save(duplicate)
        projects.insert(duplicate, at: 0)
    }

    func enterSelectionMode() {
        selectionMode = true
    }

    func exitSelectionMode() {
        selectionMode = false
        selectedIds = []
    }

    func toggleSelection(id: String) {
        if selectedIds.contains(id) {
            selectedIds.remove(id)
        } else {
            selectedIds.insert(id)
        }
    }

    func setSortOrder(_ order: SortOrder) {
        sortOrder = order
        projects = Self.sortProjects(projects, order: order)
    }

    // MARK: - Sorting Helper

    private static func sortProjects(_ projects: [Project], order: SortOrder) -> [Project] {
        switch order {
        case .newest:
            return projects.sorted { $0.updatedAt > $1.updatedAt }
        case .oldest:
            return projects.sorted { $0.updatedAt < $1.updatedAt }
        case .alphabetical:
            return projects.sorted { $0.id.localizedCompare($1.id) == .orderedAscending }
        }
    }
}
