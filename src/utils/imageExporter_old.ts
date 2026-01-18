// Image export functionality using Skia for high-quality rendering

import { Skia, type SkCanvas, type SkImage } from '@shopify/react-native-skia';
import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CanvasElement, ImageFilter } from '../types';
import { getFilterColorMatrix } from './colorMatrix';

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

const imageCache = new Map<string, SkImage>();

interface CanvasScale {
  x: number;
  y: number;
}

const createFont = (size: number, family?: string) => {
  try {
    let typeface: any = null;

    if (family && family !== 'System') {
      typeface =
        ((Skia.Typeface as any).MakeFromName?.(family) as any) ?? null;
    }

    if (!typeface && typeof (Skia.Typeface as any).MakeDefault === 'function') {
      typeface = (Skia.Typeface as any).MakeDefault();
    }

    const font = Skia.Font(typeface ?? undefined, size);
    if (!font) {
      console.warn('Skia: Failed to create font instance');
      return null;
    }

    if (typeof font.setEdging === 'function') {
      font.setEdging((Skia as any).FontEdging?.SubpixelAntialias);
    }
    return font;
  } catch (error) {
    console.warn('Skia: Failed to create font', error);
    return null;
  }
};

interface ElementSize {
  width: number;
  height: number;
}

interface TextLayout {
  font: ReturnType<typeof Skia.Font>;
  text: string;
  fontSize: number;
  textWidth: number;
  textHeight: number;
  totalWidth: number;
  totalHeight: number;
  baseline: number;
  paddedBaseline: number;
  paddingX: number;
  paddingY: number;
}

/**
 * Exports the current canvas to an image file on disk.
 */
interface ExportResult {
  filepath: string;
  format: 'png' | 'jpg';
  mime: string;
}

