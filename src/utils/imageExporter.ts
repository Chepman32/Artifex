// Image export functionality using Skia for high-quality rendering
import { Skia, type SkCanvas, type SkImage } from '@shopify/react-native-skia';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CanvasElement, ImageFilter } from '../types';
import { getFilterColorMatrix } from './colorMatrix';

// Extend RNFS types for iOS-specific methods
interface RNFSWithIOS {
  copyAssetsFileIOS(
    imageUri: string,
    destPath: string,
    width: number,
    height: number,
    scale?: number,
    compression?: string,
    resizeMode?: string
  ): Promise<string>;
}

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number; // 0-100
  addWatermark: boolean;
  canvasSize?: { width: number; height: number };
}

const STIKARO_WATERMARK_TEXT = 'Made with Stikaro';
const WATERMARK_FONT_SIZE = 14;
const WATERMARK_OPACITY = 0.6;
const WATERMARK_PADDING = 12;


interface CanvasScale {
  x: number;
  y: number;
}

interface ElementSize {
  width: number;
  height: number;
}


// Create a rasterized watermark as a sticker
const createWatermarkSticker = async (
  text: string,
  fontSize: number = 24,
  color: string = '#FFFFFF',
  opacity: number = 1.0,
): Promise<string> => {
  try {
    // Create a temporary canvas for text rendering
    const textWidth = text.length * fontSize * 0.6; // rough estimate
    const textHeight = fontSize * 1.5;
    const padding = fontSize * 0.3;
    
    const canvasWidth = Math.ceil(textWidth + padding * 2);
    const canvasHeight = Math.ceil(textHeight + padding * 2);
    
    const surface = Skia.Surface.Make(canvasWidth, canvasHeight);
    if (!surface) {
      throw new Error('Failed to create watermark surface');
    }
    
    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('transparent'));
    
    // Create font
    const font = Skia.Font(undefined, fontSize);
    if (!font) {
      throw new Error('Failed to create font');
    }
    
    // Create paint
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color(color));
    paint.setAlphaf(opacity);
    
    // Draw text
    const x = padding;
    const y = canvasHeight - padding;
    
    try {
      (canvas as any).drawText(text, x, y, paint, font);
    } catch {
      try {
        (canvas as any).drawText(text, x, y, font, paint);
      } catch {
        // If both fail, create a simple rectangle as fallback
        const rect = Skia.XYWHRect(0, 0, canvasWidth, canvasHeight);
        canvas.drawRect(rect, paint);
      }
    }
    
    // Encode to base64
    const snapshot = surface.makeImageSnapshot();
    const imageFormatEnum = (Skia as any).ImageFormat;
    let encoded: string;
    
    if (imageFormatEnum?.PNG) {
      encoded = snapshot.encodeToBase64(imageFormatEnum.PNG, 100);
    } else {
      encoded = snapshot.encodeToBase64();
    }
    
    // Save to temp file
    const filename = `watermark_${Date.now()}.png`;
    const filepath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
    await RNFS.writeFile(filepath, encoded, 'base64');
    
    return filepath;
  } catch (error) {
    console.error('Failed to create watermark sticker:', error);
    throw error;
  }
};

const getCanvasScale = (
  sourceDimensions: { width: number; height: number },
  canvasSize: { width: number; height: number } | null,
): CanvasScale => {
  if (!canvasSize || canvasSize.width <= 0 || canvasSize.height <= 0) {
    console.warn(
      'getCanvasScale: Invalid canvasSize, returning 1:1 scale. This may cause incorrect export sizing.',
    );
    return { x: 1, y: 1 };
  }

  const scaleX = sourceDimensions.width / canvasSize.width;
  const scaleY = sourceDimensions.height / canvasSize.height;

  return {
    x: Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1,
    y: Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1,
  };
};

const drawSourceImage = (
  canvas: SkCanvas,
  image: SkImage,
  width: number,
  height: number,
  filter?: ImageFilter | null,
) => {
  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const dstRect = Skia.XYWHRect(0, 0, width, height);
  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  const colorMatrix = getFilterColorMatrix(filter);
  if (colorMatrix) {
    const colorFilter = Skia.ColorFilter.MakeMatrix(colorMatrix);
    if (colorFilter) {
      paint.setColorFilter(colorFilter);
    }
  }

  canvas.drawImageRect(image, srcRect, dstRect, paint);
};

