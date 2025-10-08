// Editor state management for canvas operations

import { create } from 'zustand';
import {
  CanvasElement,
  EditorHistory,
  ExportOptions,
  ImageFilter,
} from '../types';
import { ProjectDatabase } from '../database/ProjectDatabase';

interface EditorState {
  canvasElements: CanvasElement[];
  selectedElementId: string | null;
  history: EditorHistory[];
  historyIndex: number;
  currentProjectId: string | null;
  sourceImagePath: string | null;
  sourceImageDimensions: { width: number; height: number } | null;
  appliedFilter: ImageFilter | null;

  // Element manipulation
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  deselectElement: () => void;

  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Filter management
  applyFilter: (filter: ImageFilter) => void;
  removeFilter: () => void;

  // Project management
  loadProject: (projectId: string) => Promise<void>;
  saveProject: () => Promise<void>;
  exportProject: (options: ExportOptions) => Promise<string>;

  // Initialize new project
  initializeProject: (
    imageUri: string,
    dimensions: { width: number; height: number },
  ) => void;

  // Reset
  reset: () => void;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const applyReverseAction = (action: EditorHistory, set: any, get: any) => {
  const { canvasElements } = get();

  switch (action.action) {
    case 'add':
      if (action.element) {
        const newElements = canvasElements.filter(
          (el: CanvasElement) => el.id !== action.element!.id,
        );
        set({ canvasElements: newElements, selectedElementId: null });
      }
      break;
    case 'delete':
      if (action.element) {
        const newElements = [
          ...canvasElements,
          action.element as CanvasElement,
        ];
        set({ canvasElements: newElements });
      }
      break;
    case 'update':
      if (action.elementId && action.oldState) {
        const index = canvasElements.findIndex(
          (el: CanvasElement) => el.id === action.elementId,
        );
        if (index !== -1) {
          const newElements = [...canvasElements];

          newElements[index] = { ...newElements[index], ...action.oldState };
          set({ canvasElements: newElements });
        }
      }
      break;
  }
};

const applyAction = (action: EditorHistory, set: any, get: any) => {
  const { canvasElements } = get();

  switch (action.action) {
    case 'add':
      if (action.element) {
        const newElements = [
          ...canvasElements,
          action.element as CanvasElement,
        ];
        set({
          canvasElements: newElements,
          selectedElementId: action.element.id,
        });
      }
      break;
    case 'delete':
      if (action.element) {
        const newElements = canvasElements.filter(
          (el: CanvasElement) => el.id !== action.element!.id,
        );
        set({ canvasElements: newElements, selectedElementId: null });
      }
      break;
    case 'update':
      if (action.elementId && action.newState) {
        const index = canvasElements.findIndex(
          (el: CanvasElement) => el.id === action.elementId,
        );
        if (index !== -1) {
          const newElements = [...canvasElements];
          newElements[index] = { ...newElements[index], ...action.newState };
          set({ canvasElements: newElements });
        }
      }
      break;
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  canvasElements: [],
  selectedElementId: null,
  history: [],
  historyIndex: -1,
  currentProjectId: null,
  sourceImagePath: null,
  sourceImageDimensions: null,
  appliedFilter: null,

  addElement: element => {
    const { canvasElements, history, historyIndex } = get();
    const newElements = [...canvasElements, element];

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'add',
      element: element,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      selectedElementId: element.id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateElement: (id, updates) => {
    const { canvasElements, history, historyIndex } = get();
    const index = canvasElements.findIndex(el => el.id === id);
    if (index === -1) return;

    const oldElement = canvasElements[index];
    const newElement = { ...oldElement, ...updates };
    const newElements = [...canvasElements];
    newElements[index] = newElement;

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'update',
      elementId: id,
      oldState: oldElement,
      newState: newElement,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  deleteElement: id => {
    const { canvasElements, history, historyIndex } = get();
    const element = canvasElements.find(el => el.id === id);
    if (!element) return;

    const newElements = canvasElements.filter(el => el.id !== id);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'delete',
      element: element,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  selectElement: id => set({ selectedElementId: id }),
  deselectElement: () => set({ selectedElementId: null }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;

    const action = history[historyIndex];

    applyReverseAction(action, set, get);

    set({ historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const action = history[historyIndex + 1];
    applyAction(action, set, get);

    set({ historyIndex: historyIndex + 1 });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  loadProject: async projectId => {
    try {
      const project = await ProjectDatabase.getById(projectId);
      if (!project) return;

      set({
        canvasElements: project.elements as CanvasElement[],
        selectedElementId: null,
        history: [],
        historyIndex: -1,
        currentProjectId: projectId,
        sourceImagePath: project.sourceImagePath,
        sourceImageDimensions: project.sourceImageDimensions,
      });
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  },

  saveProject: async () => {
    const {
      canvasElements,
      currentProjectId,
      sourceImagePath,
      sourceImageDimensions,
    } = get();
    if (!currentProjectId || !sourceImagePath || !sourceImageDimensions) return;

    const project = {
      id: currentProjectId,
      sourceImagePath,
      sourceImageDimensions,
      thumbnailPath: '', // Will be generated
      elements: canvasElements,
      createdAt: new Date(), // Will be preserved if existing
      updatedAt: new Date(),
    };

    try {
      await ProjectDatabase.save(project);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  },

  exportProject: async options => {
    // This will be implemented with the ImageExporter
    // For now, return a placeholder
    return Promise.resolve('exported-image-path');
  },

  initializeProject: (imageUri, dimensions) => {
    const projectId = generateId();
    set({
      currentProjectId: projectId,
      sourceImagePath: imageUri,
      sourceImageDimensions: dimensions,
      canvasElements: [],
      selectedElementId: null,
      history: [],
      historyIndex: -1,
    });
  },

  applyFilter: (filter: ImageFilter) => {
    set({ appliedFilter: filter });
  },

  removeFilter: () => {
    set({ appliedFilter: null });
  },

  reset: () =>
    set({
      canvasElements: [],
      selectedElementId: null,
      history: [],
      historyIndex: -1,
      currentProjectId: null,
      sourceImagePath: null,
      sourceImageDimensions: null,
      appliedFilter: null,
    }),
}));
