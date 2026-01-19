// Image export functionality using Skia for high-quality rendering
import { Skia, type SkCanvas, type SkImage } from '@shopify/react-native-skia';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CanvasElement, ImageFilter } from '../types';
import { getFilterColorMatrix } from './colorMatrix';
import { rasterizeTextElementToWatermark } from './textRasterizer';

const getTempDir = async () => {
  const dir = `${RNFS.CachesDirectoryPath}/stikaro_temp`;
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
  return dir;
};

// Extend RNFS types for iOS-specific methods
interface RNFSWithIOS {
  copyAssetsFileIOS(
    imageUri: string,
    destPath: string,
    width: number,
    height: number,
    scale?: number,
    compression?: number,
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

const stripFileScheme = (value: string): string => {
  if (value.startsWith('file://')) {
    return value.replace('file://', '');
  }

  if (value.startsWith('file:/')) {
    return value.replace('file:/', '/');
  }

  return value;
};

interface CanvasScale {
  x: number;
  y: number;
}

interface ElementSize {
  width: number;
  height: number;
}

const isValidCanvasSize = (
  size?: { width: number; height: number } | null,
): size is { width: number; height: number } => {
  return (
    !!size &&
    Number.isFinite(size.width) &&
    Number.isFinite(size.height) &&
    size.width > 0 &&
    size.height > 0
  );
};

const rasterizeTextForExport = async (
  element: CanvasElement,
): Promise<CanvasElement | null> => {
  if (!element.textContent) {
    return null;
  }

  try {
    const rasterized = await rasterizeTextElementToWatermark({
      ...element,
      opacity: 1,
    });

    if (!rasterized.assetPath) {
      return null;
    }

    return {
      ...rasterized,
      type: 'sticker',
      scale: element.scale ?? rasterized.scale ?? 1,
      rotation: element.rotation ?? rasterized.rotation,
      opacity: element.opacity ?? 1,
    };
  } catch (error) {
    console.error(
      '[imageExporter] Failed to rasterize text element:',
      element.id,
      error,
    );
    return null;
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

    const normalized = stripFileScheme(resolved);
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

      const normalizedUri = uri.replace(/^ph:\/\//i, 'ph://');

      try {
        const photoData = await CameraRoll.iosGetImageDataById(
          normalizedUri,
          {
            convertHeicImages: true,
            quality: 1,
          },
        );
        const filepath = photoData?.node?.image?.filepath;
        if (filepath) {
          console.log('[imageExporter] Resolved ph:// to filepath:', filepath);
          return filepath;
        }
        console.warn(
          '[imageExporter] iosGetImageDataById returned no filepath; falling back to copyAssetsFileIOS.',
        );
      } catch (error) {
        console.warn(
          '[imageExporter] iosGetImageDataById failed; falling back to copyAssetsFileIOS:',
          error,
        );
      }

      try {
        const tempDir = await getTempDir();
        const dest = `${tempDir}/stikaro_ph_${Date.now()}.jpg`;
        const width = Math.max(0, Math.round(_dimensions?.width ?? 0));
        const height = Math.max(0, Math.round(_dimensions?.height ?? 0));

        // Copy photo library asset to temporary file
        await (RNFS as RNFSWithIOS).copyAssetsFileIOS(
          normalizedUri,
          dest,
          width,
          height,
          1,
          1,
          'contain',
        );

        const exists = await RNFS.exists(dest);
        if (!exists) {
          throw new Error('copyAssetsFileIOS did not create the output file');
        }

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
        const tempDir = await getTempDir();
        const dest = `${tempDir}/stikaro_bundle_${Date.now()}.${ext}`;
        
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
                
                const tempDir = await getTempDir();
                const dest = `${tempDir}/stikaro_resolved_${Date.now()}_${filename}`;
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
      const tempDir = await getTempDir();
      const dest = `${tempDir}/stikaro_remote_${Date.now()}.${ext}`;

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
    const normalized = stripFileScheme(uri);
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

    const normalizedCanvasSize = isValidCanvasSize(canvasSize)
      ? canvasSize
      : null;
    const canvasScale = getCanvasScale(
      sourceImageDimensions,
      normalizedCanvasSize,
    );

    // Load and draw source image
    console.log(`[imageExporter] Loading source image: ${sourceImagePath}`);
    const sourceImage = await loadImage(sourceImagePath, sourceImageDimensions);
    if (!sourceImage) {
      console.error(`[imageExporter] Failed to load source image: ${sourceImagePath}`);
      throw new Error('Failed to load source image');
    }

    drawSourceImage(canvas, sourceImage, width, height, filter);

    const elementsToRender: CanvasElement[] = [];

    // Process all elements
    const processedElements = await Promise.all(
      canvasElements.map(async element => {
        // Case 1: Already has an image asset (Sticker, Stamp, Image Watermark)
        if (element.assetPath) {
          // Force type to 'sticker' for consistency
          return { ...element, type: 'sticker' } as CanvasElement;
        }

        // Case 2: Text content that needs rasterization (Text, Text Watermark)
        if (element.textContent) {
          const rasterized = await rasterizeTextForExport(element);
          if (rasterized) {
            return rasterized;
          }
        }

        return null;
      }),
    );

    // Filter out nulls and add to render list
    processedElements.forEach(el => {
      if (el) {
        elementsToRender.push(el);
      }
    });

    // Debug logging
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const elementSummary = elementsToRender.reduce((acc, element) => {
        acc[element.type] = (acc[element.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('[imageExporter] Export debug - final element counts', elementSummary);
    }

    // Render all elements (now all as images/stickers)
    for (const element of elementsToRender) {
      await drawCanvasElement(canvas, element, canvasScale);
    }

    // Add built-in watermark as a sticker element (rasterized at export resolution)
    if (addWatermark) {
      try {
        const scaleFactor = Math.max(canvasScale.x, canvasScale.y);
        const exportFontSize = Math.round(WATERMARK_FONT_SIZE * scaleFactor);

        // Rasterize watermark text at export resolution
        const rasterized = await rasterizeTextElementToWatermark({
          id: `builtin-watermark-${Date.now()}`,
          type: 'text',
          textContent: STIKARO_WATERMARK_TEXT,
          fontFamily: 'System',
          fontSize: exportFontSize,
          color: '#FFFFFF',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          opacity: WATERMARK_OPACITY,
        });

        if (rasterized.assetPath) {
          const watermarkWidth = rasterized.width ?? exportFontSize * 10;
          const watermarkHeight = rasterized.height ?? exportFontSize * 2;

          // Position in EXPORT coordinates (bottom-right with scaled padding)
          const paddingScaled = WATERMARK_PADDING * scaleFactor;
          const exportX = width - watermarkWidth - paddingScaled;
          const exportY = height - watermarkHeight - paddingScaled;

          // Draw watermark directly at export coordinates (no scaling needed)
          const watermarkImage = await loadImage(rasterized.assetPath);
          if (watermarkImage) {
            const paint = Skia.Paint();
            paint.setAntiAlias(true);
            // Opacity is already baked into the rasterized image

            const srcRect = Skia.XYWHRect(0, 0, watermarkImage.width(), watermarkImage.height());
            const dstRect = Skia.XYWHRect(exportX, exportY, watermarkWidth, watermarkHeight);
            canvas.drawImageRect(watermarkImage, srcRect, dstRect, paint);
          }
        }
      } catch (error) {
        console.error('[imageExporter] Failed to draw watermark:', error);
      }
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

    const tempDir = await getTempDir();
    const filename = `stikaro_export_${Date.now()}.${actualFormat}`;
    const filepath = `${tempDir}/${filename}`;
    console.log(`[imageExporter] Saving export to: ${filepath}`);
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