const loadImage = async (
  uri: string,
  dimensions?: { width: number; height: number },
): Promise<SkImage | null> => {
  try {
    const resolved = await resolveImageUriToPath(uri, dimensions);
    if (!resolved) {
      return null;
    }

    if (resolved.startsWith('data:image/')) {
      const base64 = resolved.split(',')[1] ?? '';
      const data = Skia.Data.fromBase64(base64);
      return Skia.Image.MakeImageFromEncoded(data);
    }

    const normalized = resolved.startsWith('file://') ? resolved.replace('file://', '') : resolved;
    const base64 = await RNFS.readFile(normalized, 'base64');
    const data = Skia.Data.fromBase64(base64);
    return Skia.Image.MakeImageFromEncoded(data);
  } catch (error) {
    console.error('Failed to load image:', uri, error);
    return null;
  }
};

const resolveImageUriToPath = async (
  uri: string,
  _dimensions?: { width: number; height: number },
): Promise<string | null> => {
  if (!uri) {
    return null;
  }

  try {
    // Handle iOS photo library URLs
    if (uri.startsWith('ph://')) {
      console.log('[imageExporter] iOS photo library URI detected, converting:', uri);

      if (Platform.OS !== 'ios') {
        console.error('[imageExporter] ph:// URIs only supported on iOS');
        return null;
      }

      try {
        const ext = 'jpg';
        const dest = `${RNFS.TemporaryDirectoryPath}/stikaro_ph_${Date.now()}.${ext}`;

        // Copy photo library asset to temporary file
        await (RNFS as any).copyAssetsFileIOS(
          uri,
          dest,
          _dimensions?.width ?? 0,
          _dimensions?.height ?? 0,
          1,
          ext,
        );

        console.log('[imageExporter] Successfully copied ph:// to:', dest);
        return dest;
      } catch (error) {
        console.error('[imageExporter] Failed to copy iOS photo library asset:', error);
        return null;
      }
    }

    // Handle Android asset URIs
    if (Platform.OS === 'android' && uri.startsWith('file:///android_asset/')) {
      const assetPath = uri.replace('file:///android_asset/', '');
      const ext = uri.endsWith('.png') ? 'png' : 'jpg';
      const dest = `${RNFS.CachesDirectoryPath}/stikaro_asset_${Date.now()}.${ext}`;
      await RNFS.copyFileAssets(assetPath, dest);
      return dest;
    }

    // Handle Metro dev-server URLs
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      // Special case: Metro bundle URLs (not assets)
      if (uri.includes('localhost:8081') && (uri.includes('.bundle') || uri.includes('index.bundle'))) {
        console.log(`[imageExporter] Metro bundle URL detected, attempting HTTP download: ${uri}`);
        // Try to download from Metro bundle URL
        const ext = uri.endsWith('.png') ? 'png' : 'jpg';
        const dest = `${RNFS.TemporaryDirectoryPath}/stikaro_bundle_${Date.now()}.${ext}`;
        
        try {
          const result = await RNFS.downloadFile({
            fromUrl: uri,
            toFile: dest,
          }).promise;
          
          if (result.statusCode && result.statusCode >= 400) {
            throw new Error(`Bundle download failed with status ${result.statusCode}`);
          }
          console.log(`[imageExporter] Successfully downloaded bundle image to: ${dest}`);
          return dest;
        } catch (error) {
          console.error(`[imageExporter] Bundle download failed: ${error}`);
          throw new Error('Cannot export from Metro bundle URL - download failed');
        }
      }
      
      if (uri.includes('localhost:8081')) {
        console.log(`[imageExporter] Detected Metro URL, trying local resolution: ${uri}`);
        
        // Check if it's a sticker asset
        if (uri.includes('/assets/')) {
          // Extract filename and search locally for stickers
          const filenameMatch = uri.match(/\/([\w-.]+)\.png/);
          if (filenameMatch) {
            const filename = filenameMatch[1] + '.png';
            console.log(`[imageExporter] Extracted filename: ${filename}`);
            
            // Search in sticker directories
            const searchPaths = [
              `src/assets/stickers/social-media/${filename}`,
              `src/assets/stickers/brand-icons/${filename}`,
              `src/assets/stickers/emoji/${filename}`,
              `src/assets/stickers/food/${filename}`,
              `src/assets/stickers/miscellaneous/${filename}`,
              `src/assets/stickers/seasonal/${filename}`,
              `src/assets/stickers/text-labels/${filename}`,
              `src/assets/stickers/${filename}`,
            ];
            
            for (const path of searchPaths) {
              console.log(`[imageExporter] Checking path: ${path}`);
              const exists = await RNFS.exists(path);
              if (exists) {
                console.log(`[imageExporter] Found asset at: ${path}`);
                
                const dest = `${RNFS.TemporaryDirectoryPath}/stikaro_resolved_${Date.now()}_${filename}`;
                await RNFS.copyFile(path, dest);
                console.log(`[imageExporter] Copied resolved asset to: ${dest}`);
                
                return dest;
              }
            }
            
            console.log(`[imageExporter] Asset not found in any sticker location`);
          }
        } else {
          // For source images from Metro (not assets), they're likely bundled images
          // Try to extract the actual image data from the Metro bundle
          console.log(`[imageExporter] Source image from Metro bundle: ${uri}`);
          
          // For Metro bundle URLs, we need to download them via HTTP
          // since they're not local files
        }
      }
      
      // Fallback: try HTTP download for all Metro URLs
      const ext = uri.endsWith('.png') ? 'png' : 'jpg';
      const dest = `${RNFS.TemporaryDirectoryPath}/stikaro_remote_${Date.now()}.${ext}`;

      try {
        const result = await RNFS.downloadFile({
          fromUrl: uri,
          toFile: dest,
        }).promise;

        if (result.statusCode && result.statusCode >= 400) {
          throw new Error(`Download failed with status ${result.statusCode}`);
        }
        console.log(`[imageExporter] Successfully downloaded from: ${uri}`);
        return dest;
      } catch (error) {
        console.log(`[imageExporter] Download failed for ${uri}: ${error}`);
        throw error;
      }
    }

    // Handle local files
    const normalized = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
    const exists = await RNFS.exists(normalized);
    if (exists) {
      return normalized;
    }

    return normalized;
  } catch (error) {
    console.error('Failed to resolve image URI:', uri, error);
    return null;
  }
};

