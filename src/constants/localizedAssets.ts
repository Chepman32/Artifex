import type { Language } from '../localization';
import { STICKERS, STAMPS, type AssetItem } from './assets';
import { localizedArtwork } from './localizedArtwork';

// Resolve when opening a picker. Existing canvas elements keep their selected
// image URI, so changing the app language does not rewrite saved designs.
const localize = (
  assets: AssetItem[],
  kind: 'stickers' | 'stamps',
  language: Language,
): AssetItem[] =>
  assets.map(asset => {
    const artwork = localizedArtwork[language]?.[`${kind}/${asset.id}`];
    return artwork ? { ...asset, ...artwork } : asset;
  });

export const getLocalizedStickers = (language: Language): AssetItem[] =>
  localize([...STICKERS.free, ...STICKERS.pro], 'stickers', language);

export const getLocalizedStamps = (language: Language): AssetItem[] =>
  localize([...STAMPS.free, ...STAMPS.pro], 'stamps', language);
