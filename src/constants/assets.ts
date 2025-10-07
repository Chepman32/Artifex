// Asset definitions for stickers, fonts, watermarks, and stamps

export interface AssetItem {
  id: string;
  name: string;
  uri?: string;
  file?: string;
  category: string;
  isPro: boolean;
  width?: number;
  height?: number;
}

export interface FontAsset {
  id: string;
  name: string;
  family: string;
  isPro: boolean;
}

// Free and Pro Fonts
export const FONTS: { free: FontAsset[]; pro: FontAsset[] } = {
  free: [
    { id: 'system', name: 'System', family: 'System', isPro: false },
    { id: 'sf-pro', name: 'SF Pro', family: 'SF Pro Display', isPro: false },
    { id: 'helvetica', name: 'Helvetica', family: 'Helvetica', isPro: false },
    { id: 'arial', name: 'Arial', family: 'Arial', isPro: false },
    { id: 'times', name: 'Times', family: 'Times New Roman', isPro: false },
    { id: 'courier', name: 'Courier', family: 'Courier New', isPro: false },
    { id: 'georgia', name: 'Georgia', family: 'Georgia', isPro: false },
    { id: 'verdana', name: 'Verdana', family: 'Verdana', isPro: false },
  ],
  pro: [
    {
      id: 'playfair',
      name: 'Playfair Display',
      family: 'Playfair Display',
      isPro: true,
    },
    { id: 'montserrat', name: 'Montserrat', family: 'Montserrat', isPro: true },
    { id: 'roboto', name: 'Roboto', family: 'Roboto', isPro: true },
    { id: 'lato', name: 'Lato', family: 'Lato', isPro: true },
    { id: 'open-sans', name: 'Open Sans', family: 'Open Sans', isPro: true },
    {
      id: 'source-sans',
      name: 'Source Sans Pro',
      family: 'Source Sans Pro',
      isPro: true,
    },
    { id: 'poppins', name: 'Poppins', family: 'Poppins', isPro: true },
    { id: 'nunito', name: 'Nunito', family: 'Nunito', isPro: true },
    { id: 'raleway', name: 'Raleway', family: 'Raleway', isPro: true },
    { id: 'inter', name: 'Inter', family: 'Inter', isPro: true },
    { id: 'work-sans', name: 'Work Sans', family: 'Work Sans', isPro: true },
    { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans', isPro: true },
    {
      id: 'space-grotesk',
      name: 'Space Grotesk',
      family: 'Space Grotesk',
      isPro: true,
    },
    { id: 'manrope', name: 'Manrope', family: 'Manrope', isPro: true },
    {
      id: 'plus-jakarta',
      name: 'Plus Jakarta Sans',
      family: 'Plus Jakarta Sans',
      isPro: true,
    },
    { id: 'satoshi', name: 'Satoshi', family: 'Satoshi', isPro: true },
    {
      id: 'cabinet-grotesk',
      name: 'Cabinet Grotesk',
      family: 'Cabinet Grotesk',
      isPro: true,
    },
    {
      id: 'clash-display',
      name: 'Clash Display',
      family: 'Clash Display',
      isPro: true,
    },
    {
      id: 'general-sans',
      name: 'General Sans',
      family: 'General Sans',
      isPro: true,
    },
    { id: 'switzer', name: 'Switzer', family: 'Switzer', isPro: true },
    {
      id: 'sf-compact',
      name: 'SF Compact',
      family: 'SF Compact Display',
      isPro: true,
    },
    {
      id: 'neue-haas',
      name: 'Neue Haas Grotesk',
      family: 'Neue Haas Grotesk',
      isPro: true,
    },
  ],
};

// Mock sticker data (replace with actual bundled assets)
export const STICKERS: { free: AssetItem[]; pro: AssetItem[] } = {
  free: [
    // Emoji category
    {
      id: 's1',
      name: 'Heart',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png',
      category: 'emoji',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's2',
      name: 'Star',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png',
      category: 'emoji',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's3',
      name: 'Fire',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png',
      category: 'emoji',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's4',
      name: 'Sparkles',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png',
      category: 'emoji',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's5',
      name: 'Lightning',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26a1.png',
      category: 'emoji',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Shapes category
    {
      id: 's6',
      name: 'Circle',
      uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzYiIGN5PSIzNiIgcj0iMzAiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+',
      category: 'shapes',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's7',
      name: 'Square',
      uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iNiIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iIzAwN0FGRiIvPgo8L3N2Zz4=',
      category: 'shapes',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's8',
      name: 'Triangle',
      uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM2IDEwTDYyIDU4SDEwTDM2IDEwWiIgZmlsbD0iI0ZGNjUwMCIvPgo8L3N2Zz4=',
      category: 'shapes',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Animals category
    {
      id: 's9',
      name: 'Cat Face',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f431.png',
      category: 'animals',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's10',
      name: 'Dog Face',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f436.png',
      category: 'animals',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Nature category
    {
      id: 's11',
      name: 'Sun',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2600.png',
      category: 'nature',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's12',
      name: 'Moon',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f319.png',
      category: 'nature',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's13',
      name: 'Rainbow',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f308.png',
      category: 'nature',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's14',
      name: 'Cloud',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png',
      category: 'nature',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's15',
      name: 'Flower',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33c.png',
      category: 'nature',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Food category
    {
      id: 's16',
      name: 'Pizza',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f355.png',
      category: 'food',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's17',
      name: 'Coffee',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2615.png',
      category: 'food',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's18',
      name: 'Cake',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f370.png',
      category: 'food',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Objects category
    {
      id: 's19',
      name: 'Camera',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4f7.png',
      category: 'objects',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's20',
      name: 'Music Note',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3b5.png',
      category: 'objects',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's21',
      name: 'Gift',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f381.png',
      category: 'objects',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's22',
      name: 'Crown',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f451.png',
      category: 'objects',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Travel category
    {
      id: 's23',
      name: 'Airplane',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2708.png',
      category: 'travel',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's24',
      name: 'Car',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f697.png',
      category: 'travel',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Sports category
    {
      id: 's25',
      name: 'Soccer Ball',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26bd.png',
      category: 'sports',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's26',
      name: 'Basketball',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3c0.png',
      category: 'sports',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Flags category
    {
      id: 's27',
      name: 'Checkered Flag',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3c1.png',
      category: 'flags',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's28',
      name: 'Rainbow Flag',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3f3-fe0f-200d-1f308.png',
      category: 'flags',
      isPro: false,
      width: 72,
      height: 72,
    },

    // Symbols category
    {
      id: 's29',
      name: 'Peace Sign',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/262e.png',
      category: 'symbols',
      isPro: false,
      width: 72,
      height: 72,
    },
    {
      id: 's30',
      name: 'Infinity',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/267e.png',
      category: 'symbols',
      isPro: false,
      width: 72,
      height: 72,
    },
  ],
  pro: [
    // Premium stickers would go here - using placeholder data for now
    {
      id: 'p1',
      name: 'Premium Heart',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f496.png',
      category: 'premium',
      isPro: true,
      width: 72,
      height: 72,
    },
    {
      id: 'p2',
      name: 'Premium Star',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f31f.png',
      category: 'premium',
      isPro: true,
      width: 72,
      height: 72,
    },
    // ... 68 more premium stickers would be added here
  ],
};

// Watermark templates
export const WATERMARKS: { free: AssetItem[]; pro: AssetItem[] } = {
  free: [
    {
      id: 'w1',
      name: 'Simple Text',
      uri: 'text:© Your Name',
      category: 'signature',
      isPro: false,
      width: 200,
      height: 40,
    },
    {
      id: 'w2',
      name: 'Website URL',
      uri: 'text:www.yoursite.com',
      category: 'signature',
      isPro: false,
      width: 180,
      height: 30,
    },
    {
      id: 'w3',
      name: 'Photo Credit',
      uri: 'text:Photo by You',
      category: 'signature',
      isPro: false,
      width: 150,
      height: 25,
    },
    {
      id: 'w4',
      name: 'Brand Name',
      uri: 'text:YOUR BRAND',
      category: 'logo',
      isPro: false,
      width: 160,
      height: 35,
    },
    {
      id: 'w5',
      name: 'Social Handle',
      uri: 'text:@yourusername',
      category: 'signature',
      isPro: false,
      width: 140,
      height: 30,
    },
    {
      id: 'w6',
      name: 'Copyright',
      uri: 'text:© 2025 All Rights Reserved',
      category: 'signature',
      isPro: false,
      width: 220,
      height: 25,
    },
    {
      id: 'w7',
      name: 'Made With Love',
      uri: 'text:Made with ❤️',
      category: 'badge',
      isPro: false,
      width: 120,
      height: 30,
    },
    {
      id: 'w8',
      name: 'Professional',
      uri: 'text:PROFESSIONAL PHOTOGRAPHY',
      category: 'badge',
      isPro: false,
      width: 250,
      height: 20,
    },
    {
      id: 'w9',
      name: 'Studio Name',
      uri: 'text:Your Studio',
      category: 'logo',
      isPro: false,
      width: 130,
      height: 40,
    },
    {
      id: 'w10',
      name: 'Date Stamp',
      uri: 'text:2025',
      category: 'stamp',
      isPro: false,
      width: 60,
      height: 25,
    },
  ],
  pro: [
    // Premium watermark templates would go here
    {
      id: 'pw1',
      name: 'Elegant Script',
      uri: 'text:Elegant Signature',
      category: 'signature',
      isPro: true,
      width: 200,
      height: 50,
    },
    {
      id: 'pw2',
      name: 'Modern Logo',
      uri: 'text:MODERN BRAND',
      category: 'logo',
      isPro: true,
      width: 180,
      height: 60,
    },
    // ... 28 more premium watermarks would be added here
  ],
};

// Stamp assets (similar to stickers but typically smaller and more badge-like)
export const STAMPS: { free: AssetItem[]; pro: AssetItem[] } = {
  free: [
    {
      id: 'st1',
      name: 'Approved',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2705.png',
      category: 'approval',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st2',
      name: 'Verified',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2714.png',
      category: 'approval',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st3',
      name: 'New',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f195.png',
      category: 'labels',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st4',
      name: 'Hot',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png',
      category: 'labels',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st5',
      name: 'Sale',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3f7.png',
      category: 'labels',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st6',
      name: 'Premium',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f451.png',
      category: 'labels',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st7',
      name: 'Limited',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/23f0.png',
      category: 'labels',
      isPro: false,
      width: 60,
      height: 60,
    },
    {
      id: 'st8',
      name: 'Exclusive',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f512.png',
      category: 'labels',
      isPro: false,
      width: 60,
      height: 60,
    },
  ],
  pro: [
    // Premium stamps would go here
    {
      id: 'pst1',
      name: 'Gold Seal',
      uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3c5.png',
      category: 'seals',
      isPro: true,
      width: 80,
      height: 80,
    },
    // ... 31 more premium stamps would be added here
  ],
};

// Asset categories for filtering
export const STICKER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'emoji', label: 'Emoji' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'animals', label: 'Animals' },
  { id: 'nature', label: 'Nature' },
  { id: 'food', label: 'Food' },
  { id: 'objects', label: 'Objects' },
  { id: 'travel', label: 'Travel' },
  { id: 'sports', label: 'Sports' },
  { id: 'flags', label: 'Flags' },
  { id: 'symbols', label: 'Symbols' },
  { id: 'premium', label: 'Premium' },
];

export const WATERMARK_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'signature', label: 'Signature' },
  { id: 'logo', label: 'Logo' },
  { id: 'badge', label: 'Badge' },
  { id: 'stamp', label: 'Stamp' },
];

export const STAMP_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'approval', label: 'Approval' },
  { id: 'labels', label: 'Labels' },
  { id: 'seals', label: 'Seals' },
];