const drawImageElement = async (
  canvas: SkCanvas,
  element: CanvasElement,
  size: ElementSize,
): Promise<void> => {
  if (!element.assetPath) {
    return;
  }

  const image = await loadImage(element.assetPath);
  if (!image) {
    console.warn('Export: skipped image element - failed to load', element.id, element.assetPath);
    return;
  }

  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  // Apply opacity if specified
  if (element.opacity !== undefined && element.opacity < 1) {
    paint.setAlphaf(Math.max(0, Math.min(element.opacity, 1)));
  }

  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const dstRect = Skia.XYWHRect(0, 0, size.width, size.height);
  canvas.drawImageRect(image, srcRect, dstRect, paint);
};

const withElementTransform = async (
  canvas: SkCanvas,
  element: CanvasElement,
  size: ElementSize,
  scale: CanvasScale,
  draw: () => Promise<void>,
): Promise<void> => {
  const { position } = element;
  const x = (position?.x ?? 0) * scale.x;
  const y = (position?.y ?? 0) * scale.y;
  const rotationDegrees = ((element.rotation ?? 0) * 180) / Math.PI;
  const scaleValue = element.scale ?? 1;
  const safeScale = Math.max(scaleValue, 0.0001);

  const pivotX = size.width / 2;
  const pivotY = size.height / 2;

  canvas.save();
  canvas.translate(x + pivotX, y + pivotY);
  if (rotationDegrees !== 0) {
    canvas.rotate(rotationDegrees, 0, 0);
  }
  if (safeScale !== 1) {
    canvas.scale(safeScale, safeScale);
  }
  canvas.translate(-pivotX, -pivotY);

  await draw();

  canvas.restore();
};

const drawCanvasElement = async (
  canvas: SkCanvas,
  element: CanvasElement,
  scale: CanvasScale,
): Promise<void> => {
  switch (element.type) {
    case 'sticker':
    case 'watermark': {
      if (!element.assetPath) {
        return;
      }
      const width = (element.width || 100) * scale.x;
      const height = (element.height || 100) * scale.y;
      await withElementTransform(
        canvas,
        element,
        { width, height },
        scale,
        async () => {
          await drawImageElement(canvas, element, { width, height });
        },
      );
      break;
    }
    default:
      break;
  }
};