export const exportCanvasToImage = async (
  sourceImagePath: string,
  sourceImageDimensions: { width: number; height: number },
  canvasElements: CanvasElement[],
  options: ExportOptions,
  filter?: ImageFilter | null,
): Promise<ExportResult> => {
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

    const sourceImage = await getImageFromCache(
      sourceImagePath,
      sourceImageDimensions,
    );
    if (!sourceImage) {
      throw new Error('Failed to load source image');
    }

    drawSourceImage(canvas, sourceImage, width, height, filter);

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const elementSummary = canvasElements.reduce((acc, element) => {
        acc[element.type] = (acc[element.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Export debug - element counts', elementSummary);

      // Debug watermark elements specifically
      const watermarkElements = canvasElements.filter(
        el => el.type === 'watermark',
      );
      if (watermarkElements.length > 0) {
        console.log(
          'Export debug - watermark elements:',
          watermarkElements.map(el => ({
            id: el.id,
            type: el.type,
            opacity: el.opacity,
            assetPath: el.assetPath,
            width: el.width,
            height: el.height,
            position: el.position,
          })),
        );
      }
    }

    for (const element of canvasElements) {
      await drawCanvasElement(canvas, element, canvasScale);
    }

    if (addWatermark) {
      drawWatermark(canvas, width, height, canvasScale);
    }

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

const getImageFromCache = async (
  uri: string,
  dimensions?: { width: number; height: number },
): Promise<SkImage | null> => {
  const cacheKey = `${uri}|${dimensions?.width || 0}x${
    dimensions?.height || 0
  }`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) as SkImage;
  }

  const image = await loadImage(uri, dimensions);
  if (image) {
    imageCache.set(cacheKey, image);
  }
  return image;
};

const stripFileScheme = (path: string): string => {
  if (path.startsWith('file://')) {
    return path.replace('file://', '');
  }
  return path;
};

const guessImageExtension = (
  uri: string,
  fallback: 'png' | 'jpg' = 'jpg',
): 'png' | 'jpg' => {
  const match = uri.match(/\.(png|jpg|jpeg)$/i);
  if (!match) {
    return fallback;
  }
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : (ext as 'png' | 'jpg');
};

const getPackagerBaseUrl = (): string | null => {
  try {
    const scriptUrl: unknown = NativeModules?.SourceCode?.scriptURL;
    if (typeof scriptUrl !== 'string') {
      return null;
    }
    const match = scriptUrl.match(/^(https?:\/\/[^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const rewriteLocalhostToPackagerHost = (uri: string): string => {
  const base = getPackagerBaseUrl();
  if (!base) {
    return uri;
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(uri)) {
    return uri.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, base);
  }

  return uri;
};

const stripQueryString = (uri: string): string => {
  const idx = uri.indexOf('?');
  if (idx === -1) {
    return uri;
  }
  return uri.slice(0, idx);
};

const stripHashParam = (uri: string): string => {
  const idx = uri.indexOf('?');
  if (idx === -1) {
    return uri;
  }
  const base = uri.slice(0, idx);
  const query = uri.slice(idx + 1);
  const filtered = query
    .split('&')
    .filter(part => part && !part.toLowerCase().startsWith('hash='));
  return filtered.length ? `${base}?${filtered.join('&')}` : base;
};

const keepOnlyPlatformParam = (uri: string): string => {
  const idx = uri.indexOf('?');
  if (idx === -1) {
    return uri;
  }
  const base = uri.slice(0, idx);
  const query = uri.slice(idx + 1);
  const platform = query
    .split('&')
    .find(part => part.toLowerCase().startsWith('platform='));
  return platform ? `${base}?${platform}` : base;
};

const rewriteMetroAssetPath = (uri: string): string[] => {
  const variants = new Set<string>();
  variants.add(uri);

  console.log(`[imageExporter] rewriteMetroAssetPath input: ${uri}`);

  // Metro asset URLs from resolveAssetSource often include extra path components
  // that the bundler doesn't actually serve. Try common serving patterns.
  
  // Strip /src/assets/ entirely (most common fix)
  const stripped = uri.replace('/src/assets/', '/');
  variants.add(stripped);
  console.log(`[imageExporter] stripped /src/assets/: ${stripped}`);
  
  // Try /assets/ root (standard RN asset serving)
  const assetsRoot = uri.replace('/assets/src/assets/', '/assets/');
  variants.add(assetsRoot);
  console.log(`[imageExporter] /assets root: ${assetsRoot}`);
  
  const assetsRoot2 = uri.replace('/assets/src/', '/assets/');
  variants.add(assetsRoot2);
  console.log(`[imageExporter] /assets root2: ${assetsRoot2}`);
  
  // Try assets without any prefix (fallback)
  const withoutPrefix = uri.replace('/assets/', '/');
  variants.add(withoutPrefix);
  console.log(`[imageExporter] without prefix: ${withoutPrefix}`);
  
  // Try assets with just filename (aggressive fallback)
  const filename = uri.split('/').pop()?.split('?')[0];
  if (filename) {
    const filenameUrl1 = `http://localhost:8081/assets/${filename}`;
    const filenameUrl2 = `http://localhost:8081/${filename}`;
    variants.add(filenameUrl1);
    variants.add(filenameUrl2);
    console.log(`[imageExporter] filename URLs: ${filenameUrl1}, ${filenameUrl2}`);
  }

  // Try removing all path components except filename
  const pathParts = uri.split('/');
  const filenameOnly = pathParts[pathParts.length - 1]?.split('?')[0];
  if (filenameOnly) {
    const directUrl = `http://localhost:8081/assets/${filenameOnly}`;
    variants.add(directUrl);
    console.log(`[imageExporter] direct URL: ${directUrl}`);
  }

  // NEW: Try the most aggressive path stripping - just filename from /assets/stickers/
  const stickersMatch = uri.match(/\/assets\/stickers\/([\w\-.]+)/);
  if (stickersMatch) {
    const filenameFromStickers = stickersMatch[1];
    const stickersUrl = `http://localhost:8081/assets/stickers/${filenameFromStickers}`;
    variants.add(stickersUrl);
    console.log(`[imageExporter] stickers URL: ${stickersUrl}`);
  }

  const result = Array.from(variants);
  console.log(`[imageExporter] rewriteMetroAssetPath output:`, result);
  return result;
};

const resolveMetroAssetLocally = async (assetPath: string): Promise<string | null> => {
  try {
    console.log(`[imageExporter] resolveMetroAssetLocally: ${assetPath}`);
    
    // Map Metro asset paths back to local file paths
    // Metro URLs like /assets/src/assets/stickers/... map to src/assets/stickers/...
    let localPath = assetPath;
    
    // Try to resolve the path back to the source
    if (assetPath.startsWith('/assets/src/assets/')) {
      localPath = assetPath.replace('/assets/src/assets/', 'src/assets/');
    } else if (assetPath.startsWith('/assets/src/')) {
      localPath = assetPath.replace('/assets/src/', 'src/assets/');
    } else if (assetPath.startsWith('/assets/')) {
      localPath = assetPath.replace('/assets/', 'src/assets/');
    }
    
    console.log(`[imageExporter] Resolved local path: ${localPath}`);
    
    // Check if the file exists locally
    const exists = await RNFS.exists(localPath);
    if (!exists) {
      console.log(`[imageExporter] Local file does not exist: ${localPath}`);
      return null;
    }
    
    // Copy to temp location for the exporter
    const filename = localPath.split('/').pop() || 'asset.png';
    const dest = `${RNFS.TemporaryDirectoryPath}/stikaro_local_${Date.now()}_${filename}`;
    
    await RNFS.copyFile(localPath, dest);
    console.log(`[imageExporter] Copied local asset to: ${dest}`);
    
    return dest;
  } catch (error) {
    console.log(`[imageExporter] resolveMetroAssetLocally failed: ${error}`);
    return null;
  }
};

// Direct approach: Resolve Metro asset URLs back to local files
const tryAssetResolution = async (metroUri: string): Promise<string | null> => {
  try {
    console.log(`[imageExporter] tryAssetResolution: ${metroUri}`);
    
    // Extract the filename from the Metro URI
    const filenameMatch = metroUri.match(/\/([\w\-\.]+)\.png/);
    if (!filenameMatch) {
      console.log(`[imageExporter] No filename found in URI`);
      return null;
    }
    
    const filename = filenameMatch[1] + '.png';
    console.log(`[imageExporter] Extracted filename: ${filename}`);
    
    // Search for the file in the stickers directory structure
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
        
        // Copy to temp location
        const dest = `${RNFS.TemporaryDirectoryPath}/stikaro_resolved_${Date.now()}_${filename}`;
        
        await RNFS.copyFile(path, dest);
        console.log(`[imageExporter] Copied resolved asset to: ${dest}`);
        
        return dest;
      }
    }
    
    console.log(`[imageExporter] Asset not found in any sticker location`);
    return null;
  } catch (error) {
    console.log(`[imageExporter] tryAssetResolution failed: ${error}`);
    return null;
  }
};

const downloadRemoteToFile = async (
  uri: string,
  dest: string,
): Promise<void> => {
  const attempted = new Set<string>();
  const candidates: string[] = [];

  const pushCandidate = (candidate: string) => {
    if (!candidate || attempted.has(candidate)) {
      return;
    }
    attempted.add(candidate);
    candidates.push(candidate);
  };

  const rewritten = rewriteLocalhostToPackagerHost(uri);

  const baseCandidates = [
    ...rewriteMetroAssetPath(uri),
    ...rewriteMetroAssetPath(rewritten),
  ];

  for (const candidate of baseCandidates) {
    pushCandidate(candidate);
    pushCandidate(stripHashParam(candidate));
    pushCandidate(keepOnlyPlatformParam(candidate));
    pushCandidate(stripQueryString(candidate));
  }

  let lastError: unknown = null;

  console.log(`[imageExporter] Starting downloadRemoteToFile for URI: ${uri}`);
  console.log(`[imageExporter] Total candidates to try: ${candidates.length}`);
  
  for (const url of candidates) {
    try {
      console.log(`[imageExporter] Trying download URL: ${url}`);
      const result = await RNFS.downloadFile({
        fromUrl: url,
        toFile: dest,
      }).promise;

      if (result.statusCode && result.statusCode >= 400) {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
      console.log(`[imageExporter] Successfully downloaded from: ${url}`);
      return;
    } catch (error) {
      console.log(`[imageExporter] Download failed for ${url}: ${error}`);
      lastError = error;
    }
  }
  
  console.log(`[imageExporter] All candidates failed. Last error: ${lastError}`);

  throw lastError ?? new Error('Download failed');
};

const resolveImageUriToPath = async (
  uri: string,
  dimensions?: { width: number; height: number },
): Promise<string | null> => {
  if (!uri) {
    return null;
  }

  if (uri.startsWith('data:image/')) {
    return uri;
  }

  try {
    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      const ext = 'jpg';
      const dest = `${
        RNFS.TemporaryDirectoryPath
      }/stikaro_ph_${Date.now()}.${ext}`;
      await (RNFS as any).copyAssetsFileIOS(
        uri,
        dest,
        dimensions?.width ?? 0,
        dimensions?.height ?? 0,
        1,
        ext,
      );
      return dest;
    }

    if (Platform.OS === 'android' && uri.startsWith('file:///android_asset/')) {
      const assetPath = uri.replace('file:///android_asset/', '');
      const ext = guessImageExtension(assetPath, 'png');
      const dest = `${
        RNFS.CachesDirectoryPath
      }/stikaro_asset_${Date.now()}.${ext}`;
      await RNFS.copyFileAssets(assetPath, dest);
      return dest;
    }

    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      // Check if this is a Metro dev-server URL that we can resolve locally
      if (uri.includes('localhost:8081') && uri.includes('/assets/')) {
        console.log(`[imageExporter] Detected Metro URL, trying local resolution: ${uri}`);
        
        // Try the new asset resolution approach first
        try {
          const localPath = await tryAssetResolution(uri);
          if (localPath) {
            console.log(`[imageExporter] Successfully resolved Metro asset locally: ${localPath}`);
            return localPath;
          }
        } catch (error) {
          console.log(`[imageExporter] Asset resolution failed: ${error}`);
        }
        
        // Fallback to the original local resolution approach
        try {
          const assetPath = uri.split('localhost:8081')[1]?.split('?')[0];
          if (assetPath) {
            const localPath = await resolveMetroAssetLocally(assetPath);
            if (localPath) {
              console.log(`[imageExporter] Resolved Metro asset locally (fallback): ${localPath}`);
              return localPath;
            }
          }
        } catch (error) {
          console.log(`[imageExporter] Local resolution (fallback) failed: ${error}`);
        }
        
        // Last resort: HTTP download with our URL rewriting
        console.log(`[imageExporter] Falling back to HTTP download for Metro URL`);
      }
      
      const ext = guessImageExtension(uri, 'jpg');
      const dest = `${
        RNFS.TemporaryDirectoryPath
      }/stikaro_remote_${Date.now()}.${ext}`;

      await downloadRemoteToFile(uri, dest);

      return dest;
    }

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

const drawTextCompat = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  paint: ReturnType<typeof Skia.Paint>,
  font: ReturnType<typeof Skia.Font>,
) => {
  try {
    (canvas as any).drawText(text, x, y, paint, font);
  } catch {
    // ignore
  }

  try {
    (canvas as any).drawText(text, x, y, font, paint);
  } catch {
    // ignore
  }
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

const drawCanvasElement = async (
  canvas: SkCanvas,
  element: CanvasElement,
  scale: CanvasScale,
): Promise<void> => {
  const drawTextWithTransform = async () => {
    const layout = measureTextLayout(element, scale);
    if (!layout) {
      console.warn(
        'Export: skipped text element - failed to measure layout',
        element.id,
        element.textContent,
      );
      return;
    }
    await withElementTransform(
      canvas,
      element,
      {
        width: layout.totalWidth,
        height: layout.totalHeight,
      },
      scale,
      async () => {
        drawTextElement(canvas, element, layout);
      },
    );
  };

  switch (element.type) {
    case 'text': {
      await drawTextWithTransform();
      break;
    }
    case 'watermark': {
      if (!element.assetPath && element.textContent) {
        await drawTextWithTransform();
        break;
      }
      // Fall through to image-based handling when assetPath is present
    }
    case 'sticker':
    case 'stamp': {
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

const measureTextLayout = (
  element: CanvasElement,
  scale: CanvasScale,
): TextLayout | null => {
  const text = element.textContent ?? '';
  if (!text) {
    return null;
  }

  const baseFontSize = element.fontSize ?? 24;
  const scaledFontSize = baseFontSize * scale.x;
  const font = createFont(scaledFontSize, element.fontFamily);
  if (!font) {
    return null;
  }
  const measurement = font.measureText(text);
  const metrics = font.getMetrics();

  const textWidth = measurement.width || scaledFontSize;
  const textHeight =
    metrics.descent - metrics.ascent > 0
      ? metrics.descent - metrics.ascent
      : scaledFontSize;
  const baseline = -metrics.ascent;

  const paddingX = Math.max(baseFontSize * 0.25, 8) * scale.x;
  const paddingY = Math.max(baseFontSize * 0.2, 6) * scale.y;

  const totalWidth = textWidth + paddingX * 2;
  const totalHeight = textHeight + paddingY * 2;

  return {
    font,
    text,
    fontSize: scaledFontSize,
    textWidth,
    textHeight,
    totalWidth,
    totalHeight,
    baseline,
    paddedBaseline: baseline + paddingY,
    paddingX,
    paddingY,
  };
};

const drawTextElement = (
  canvas: SkCanvas,
  element: CanvasElement,
  layout: TextLayout,
) => {
  const { text, font, fontSize, totalWidth, totalHeight } = layout;
  const baseColor = element.color || '#FFFFFF';
  const opacity = Math.max(0, Math.min(element.opacity ?? 1, 1));

  if (element.textBackground) {
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setAntiAlias(true);
    backgroundPaint.setColor(Skia.Color(element.textBackground));
    backgroundPaint.setAlphaf(opacity);
    const rect = Skia.XYWHRect(0, 0, totalWidth, totalHeight);
    const rrect = Skia.RRectXY(rect, fontSize * 0.25, fontSize * 0.25);
    canvas.drawRRect(rrect, backgroundPaint);
  }

  drawTextEffects(canvas, element, layout, baseColor, font, opacity);

  const textPaint = Skia.Paint();
  textPaint.setAntiAlias(true);
  textPaint.setColor(Skia.Color(baseColor));
  textPaint.setAlphaf(opacity);
  drawTextCompat(
    canvas,
    text,
    layout.paddingX,
    layout.paddedBaseline,
    textPaint,
    font,
  );
};

const drawTextEffects = (
  canvas: SkCanvas,
  element: CanvasElement,
  layout: TextLayout,
  baseColor: string,
  font: ReturnType<typeof Skia.Font>,
  opacity: number,
) => {
  const textX = layout.paddingX;
  const textY = layout.paddedBaseline;

  switch (element.textEffect) {
    case 'neon':
      drawGlow(canvas, layout.text, textX, textY, font, baseColor, opacity, {
        radius: layout.fontSize * 0.65,
        opacity: 0.35,
      });
      drawGlow(canvas, layout.text, textX, textY, font, baseColor, opacity, {
        radius: layout.fontSize * 0.35,
        opacity: 0.55,
      });
      break;
    case 'glow':
      drawGlow(canvas, layout.text, textX, textY, font, baseColor, opacity, {
        radius: layout.fontSize * 0.45,
        opacity: 0.4,
      });
      break;
    case 'shadow':
      drawShadow(
        canvas,
        layout.text,
        textX,
        textY,
        font,
        layout.fontSize,
        opacity,
      );
      break;
    case 'outline':
      drawOutline(
        canvas,
        layout.text,
        textX,
        textY,
        font,
        layout.fontSize,
        opacity,
      );
      break;
    default:
      break;
  }
};

const drawGlow = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: ReturnType<typeof Skia.Font>,
  color: string,
  baseOpacity: number,
  options: { radius: number; opacity: number },
) => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  paint.setAlphaf(Math.max(0, Math.min(options.opacity * baseOpacity, 1)));

  const maskFilter = Skia.MaskFilter.MakeBlur(
    (Skia as any).BlurStyle?.Normal,
    Math.max(options.radius, 0.1),
    true,
  );
  if (maskFilter) {
    paint.setMaskFilter(maskFilter);
  }

  drawTextCompat(canvas, text, x, y, paint, font);
};

const drawShadow = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: ReturnType<typeof Skia.Font>,
  fontSize: number,
  baseOpacity: number,
) => {
  const offset = Math.max(fontSize * 0.15, 2);
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color('#000000'));
  paint.setAlphaf(0.6 * baseOpacity);
  drawTextCompat(canvas, text, x + offset, y + offset, paint, font);
};

const drawOutline = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: ReturnType<typeof Skia.Font>,
  fontSize: number,
  baseOpacity: number,
) => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color('#000000'));
  paint.setAlphaf(0.85 * baseOpacity);

  const offsets = [-1, 0, 1];
  const distance = Math.max(fontSize * 0.08, 1);

  for (const dx of offsets) {
    for (const dy of offsets) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      canvas.drawText(text, x + dx * distance, y + dy * distance, paint, font);
    }
  }
};

