import Foundation
import CoreGraphics

actor ProjectDatabase {
    static let shared = ProjectDatabase()

    private let fileManager = FileManager.default
    private let projectPrefix = "stikaro_project_"
    private let metadataFilename = "stikaro_project_ids.json"

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        return e
    }()

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    private var documentsURL: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private func projectFileURL(id: String) -> URL {
        documentsURL.appendingPathComponent("\(projectPrefix)\(id).json")
    }

    private var metadataURL: URL {
        documentsURL.appendingPathComponent(metadataFilename)
    }

    // MARK: - CRUD

    func save(_ project: Project) throws {
        var p = project
        p.updatedAt = Date()
        let data = try encoder.encode(p)
        try data.write(to: projectFileURL(id: p.id), options: .atomic)
        try updateProjectList(p.id)
    }

    func getById(_ id: String) -> Project? {
        let url = projectFileURL(id: id)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? decoder.decode(Project.self, from: data)
    }

    func getAll() -> [Project] {
        let ids = getProjectIds()
        var projects: [Project] = []
        for id in ids {
            if let project = getById(id) {
                projects.append(project)
            }
        }
        return projects.sorted { $0.updatedAt > $1.updatedAt }
    }

    func delete(_ id: String) throws {
        let url = projectFileURL(id: id)
        if fileManager.fileExists(atPath: url.path) {
            try fileManager.removeItem(at: url)
        }
        var ids = getProjectIds()
        ids.removeAll { $0 == id }
        try saveProjectIds(ids)
    }

    func deleteMultiple(_ ids: [String]) throws {
        for id in ids {
            let url = projectFileURL(id: id)
            if fileManager.fileExists(atPath: url.path) {
                try fileManager.removeItem(at: url)
            }
        }
        let idsSet = Set(ids)
        var currentIds = getProjectIds()
        currentIds.removeAll { idsSet.contains($0) }
        try saveProjectIds(currentIds)
    }

    func duplicate(_ id: String) throws -> Project? {
        guard let original = getById(id) else { return nil }
        let newProject = Project(
            id: generateId(),
            sourceImagePath: original.sourceImagePath,
            sourceImageDimensions: original.sourceImageDimensionsCGSize,
            canvasSize: original.canvasSizeCGSize,
            thumbnailPath: original.thumbnailPath,
            elements: original.elements,
            createdAt: Date(),
            updatedAt: Date()
        )
        try save(newProject)
        return newProject
    }

    func create(sourceImagePath: String, sourceImageDimensions: CGSize, thumbnailPath: String? = nil) throws -> Project {
        let project = Project(
            id: generateId(),
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: sourceImageDimensions,
            thumbnailPath: thumbnailPath ?? "",
            createdAt: Date(),
            updatedAt: Date()
        )
        try save(project)
        return project
    }

    func updateElements(id: String, elements: [SerializedElement]) throws {
        guard var project = getById(id) else { return }
        project.elements = elements
        try save(project)
    }

    func getProjectCount() -> Int {
        getProjectIds().count
    }

    func clearAll() throws {
        let ids = getProjectIds()
        for id in ids {
            let url = projectFileURL(id: id)
            if fileManager.fileExists(atPath: url.path) {
                try fileManager.removeItem(at: url)
            }
        }
        try saveProjectIds([])
    }

    func exportAllProjects() throws -> String {
        let projects = getAll()
        let data = try encoder.encode(projects)
        return String(data: data, encoding: .utf8) ?? "[]"
    }

    func importProjects(_ json: String) throws -> Int {
        guard let data = json.data(using: .utf8) else { return 0 }
        let projects = try decoder.decode([Project].self, from: data)
        var count = 0
        for var project in projects {
            project = Project(
                id: generateId(),
                sourceImagePath: project.sourceImagePath,
                sourceImageDimensions: project.sourceImageDimensionsCGSize,
                canvasSize: project.canvasSizeCGSize,
                thumbnailPath: project.thumbnailPath,
                elements: project.elements,
                createdAt: project.createdAt,
                updatedAt: Date()
            )
            try save(project)
            count += 1
        }
        return count
    }

    // MARK: - Private Helpers

    private func getProjectIds() -> [String] {
        guard let data = try? Data(contentsOf: metadataURL),
              let ids = try? JSONDecoder().decode([String].self, from: data) else {
            return []
        }
        return ids
    }

    private func saveProjectIds(_ ids: [String]) throws {
        let data = try JSONEncoder().encode(ids)
        try data.write(to: metadataURL, options: .atomic)
    }

    private func updateProjectList(_ projectId: String) throws {
        var ids = getProjectIds()
        if !ids.contains(projectId) {
            ids.append(projectId)
            try saveProjectIds(ids)
        }
    }

    private func generateId() -> String {
        "project_\(Int(Date().timeIntervalSince1970))_\(UUID().uuidString.prefix(9).lowercased())"
    }
}
