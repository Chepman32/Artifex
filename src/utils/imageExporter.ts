// Image export functionality using Skia for high-quality rendering

import {
  Skia,
  Canvas,
  useImage,
  Image as SkiaImage,
  type SkImage,
} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import { CanvasElement } from '../types';

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number; // 0-100
  addWatermark: boolean; // true if user is not Pro
}

const ARTIFEX_WATERMARK_TEXT = 'Made with Artifex';
const WATERMARK_FONT_SIZE = 14;
const WATERMARK_OPACITY = 0.6;
const WATERMARK_PADDING = 12;

/**
 * Exports canvas with all elements to an image file
 * Uses Skia for high-performance rendering
 */
export const exportCanvasToImage = async (
  sourceImagePath: string,
  sourceImageDimensions: { width: number; height: number },
  canvasElements: CanvasElement[],
  options: ExportOptions,
): Promise<string> => {
  const { width, height } = sourceImageDimensions;
  const { format, quality, addWatermark } = options;

  try {
    // Create Skia surface with source image dimensions
    const surface = Skia.Surface.Make(width, height);
    if (!surface) {
      throw new Error('Failed to create Skia surface');
    }

    const canvas = surface.getCanvas();

    // Load and draw source image
    const sourceImage = await loadImage(sourceImagePath);
    if (!sourceImage) {
      throw new Error('Failed to load source image');
    }

    // Draw source image to fill canvas
    const srcRect = Skia.XYWHRect(0, 0, sourceImage.width(), sourceImage.height());
    const dstRect = Skia.XYWHRect(0, 0, width, height);
    canvas.drawImageRect(sourceImage, srcRect, dstRect);

    // Draw each canvas element in order
    for (const element of canvasElements) {
      await drawCanvasElement(canvas, element, width, height);
    }

    // Add "Made with Artifex" watermark if user is not Pro
    if (addWatermark) {
      drawWatermark(canvas, width, height);
    }

    // Encode to image format
    const image = surface.makeImageSnapshot();
    const encoded = image.encodeToBase64(
      format === 'png' ? Skia.ImageFormat.PNG : Skia.ImageFormat.JPEG,
      quality,
    );

    // Save to temporary file
    const filename = `artifex_export_${Date.now()}.${format}`;
    const filepath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
    await RNFS.writeFile(filepath, encoded, 'base64');

    return filepath;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export image');
  }
};

/**
 * Loads an image from local file path
 */
const loadImage = async (path: string): Promise<SkImage | null> => {
  try {
    // Read file as base64
    const base64 = await RNFS.readFile(path, 'base64');
    const data = Skia.Data.fromBase64(base64);
    return Skia.Image.MakeImageFromEncoded(data);
  } catch (error) {
    console.error('Failed to load image:', path, error);
    return null;
  }
};

/**
 * Draws a single canvas element onto the Skia canvas
 */
const drawCanvasElement = async (
  canvas: any,
  element: CanvasElement,
  canvasWidth: number,
  canvasHeight: number,
): Promise<void> => {
  canvas.save();

  // Calculate actual position (element coordinates are in screen space, need canvas space)
  const x = element.position.x;
  const y = element.position.y;

  // Apply transformations
  canvas.translate(x, y);
  canvas.rotate(element.rotation, 0, 0);
  canvas.scale(element.scale, element.scale);

  switch (element.type) {
    case 'text':
      drawTextElement(canvas, element);
      break;
    case 'sticker':
    case 'watermark':
    case 'stamp':
      await drawImageElement(canvas, element);
      break;
  }

  canvas.restore();
};

/**
 * Draws text element with specified font and style
 */
const drawTextElement = (canvas: any, element: CanvasElement) => {
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(element.color || '#FFFFFF'));
  paint.setAntiAlias(true);

  const font = Skia.Font(
    Skia.Typeface.MakeFreeTypeFaceFromData(
      Skia.Data.fromURI(element.fontFamily || 'System'),
    ),
    element.fontSize || 24,
  );

  canvas.drawText(element.textContent || '', 0, 0, paint, font);
};

/**
 * Draws image element (sticker/watermark/stamp)
 */
const drawImageElement = async (canvas: any, element: CanvasElement) => {
  if (!element.assetPath) return;

  const image = await loadImage(element.assetPath);
  if (!image) return;

  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const dstRect = Skia.XYWHRect(0, 0, element.width || 100, element.height || 100);

  canvas.drawImageRect(image, srcRect, dstRect, paint);
};

/**
 * Draws "Made with Artifex" watermark in bottom-right corner
 */
const drawWatermark = (canvas: any, canvasWidth: number, canvasHeight: number) => {
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('#FFFFFF'));
  paint.setAlphaf(WATERMARK_OPACITY);
  paint.setAntiAlias(true);

  const font = Skia.Font(null, WATERMARK_FONT_SIZE);

  // Measure text to position correctly
  const textWidth = font.measureText(ARTIFEX_WATERMARK_TEXT).width;
  const x = canvasWidth - textWidth - WATERMARK_PADDING;
  const y = canvasHeight - WATERMARK_PADDING;

  canvas.drawText(ARTIFEX_WATERMARK_TEXT, x, y, paint, font);
};
