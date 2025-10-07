// Project database using MMKV for local storage

import { MMKV } from 'react-native-mmkv';
import { Project, SerializedElement } from '../types';

// MMKV storage instance for projects
const projectStorage = new MMKV({
  id: 'artifex-projects',
  encryptionKey: 'artifex-projects-key',
});

// Metadata storage for project list
const metadataStorage = new MMKV({
  id: 'artifex-metadata',
  encryptionKey: 'artifex-metadata-key',
});

export class ProjectDatabase {
  // Save or update a project
  static async save(project: Project): Promise<void> {
    try {
      // Save project data
      const projectData = {
        ...project,
        updatedAt: new Date(),
      };

      projectStorage.set(project.id, JSON.stringify(projectData));

      // Update project list metadata
      await this.updateProjectList(project.id);

      console.log('Project saved:', project.id);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }

  // Get project by ID
  static async getById(id: string): Promise<Project | null> {
    try {
      const projectData = projectStorage.getString(id);
      if (!projectData) return null;

      const project = JSON.parse(projectData);

      // Convert date strings back to Date objects
      project.createdAt = new Date(project.createdAt);
      project.updatedAt = new Date(project.updatedAt);

      return project;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  // Get all projects (metadata only for performance)
  static async getAll(): Promise<Project[]> {
    try {
      const projectIds = this.getProjectIds();
      const projects: Project[] = [];

      for (const id of projectIds) {
        const project = await this.getById(id);
        if (project) {
          projects.push(project);
        }
      }

      // Sort by updatedAt descending (newest first)
      return projects.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    } catch (error) {
      console.error('Failed to get all projects:', error);
      return [];
    }
  }

  // Delete project by ID
  static async delete(id: string): Promise<void> {
    try {
      // Remove project data
      projectStorage.delete(id);

      // Update project list
      const projectIds = this.getProjectIds().filter(
        projectId => projectId !== id,
      );
      metadataStorage.set('projectIds', JSON.stringify(projectIds));

      console.log('Project deleted:', id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project');
    }
  }

  // Delete multiple projects
  static async deleteMultiple(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        projectStorage.delete(id);
      }

      // Update project list
      const projectIds = this.getProjectIds().filter(id => !ids.includes(id));
      metadataStorage.set('projectIds', JSON.stringify(projectIds));

      console.log('Projects deleted:', ids);
    } catch (error) {
      console.error('Failed to delete projects:', error);
      throw new Error('Failed to delete projects');
    }
  }

  // Duplicate a project
  static async duplicate(id: string): Promise<Project | null> {
    try {
      const originalProject = await this.getById(id);
      if (!originalProject) return null;

      const newProject: Project = {
        ...originalProject,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.save(newProject);
      return newProject;
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      return null;
    }
  }

  // Create new project
  static async create(
    sourceImagePath: string,
    sourceImageDimensions: { width: number; height: number },
    thumbnailPath?: string,
  ): Promise<Project> {
    const project: Project = {
      id: this.generateId(),
      sourceImagePath,
      sourceImageDimensions,
      thumbnailPath: thumbnailPath || '',
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.save(project);
    return project;
  }

  // Update project elements
  static async updateElements(
    id: string,
    elements: SerializedElement[],
  ): Promise<void> {
    try {
      const project = await this.getById(id);
      if (!project) throw new Error('Project not found');

      project.elements = elements;
      await this.save(project);
    } catch (error) {
      console.error('Failed to update project elements:', error);
      throw new Error('Failed to update project elements');
    }
  }

  // Get project count
  static getProjectCount(): number {
    return this.getProjectIds().length;
  }

  // Clear all projects (for debugging/reset)
  static async clearAll(): Promise<void> {
    try {
      projectStorage.clearAll();
      metadataStorage.clearAll();
      console.log('All projects cleared');
    } catch (error) {
      console.error('Failed to clear projects:', error);
      throw new Error('Failed to clear projects');
    }
  }

  // Private helper methods
  private static getProjectIds(): string[] {
    try {
      const idsData = metadataStorage.getString('projectIds');
      return idsData ? JSON.parse(idsData) : [];
    } catch (error) {
      console.error('Failed to get project IDs:', error);
      return [];
    }
  }

  private static async updateProjectList(projectId: string): Promise<void> {
    try {
      const projectIds = this.getProjectIds();
      if (!projectIds.includes(projectId)) {
        projectIds.push(projectId);
        metadataStorage.set('projectIds', JSON.stringify(projectIds));
      }
    } catch (error) {
      console.error('Failed to update project list:', error);
    }
  }

  private static generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export/Import functionality for backup
  static async exportAllProjects(): Promise<string> {
    try {
      const projects = await this.getAll();
      return JSON.stringify(projects, null, 2);
    } catch (error) {
      console.error('Failed to export projects:', error);
      throw new Error('Failed to export projects');
    }
  }

  static async importProjects(projectsJson: string): Promise<number> {
    try {
      const projects: Project[] = JSON.parse(projectsJson);
      let importedCount = 0;

      for (const project of projects) {
        // Generate new ID to avoid conflicts
        project.id = this.generateId();
        project.createdAt = new Date(project.createdAt);
        project.updatedAt = new Date(project.updatedAt);

        await this.save(project);
        importedCount++;
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import projects:', error);
      throw new Error('Failed to import projects');
    }
  }
}
