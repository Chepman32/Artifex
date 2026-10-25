import type { CanvasElement } from '../types';
import { PREMIUM_ASSET_IDS } from '../constants/premiumAssets';

export class ProRequiredError extends Error {
  constructor() {
    super('This project contains Pro artwork.');
    this.name = 'ProRequiredError';
  }
}

export function requiresProForExport(elements: CanvasElement[]): boolean {
  return elements.some(
    element => element.assetId && PREMIUM_ASSET_IDS.has(element.assetId),
  );
}

export function getExportLogoRect(width: number, height: number) {
  const edge = Math.min(width, height);
  const size = edge * 0.1;
  const padding = edge * 0.025;
  return {
    x: width - size - padding,
    y: height - size - padding,
    width: size,
    height: size,
  };
}