const drawImageElement = async (
  canvas: SkCanvas,
  element: CanvasElement,
  size: ElementSize,
): Promise<void> => {
  if (!element.assetPath) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(
        'Export debug - skipping element (no assetPath):',
        element.id,
        element.type,
      );
    }
    return;
  }

  const image = await getImageFromCache(element.assetPath);
  if (!image) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(
        'Export debug - failed to load image:',
        element.id,
        element.assetPath,
      );
    }
    return;
  }

  if (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    element.type === 'watermark'
  ) {
    console.log('Export debug - drawing watermark:', {
      id: element.id,
      opacity: element.opacity,
      size,
      assetPath: element.assetPath,
    });
  }

  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  // Apply opacity if specified (for watermarks and other elements)
  if (element.opacity !== undefined && element.opacity < 1) {
    paint.setAlphaf(Math.max(0, Math.min(element.opacity, 1)));
  }

  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const dstRect = Skia.XYWHRect(0, 0, size.width, size.height);
  canvas.drawImageRect(image, srcRect, dstRect, paint);
};

const drawWatermark = (
  canvas: SkCanvas,
  canvasWidth: number,
  canvasHeight: number,
  scale: CanvasScale,
) => {
  const scaleFactor = Math.max(scale.x, scale.y);
  const font = createFont(WATERMARK_FONT_SIZE * scaleFactor);
  if (!font) {
    return;
  }
  const metrics = font.getMetrics();
  const textWidth = font.measureText(STIKARO_WATERMARK_TEXT).width;
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color('#FFFFFF'));
  paint.setAlphaf(WATERMARK_OPACITY);

  const paddingX = WATERMARK_PADDING * scale.x;
  const paddingY = WATERMARK_PADDING * scale.y;

  const x = canvasWidth - textWidth - paddingX;
  const baseline = canvasHeight - paddingY - metrics.descent;
  drawTextCompat(canvas, STIKARO_WATERMARK_TEXT, x, baseline, paint, font);
};
