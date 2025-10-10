# Testing Guide for Export Fixes

## Overview

Two major issues have been fixed:

1. **Stamps/Stickers Size & Position** - Objects now export at correct size and position
2. **Watermark Visibility** - Watermarks now appear in exported images with correct opacity

## Test Scenarios

### Test 1: Stamps Export Correctly

**Steps:**

1. Create a new project with any image
2. Add a stamp from the stamps toolbar
3. Scale it up using the size slider (make it 2-3x larger)
4. Move it to a specific position (e.g., top-right corner)
5. Save the project
6. Export the image

**Expected Result:**

- The stamp should appear at the same relative size and position in the exported image as it does in the editor
- No more tiny stamps in the wrong location!

### Test 2: Stickers Export Correctly

**Steps:**

1. Create a new project
2. Add a sticker (emoji or custom image)
3. Scale it to 2x or 3x using the size slider
4. Position it in the center
5. Export the image

**Expected Result:**

- Sticker appears at correct size and position in export
- Size matches what you see in the editor

### Test 3: Watermarks Are Visible

**Steps:**

1. Create a new project
2. Open watermarks toolbar
3. Select a preset (e.g., "Subtle Grid" or "Diagonal Pattern")
4. Add text watermark (e.g., "© 2025 Your Name")
5. Verify watermarks appear semi-transparent in the editor
6. Export the image

**Expected Result:**

- Watermarks should be visible in the exported image
- They should have the same transparency/opacity as in the editor
- Multiple watermarks should all be visible

### Test 4: Mixed Elements

**Steps:**

1. Create a new project
2. Add stamps, stickers, AND watermarks
3. Scale some elements up, some down
4. Position them in different areas
5. Export the image

**Expected Result:**

- All elements appear correctly
- Sizes and positions match the editor
- Watermarks are visible with correct opacity
- No elements are missing

### Test 5: Load Existing Project

**Steps:**

1. Create a project with stamps/stickers (from Test 1 or 2)
2. Save it
3. Go back to home screen
4. Load the project again
5. Export without making changes

**Expected Result:**

- Elements should still export correctly
- Canvas size is preserved from when project was created

### Test 6: Different Watermark Styles

**Steps:**

1. Create a new project
2. Try different watermark presets:
   - Subtle Grid (low opacity)
   - Standard Diagonal (medium opacity)
   - Prominent Corners (higher opacity)
3. Export each one

**Expected Result:**

- All watermark styles should be visible
- Opacity differences should be preserved
- Subtle watermarks should be faint but visible
- Prominent watermarks should be more opaque

## Known Limitations

### Backward Compatibility

- **Old projects** (created before this fix) may still have export issues
- This is because they don't have the `canvasSize` stored
- **Solution**: Re-save old projects to store the canvas size

### Workaround for Old Projects

If an old project exports incorrectly:

1. Open the project
2. Make any small change (move an element slightly)
3. Save the project
4. Export again - should now work correctly

## Debug Information

If you encounter issues, check the console logs:

### Canvas Size Warning

```
getCanvasScale: Invalid canvasSize, returning 1:1 scale. This may cause incorrect export sizing.
```

**Meaning**: Canvas size wasn't stored/loaded properly
**Fix**: Re-save the project

### Export Debug Info

Look for logs like:

```
Export Debug: {
  sourceImageDimensions: { width: 3000, height: 4000 },
  canvasSize: { width: 400, height: 533 },
  canvasScale: { x: 7.5, y: 7.5 },
  ...
}
```

**What to check:**

- `canvasSize` should NOT be null
- `canvasScale` should NOT be `{x: 1, y: 1}` (unless source and canvas are same size)
- Scale values should be reasonable (typically 2-10x for mobile devices)

## Success Criteria

✅ Stamps export at correct size and position
✅ Stickers export at correct size and position  
✅ Watermarks are visible in exports
✅ Watermark opacity is preserved
✅ Multiple elements work together
✅ Saved projects export correctly after reload

## Reporting Issues

If you find any remaining issues, please note:

1. Device/screen size
2. Source image dimensions
3. Canvas size (check console logs)
4. Element type (stamp/sticker/watermark)
5. Whether it's a new or old project
6. Console error messages
