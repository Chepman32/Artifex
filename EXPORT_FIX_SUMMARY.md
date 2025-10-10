# Export Image Size/Position Fix

## Problem

Stamps and stickers appeared large in the editor but were rendered small and in incorrect positions in the exported image.

## Root Cause

Canvas elements (stamps, stickers, etc.) store their dimensions and positions in **absolute canvas coordinates** (e.g., 80px width at position 200,300). However, the canvas display size varies based on screen size and device orientation.

When exporting:

1. Elements are stored with dimensions from the original canvas size (e.g., 400x600px)
2. If the project is loaded on a different device or the canvas size changes, the export uses the CURRENT canvas size
3. This causes incorrect scaling calculations: `scale = sourceImageSize / currentCanvasSize`
4. The scale should be: `scale = sourceImageSize / originalCanvasSize`

## Solution

Store the canvas size when elements are created/modified, and use that stored size during export.

### Changes Made

1. **Updated Project Type** (`src/types/index.ts`)

   - Added optional `canvasSize` field to store the canvas dimensions when elements were created

2. **Updated EditorStore** (`src/stores/editorStore.ts`)

   - Added `canvasSize` to the store state
   - Modified `saveProject()` to accept and store canvas size
   - Modified `loadProject()` to restore canvas size
   - Updated `initializeProject()` and `reset()` to handle canvas size

3. **Updated EditorScreen** (`src/screens/EditorScreen.tsx`)

   - Pass `canvasSize` when calling `saveProject()`

4. **Updated ExportModal** (`src/components/modals/ExportModal.tsx`)

   - Use stored `canvasSize` from the project instead of current canvas dimensions
   - Falls back to current dimensions if no stored size exists (for backward compatibility)

5. **Added Debug Logging** (`src/utils/imageExporter.ts`)
   - Added console logs to help diagnose export issues
   - Logs source dimensions, canvas size, scale factors, and element details

## Testing

1. Create a new project and add stamps/stickers
2. Scale them to different sizes using the size slider
3. Save the project
4. Export the image - stamps should appear at the correct size and position
5. Load the project again and export - should still be correct

## Debug Information

When exporting, check the console for:

```
Export Debug: {
  sourceImageDimensions: { width: 3000, height: 4000 },
  canvasSize: { width: 400, height: 533 },
  canvasScale: { x: 7.5, y: 7.5 },
  ...
}
```

If `canvasScale` is `{x: 1, y: 1}`, it means `canvasSize` is null/invalid, which will cause incorrect rendering.

## Backward Compatibility

- Old projects without stored `canvasSize` will fall back to using current canvas dimensions
- This may still produce incorrect results for old projects, but new projects will work correctly
- Consider adding a migration to recalculate element positions for old projects

## Future Improvements

1. Store elements in normalized coordinates (0-1 range) instead of absolute pixels
2. Convert between `SerializedElement` and `CanvasElement` properly
3. Add validation to ensure canvas size is always available during export
4. Consider storing element dimensions as percentages of canvas size
