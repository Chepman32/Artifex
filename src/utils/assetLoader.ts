// Asset loader for managing bundled stickers, fonts, and watermarks

import { MMKV } from 'react-native-mmkv';
import { STICKERS, WATERMARKS, STAMPS, FONTS } from '../constants/assets';
import { useAppStore } from '../stores/appStore';

// MMKV storage for asset caching
const assetStorage = new MMKV({
  id: 'artifex-assets',
  encryptionKey: 'artifex-asset-cache-key',
});

export interface LoadedAsset {
  id: string;
  name: string;
  uri: string;
  localPath?: string;
  category: string;
  isPro: boolean;
  width?: number;
  height?: number;
}

class AssetLoader {
  private loadedStickers: LoadedAsset[] = [];
  private loadedWatermarks: LoadedAsset[] = [];
  private loadedStamps: LoadedAsset[] = [];
  private loadedFonts: any[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing asset loader...');

    try {
      // Load cached asset paths
      await this.loadCachedAssets();

      // Preload free assets
      await this.preloadFreeAssets();

      // Load pro assets if user is pro
      const isProUser = useAppStore.getState().isProUser;
      if (isProUser) {
        await this.preloadProAssets();
      }

      this.isInitialized = true;
      console.log('Asset loader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize asset loader:', error);
    }
  }

  private async loadCachedAssets(): Promise<void> {
    try {
      const cachedStickers = assetStorage.getString('stickers');
      const cachedWatermarks = assetStorage.getString('watermarks');
      const cachedStamps = assetStorage.getString('stamps');

      if (cachedStickers) {
        this.loadedStickers = JSON.parse(cachedStickers);
      }
      if (cachedWatermarks) {
        this.loadedWatermarks = JSON.parse(cachedWatermarks);
      }
      if (cachedStamps) {
        this.loadedStamps = JSON.parse(cachedStamps);
      }
    } catch (error) {
      console.error('Failed to load cached assets:', error);
    }
  }

  private async preloadFreeAssets(): Promise<void> {
    // Convert asset definitions to loaded assets
    this.loadedStickers = [
      ...STICKERS.free.map(sticker => ({
        ...sticker,
        uri: sticker.uri || '',
      })),
    ];

    this.loadedWatermarks = [
      ...WATERMARKS.free.map(watermark => ({
        ...watermark,
        uri: watermark.uri || '',
      })),
    ];

    this.loadedStamps = [
      ...STAMPS.free.map(stamp => ({
        ...stamp,
        uri: stamp.uri || '',
      })),
    ];

    this.loadedFonts = [...FONTS.free];

    // Cache the loaded assets
    this.cacheAssets();
  }

  private async preloadProAssets(): Promise<void> {
    // Add pro assets to loaded collections
    this.loadedStickers.push(
      ...STICKERS.pro.map(sticker => ({
        ...sticker,
        uri: sticker.uri || '',
      })),
    );

    this.loadedWatermarks.push(
      ...WATERMARKS.pro.map(watermark => ({
        ...watermark,
        uri: watermark.uri || '',
      })),
    );

    this.loadedStamps.push(
      ...STAMPS.pro.map(stamp => ({
        ...stamp,
        uri: stamp.uri || '',
      })),
    );

    this.loadedFonts.push(...FONTS.pro);

    // Update cache
    this.cacheAssets();
  }

  private cacheAssets(): void {
    try {
      assetStorage.set('stickers', JSON.stringify(this.loadedStickers));
      assetStorage.set('watermarks', JSON.stringify(this.loadedWatermarks));
      assetStorage.set('stamps', JSON.stringify(this.loadedStamps));
      assetStorage.set('fonts', JSON.stringify(this.loadedFonts));
    } catch (error) {
      console.error('Failed to cache assets:', error);
    }
  }

  // Public getters
  getStickers(category?: string): LoadedAsset[] {
    if (!category || category === 'all') {
      return this.loadedStickers;
    }
    return this.loadedStickers.filter(sticker => sticker.category === category);
  }

  getWatermarks(): LoadedAsset[] {
    return this.loadedWatermarks;
  }

  getStamps(category?: string): LoadedAsset[] {
    if (!category || category === 'all') {
      return this.loadedStamps;
    }
    return this.loadedStamps.filter(stamp => stamp.category === category);
  }

  getFonts(): any[] {
    return this.loadedFonts;
  }

  // Unlock pro assets when user purchases
  async unlockProAssets(): Promise<void> {
    await this.preloadProAssets();
    console.log('Pro assets unlocked and loaded');
  }

  // Clear cache (useful for debugging or reset)
  clearCache(): void {
    assetStorage.clearAll();
    this.loadedStickers = [];
    this.loadedWatermarks = [];
    this.loadedStamps = [];
    this.loadedFonts = [];
    this.isInitialized = false;
  }

  // Get asset by ID
  getAssetById(id: string): LoadedAsset | null {
    const allAssets = [
      ...this.loadedStickers,
      ...this.loadedWatermarks,
      ...this.loadedStamps,
    ];
    return allAssets.find(asset => asset.id === id) || null;
  }

  // Check if asset is available (not locked)
  isAssetAvailable(id: string): boolean {
    const asset = this.getAssetById(id);
    if (!asset) return false;

    const isProUser = useAppStore.getState().isProUser;
    return !asset.isPro || isProUser;
  }
}

// Singleton instance
export const assetLoader = new AssetLoader();

// Initialize on app start
assetLoader.initialize();

// Convenience functions
export const getAvailableStickers = (category?: string) =>
  assetLoader.getStickers(category);

export const getAvailableWatermarks = () => assetLoader.getWatermarks();

export const getAvailableStamps = (category?: string) =>
  assetLoader.getStamps(category);

export const getAvailableFonts = () => assetLoader.getFonts();

export const unlockProAssets = () => assetLoader.unlockProAssets();
