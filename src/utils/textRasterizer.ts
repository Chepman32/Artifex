// Utility to rasterize text-based watermark elements into image-based watermark elements

import { Skia } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import type { CanvasElement } from '../types';

const createFont = (size: number, family?: string) => {
  try {
    const SkiaTypeface = Skia.Typeface as any;
    let typeface: any = null;

    if (family && family !== 'System') {
      typeface = SkiaTypeface.MakeFromName?.(family) ?? null;
    }

    if (!typeface && typeof SkiaTypeface.MakeDefault === 'function') {
      typeface = SkiaTypeface.MakeDefault();
    }

    // Try to create font with typeface, or without if typeface is not available
    let font;
    if (typeface) {
      font = Skia.Font(typeface, size);
    } else {
      // Fallback: try using FontMgr to get system font
      const fontMgr = (Skia as any).FontMgr?.System?.();
      if (fontMgr) {
        const familyCount = fontMgr.countFamilies();
        if (familyCount > 0) {
          const firstFamily = fontMgr.getFamilyName(0);
          const matchedTypeface = fontMgr.matchFamilyStyle(firstFamily, { weight: 400, width: 5, slant: 0 });
          if (matchedTypeface) {
            font = Skia.Font(matchedTypeface, size);
          }
        }
      }
    }

    if (!font) {
      console.warn('[textRasterizer] Failed to create font');
      return null;
    }

    if (typeof font.setEdging === 'function') {
      const FontEdging = (Skia as any).FontEdging;
      if (FontEdging && typeof FontEdging.SubpixelAntialias !== 'undefined') {
        font.setEdging(FontEdging.SubpixelAntialias);
      }
    }
    return font;
  } catch (error) {
    console.error('[textRasterizer] createFont error:', error);
    return null;
  }
};

export const rasterizeTextElementToWatermark = async (
  element: CanvasElement,
): Promise<CanvasElement> => {
  const text = element.textContent ?? '';
  const baseFontSize = element.fontSize ?? 24;
  const font = createFont(baseFontSize, element.fontFamily);
  if (!font || !text) {
    return element;
  }

  const measurement = font.measureText(text);
  const metrics = font.getMetrics();
  const textWidth = measurement.width || baseFontSize;
  const textHeight =
    metrics.descent - metrics.ascent > 0
      ? metrics.descent - metrics.ascent
      : baseFontSize;

  const paddingX = Math.max(baseFontSize * 0.25, 8);
  const paddingY = Math.max(baseFontSize * 0.2, 6);

  const totalWidth = Math.ceil(textWidth + paddingX * 2);
  const totalHeight = Math.ceil(textHeight + paddingY * 2);

  const surface = Skia.Surface.Make(totalWidth, totalHeight);
  if (!surface) {
    return element;
  }

  const canvas = surface.getCanvas();
  const bgOpacity = element.textBackground ? Math.max(0, Math.min(element.opacity ?? 1, 1)) : 0;
  const textOpacity = Math.max(0, Math.min(element.opacity ?? 1, 1));

  canvas.clear(Skia.Color('#00000000'));

  if (element.textBackground) {
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setAntiAlias(true);
    backgroundPaint.setColor(Skia.Color(element.textBackground));
    backgroundPaint.setAlphaf(bgOpacity);
    const rect = Skia.XYWHRect(0, 0, totalWidth, totalHeight);
    const radius = baseFontSize * 0.25;
    const rrect = Skia.RRectXY(rect, radius, radius);
    canvas.drawRRect(rrect, backgroundPaint);
  }

  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(element.color || '#FFFFFF'));
  paint.setAlphaf(textOpacity);

  const baseline = -metrics.ascent + paddingY;
  canvas.drawText(text, paddingX, baseline, paint, font);

  const snapshot = surface.makeImageSnapshot();
  const base64 = snapshot.encodeToBase64();
  const filename = `stikaro_wm_text_${Date.now()}.png`;
  
  const tempDir = `${RNFS.CachesDirectoryPath}/stikaro_temp`;
  await RNFS.mkdir(tempDir);
  
  const filepath = `${tempDir}/${filename}`;
  await RNFS.writeFile(filepath, base64, 'base64');

  return {
    id: element.id,
    type: 'watermark',
    position: element.position,
    scale: 1,
    rotation: element.rotation,
    width: totalWidth,
    height: totalHeight,
    opacity: element.opacity,
    assetPath: filepath,
  };
};


