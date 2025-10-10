# Watermark Visibility Fix

## Problem

Watermarks were not visible in exported images, even though stamps and stickers were working correctly.

## Root Cause

Watermarks have an `opacity` property (typically 0.3-0.7 for subtle watermarking), but this opacity was not being:

1. Transferred from `WatermarkInstance` to `CanvasElement` during conversion
2. Applied during rendering in the editor
3. Applied during image export

This caused watermarks to either:

- Not render at all (if opacity was very low)
- Render at full opacity (ignoring the intended transparency)

## Solution

Added opacity support throughout the rendering pipeline.

### Changes Made

1. **Updated CanvasElement Type** (`src/types/index.ts`)

   - Added optional `opacity?: number` field (0-1 range)

2. **Updated WatermarkManager** (`src/utils/watermarkManager.ts`)

   - Modified `toCanvasElements()` to include `opacity: wm.opacity` when converting watermarks

3. **Updated Image Exporter** (`src/utils/imageExporter.ts`)

   - Modified `drawImageElement()` to apply opacity using `paint.setAlphaf()` when rendering images

4. **Updated StickerElement Component** (`src/components/canvas/StickerElement.tsx`)

   - Added `opacity` prop to interface
   - Applied opacity to the container view style

5. **Updated SkiaCanvas** (`src/components/SkiaCanvas.tsx`)
   - Pass `opacity={element.opacity}` to StickerElement for all element types (stickers, watermarks, stamps)

## How It Works

### In the Editor

- Watermarks are rendered with their specified opacity (e.g., 0.5 = 50% transparent)
- The opacity is applied as a style property on the React Native View

### During Export

- The opacity is applied to the Skia Paint object using `setAlphaf()`
- This ensures the watermark is rendered with the correct transparency in the final image

## Testing

1. Add a watermark with a preset (e.g., "Subtle Grid")
2. Verify it appears semi-transparent in the editor
3. Export the image
4. The watermark should now be visible with the same opacity in the exported image

## Notes

- Opacity defaults to 1.0 (fully opaque) if not specified
- This fix also enables opacity control for regular stickers and stamps if needed in the future
- Watermark presets typically use opacity ranges of 0.2-0.7 depending on the style (subtle, standard, prominent)