export const exportCanvasToImage = async (
  sourceImagePath: string,
  sourceImageDimensions: { width: number; height: number },
  canvasElements: CanvasElement[],
  options: ExportOptions,
  filter?: ImageFilter | null,
): Promise<{ filepath: string; format: 'png' | 'jpg'; mime: string }> => {
  const { width, height } = sourceImageDimensions;
  const { format, quality, addWatermark, canvasSize } = options;

  try {
    const surface = Skia.Surface.Make(Math.round(width), Math.round(height));
    if (!surface) {
      throw new Error('Failed to create Skia surface');
    }

    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('#00000000'));

    const canvasScale = getCanvasScale(
      sourceImageDimensions,
      canvasSize || null,
    );

    // Load and draw source image
    console.log(`[imageExporter] Loading source image: ${sourceImagePath}`);
    const sourceImage = await loadImage(sourceImagePath);
    if (!sourceImage) {
      console.error(`[imageExporter] Failed to load source image: ${sourceImagePath}`);
      throw new Error('Failed to load source image');
    }

    drawSourceImage(canvas, sourceImage, width, height, filter);

    // Convert text watermarks to sticker elements
    const elementsToRender = [...canvasElements];
    
    // Process text watermarks by converting them to rasterized stickers
    for (const element of canvasElements) {
      if (element.type === 'watermark' && element.textContent && !element.assetPath) {
        try {
          console.log(`[imageExporter] Converting text watermark to sticker: ${element.textContent}`);
          const watermarkPath = await createWatermarkSticker(
            element.textContent,
            element.fontSize || 24,
            element.color || '#FFFFFF',
            element.opacity || 1.0
          );
          
          // Replace text watermark with image-based watermark
          const stickerElement: CanvasElement = {
            ...element,
            type: 'watermark',
            assetPath: watermarkPath,
            textContent: undefined,
          };
          
          const index = elementsToRender.findIndex(el => el.id === element.id);
          if (index !== -1) {
            elementsToRender[index] = stickerElement;
          }
        } catch (error) {
          console.error(`[imageExporter] Failed to convert watermark ${element.id}:`, error);
        }
      }
    }

    // Add built-in watermark if requested
    if (addWatermark) {
      try {
        console.log(`[imageExporter] Creating built-in watermark sticker`);
        const watermarkPath = await createWatermarkSticker(
          STIKARO_WATERMARK_TEXT,
          WATERMARK_FONT_SIZE,
          '#FFFFFF',
          WATERMARK_OPACITY
        );
        
        const builtInWatermark: CanvasElement = {
          id: `builtin-watermark-${Date.now()}`,
          type: 'watermark',
          assetPath: watermarkPath,
          position: { 
            x: width - 200 - WATERMARK_PADDING, 
            y: height - 30 - WATERMARK_PADDING 
          },
          scale: 1,
          rotation: 0,
          width: 200,
          height: 30,
          opacity: WATERMARK_OPACITY,
        };
        
        elementsToRender.push(builtInWatermark);
      } catch (error) {
        console.error(`[imageExporter] Failed to create built-in watermark:`, error);
      }
    }

    // Debug logging
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const elementSummary = elementsToRender.reduce((acc, element) => {
        acc[element.type] = (acc[element.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('[imageExporter] Export debug - final element counts', elementSummary);
    }

    // Render all elements (now all as images)
    for (const element of elementsToRender) {
      await drawCanvasElement(canvas, element, canvasScale);
    }

    // Encode and save
    const snapshot = surface.makeImageSnapshot();
    const imageFormatEnum = (Skia as any).ImageFormat;
    let encoded: string;

    let actualFormat: 'png' | 'jpg' = format;

    if (format === 'png') {
      if (imageFormatEnum?.PNG) {
        encoded = snapshot.encodeToBase64(imageFormatEnum.PNG, 100);
      } else {
        encoded = snapshot.encodeToBase64();
      }
    } else {
      if (imageFormatEnum?.JPEG) {
        encoded = snapshot.encodeToBase64(imageFormatEnum.JPEG, quality);
      } else {
        console.warn(
          'Skia.ImageFormat.JPEG unavailable; falling back to PNG encoding.',
        );
        encoded = snapshot.encodeToBase64();
        actualFormat = 'png';
      }
    }

    const filename = `stikaro_export_${Date.now()}.${actualFormat}`;
    const filepath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
    await RNFS.writeFile(filepath, encoded, 'base64');

    return {
      filepath,
      format: actualFormat,
      mime: actualFormat === 'png' ? 'image/png' : 'image/jpeg',
    };
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export image');
  }
};
