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

// Local sticker assets from src/assets/stickers
export const STICKERS: { free: AssetItem[]; pro: AssetItem[] } = {
  free: [
    {
      id: 's1',
      name: 'Heart',
      file: require('../assets/stickers/heart.png'),
      category: 'emoji',
      isPro: false,
    },
    {
      id: 's2',
      name: 'I Love You',
      file: require('../assets/stickers/i-love-you.png'),
      category: 'emoji',
      isPro: false,
    },
    {
      id: 's3',
      name: 'Check It Out',
      file: require('../assets/stickers/check-it-out.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's4',
      name: 'Follow Us',
      file: require('../assets/stickers/follow-us.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's5',
      name: 'Link In Bio',
      file: require('../assets/stickers/link-in-bio.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's6',
      name: 'Send Mail',
      file: require('../assets/stickers/send-mail.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's7',
      name: 'Thank You',
      file: require('../assets/stickers/thank-you.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's8',
      name: 'After',
      file: require('../assets/stickers/after.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's9',
      name: 'New Reel',
      file: require('../assets/stickers/new-reel.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's10',
      name: 'New Reel Alt',
      file: require('../assets/stickers/new-reel (1).png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's11',
      name: 'Free Sticker',
      file: require('../assets/stickers/free-sticker-style-word-png-banner-use-hd-mobile-800383.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's12',
      name: 'Lettering',
      file: require('../assets/stickers/lettering.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's13',
      name: 'Lettering Alt',
      file: require('../assets/stickers/lettering (1).png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's14',
      name: 'Attention Please',
      file: require('../assets/stickers/pngtree-attention-please-label-sticker-png-image_6834043.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's15',
      name: 'Nice Sticker',
      file: require('../assets/stickers/pngtree-nice-sticker-vector-ilustration-png-image_6209337.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's16',
      name: 'Sticker Design',
      file: require('../assets/stickers/pngtree-sticker-design-png-image_15189579.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's17',
      name: 'Halloween Ghost',
      file: require('../assets/stickers/pngtree-halloween-cartoon-ghost.png'),
      category: 'animals',
      isPro: false,
    },
    {
      id: 's18',
      name: 'Halloween Ghost with Pumpkin',
      file: require('../assets/stickers/pngtree-halloween-cartoon-ghost-holding-pumpkin-png-image_14000819.png'),
      category: 'animals',
      isPro: false,
    },
    {
      id: 's19',
      name: 'Valentines Day',
      file: require('../assets/stickers/pngtree-valentines-day-greeting-card-sticker-typography-cute-pinky-vector-png-image_14657494.png'),
      category: 'emoji',
      isPro: false,
    },
    {
      id: 's20',
      name: 'New Product Label',
      file: require('../assets/stickers/pngtree-circular-sticker-new-product-label-vector-diagram-png-image_4398889.jpeg'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's21',
      name: 'Facebook Sticker',
      file: require('../assets/stickers/509-5091838_stickers-de-facebook-png-7-png-image-facebook.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's22',
      name: 'Sticker Icon',
      file: require('../assets/stickers/sticker-download-icon-png-favpng.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's23',
      name: 'Unnamed',
      file: require('../assets/stickers/unnamed.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's24',
      name: 'Image 1',
      file: require('../assets/stickers/images.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's25',
      name: 'Image 2',
      file: require('../assets/stickers/images.jpeg'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's26',
      name: 'Image 3',
      file: require('../assets/stickers/images (1).jpeg'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's27',
      name: 'Image 4',
      file: require('../assets/stickers/images (2).jpeg'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's28',
      name: 'Image 5',
      file: require('../assets/stickers/images (3).jpeg'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's29',
      name: 'Sticker 25411',
      file: require('../assets/stickers/25411.png'),
      category: 'objects',
      isPro: false,
    },
    {
      id: 's30',
      name: 'Sticker 8819113',
      file: require('../assets/stickers/8819113.png'),
      category: 'objects',
      isPro: false,
    },
  ],
  pro: [
    // Premium stickers - can be added later
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
