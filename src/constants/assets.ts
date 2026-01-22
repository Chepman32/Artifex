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
      isPro: false,
    },
    { id: 'montserrat', name: 'Montserrat', family: 'Montserrat', isPro: false },
    { id: 'roboto', name: 'Roboto', family: 'Roboto', isPro: false },
    { id: 'lato', name: 'Lato', family: 'Lato', isPro: false },
    { id: 'open-sans', name: 'Open Sans', family: 'Open Sans', isPro: false },
    {
      id: 'source-sans',
      name: 'Source Sans Pro',
      family: 'Source Sans Pro',
      isPro: false,
    },
    { id: 'poppins', name: 'Poppins', family: 'Poppins', isPro: false },
    { id: 'nunito', name: 'Nunito', family: 'Nunito', isPro: false },
    { id: 'raleway', name: 'Raleway', family: 'Raleway', isPro: false },
    { id: 'inter', name: 'Inter', family: 'Inter', isPro: false },
    { id: 'work-sans', name: 'Work Sans', family: 'Work Sans', isPro: false },
    { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans', isPro: false },
    {
      id: 'space-grotesk',
      name: 'Space Grotesk',
      family: 'Space Grotesk',
      isPro: false,
    },
    { id: 'manrope', name: 'Manrope', family: 'Manrope', isPro: false },
    {
      id: 'plus-jakarta',
      name: 'Plus Jakarta Sans',
      family: 'Plus Jakarta Sans',
      isPro: false,
    },
    { id: 'satoshi', name: 'Satoshi', family: 'Satoshi', isPro: false },
    {
      id: 'cabinet-grotesk',
      name: 'Cabinet Grotesk',
      family: 'Cabinet Grotesk',
      isPro: false,
    },
    {
      id: 'clash-display',
      name: 'Clash Display',
      family: 'Clash Display',
      isPro: false,
    },
    {
      id: 'general-sans',
      name: 'General Sans',
      family: 'General Sans',
      isPro: false,
    },
    { id: 'switzer', name: 'Switzer', family: 'Switzer', isPro: false },
    {
      id: 'sf-compact',
      name: 'SF Compact',
      family: 'SF Compact Display',
      isPro: false,
    },
    {
      id: 'neue-haas',
      name: 'Neue Haas Grotesk',
      family: 'Neue Haas Grotesk',
      isPro: false,
    },
  ],
};

// Local sticker assets from src/assets/stickers
export const STICKERS: { free: AssetItem[]; pro: AssetItem[] } = {
  free: [
    // Emoji Category
    {
      id: 's1',
      name: 'Heart',
      file: require('../assets/stickers/emoji/heart.png'),
      category: 'emoji',
      isPro: false,
    },
    {
      id: 's2',
      name: 'I Love You',
      file: require('../assets/stickers/emoji/i-love-you.png'),
      category: 'emoji',
      isPro: false,
    },
    {
      id: 's3',
      name: 'Valentines Day',
      file: require('../assets/stickers/emoji/valentines-day.png'),
      category: 'emoji',
      isPro: false,
    },
    // Social Media Category
    {
      id: 's4',
      name: 'Check It Out',
      file: require('../assets/stickers/social-media/check-it-out.png'),
      category: 'social-media',
      isPro: false,
    },
    {
      id: 's5',
      name: 'Follow Us',
      file: require('../assets/stickers/social-media/follow-us.png'),
      category: 'social-media',
      isPro: false,
    },
    {
      id: 's6',
      name: 'Link In Bio',
      file: require('../assets/stickers/social-media/link-in-bio.png'),
      category: 'social-media',
      isPro: false,
    },
    {
      id: 's7',
      name: 'Send Mail',
      file: require('../assets/stickers/social-media/send-mail.png'),
      category: 'social-media',
      isPro: false,
    },
    {
      id: 's8',
      name: 'After',
      file: require('../assets/stickers/social-media/after.png'),
      category: 'social-media',
      isPro: false,
    },
    {
      id: 's9',
      name: 'New Reel',
      file: require('../assets/stickers/social-media/new-reel.png'),
      category: 'social-media',
      isPro: false,
    },
    // Text Labels Category
    {
      id: 's10',
      name: 'Thank You',
      file: require('../assets/stickers/text-labels/thank-you.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's11',
      name: 'Lettering',
      file: require('../assets/stickers/text-labels/lettering-1.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's12',
      name: 'Attention Please',
      file: require('../assets/stickers/text-labels/attention-please.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's13',
      name: 'Nice',
      file: require('../assets/stickers/text-labels/nice.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's14',
      name: 'Free Banner',
      file: require('../assets/stickers/text-labels/free-banner.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's15',
      name: 'Free Label',
      file: require('../assets/stickers/text-labels/free-label.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's16',
      name: 'New Product',
      file: require('../assets/stickers/text-labels/new-product.png'),
      category: 'text-labels',
      isPro: false,
    },
    {
      id: 's17',
      name: 'Sticker Design',
      file: require('../assets/stickers/text-labels/sticker-design.png'),
      category: 'text-labels',
      isPro: false,
    },
    // Seasonal Category
    {
      id: 's18',
      name: 'Halloween Ghost',
      file: require('../assets/stickers/seasonal/halloween-ghost.png'),
      category: 'seasonal',
      isPro: false,
    },
    {
      id: 's19',
      name: 'Halloween Ghost with Pumpkin',
      file: require('../assets/stickers/seasonal/halloween-ghost-pumpkin.png'),
      category: 'seasonal',
      isPro: false,
    },
    {
      id: 's20',
      name: 'Halloween Pumpkin',
      file: require('../assets/stickers/seasonal/halloween-pumpkin.png'),
      category: 'seasonal',
      isPro: false,
    },
    {
      id: 's21',
      name: 'Christmas Santa',
      file: require('../assets/stickers/seasonal/christmas-santa.png'),
      category: 'seasonal',
      isPro: false,
    },
    {
      id: 's22',
      name: 'Thank You Flowers',
      file: require('../assets/stickers/seasonal/thank-you-flowers.png'),
      category: 'seasonal',
      isPro: false,
    },
    // Brand Icons Category
    {
      id: 's23',
      name: 'Facebook',
      file: require('../assets/stickers/brand-icons/facebook.png'),
      category: 'brand-icons',
      isPro: false,
    },
    {
      id: 's24',
      name: 'Apple',
      file: require('../assets/stickers/brand-icons/apple.png'),
      category: 'brand-icons',
      isPro: false,
    },
    {
      id: 's25',
      name: 'Instagram',
      file: require('../assets/stickers/brand-icons/Instagram.png'),
      category: 'brand-icons',
      isPro: false,
    },
    // Food Category
    {
      id: 's26',
      name: 'Smoothie Drink',
      file: require('../assets/stickers/food/drink-smoothie.png'),
      category: 'food',
      isPro: false,
    },
    // Miscellaneous Category
    {
      id: 's27',
      name: 'Download Folder',
      file: require('../assets/stickers/miscellaneous/download-folder.png'),
      category: 'miscellaneous',
      isPro: false,
    },
    {
      id: 's28',
      name: 'Cool Text',
      file: require('../assets/stickers/miscellaneous/cool-text.png'),
      category: 'miscellaneous',
      isPro: false,
    },
    {
      id: 's29',
      name: 'Sticker Icon',
      file: require('../assets/stickers/miscellaneous/sticker-icon.png'),
      category: 'miscellaneous',
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
      isPro: false,
      width: 200,
      height: 50,
    },
    {
      id: 'pw2',
      name: 'Modern Logo',
      uri: 'text:MODERN BRAND',
      category: 'logo',
      isPro: false,
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
      id: 'approved-147677',
      name: 'Approved',
      file: require('../assets/stamps/approved-147677_640.png'),
      category: 'approval',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'approved-1966719',
      name: 'Approved Alt',
      file: require('../assets/stamps/approved-1966719_640.png'),
      category: 'approval',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'approved-1966719-1',
      name: 'Approved Alt 2',
      file: require('../assets/stamps/approved-1966719_640 (1).png'),
      category: 'approval',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'draft',
      name: 'Draft',
      file: require('../assets/stamps/draft-160133_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'original',
      name: 'Original',
      file: require('../assets/stamps/original-160130_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'paid-160126',
      name: 'Paid',
      file: require('../assets/stamps/paid-160126_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'received',
      name: 'Received',
      file: require('../assets/stamps/received-160122_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'red-stamp',
      name: 'Red Stamp',
      file: require('../assets/stamps/red-42286_640.png'),
      category: 'seals',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'seal',
      name: 'Seal',
      file: require('../assets/stamps/seal-1771694_640.png'),
      category: 'seals',
      isPro: false,
      width: 80,
      height: 80,
    },
  ],
  pro: [
    {
      id: 'best-seller',
      name: 'Best Seller',
      file: require('../assets/stamps/best-seller-158885_1280.png'),
      category: 'labels',
      isPro: false,
      width: 100,
      height: 100,
    },
    {
      id: 'cancelled',
      name: 'Cancelled',
      file: require('../assets/stamps/cancelled-5250908_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'do-not-copy',
      name: 'Do Not Copy',
      file: require('../assets/stamps/do-not-copy-160138_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'label',
      name: 'Label',
      file: require('../assets/stamps/label-5419657_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'paid-alt',
      name: 'Paid Alt',
      file: require('../assets/stamps/paid-5025785_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'quality-1',
      name: 'Quality',
      file: require('../assets/stamps/quality-5254406_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'quality-2',
      name: 'Quality Alt',
      file: require('../assets/stamps/quality-5254458_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'real-stamp',
      name: 'Real Stamp',
      file: require('../assets/stamps/real-stamp-7823814_640.png'),
      category: 'seals',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'sold',
      name: 'Sold',
      file: require('../assets/stamps/sold-5250892_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'stamp',
      name: 'Stamp',
      file: require('../assets/stamps/stamp-161691_640.png'),
      category: 'seals',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'success',
      name: 'Success',
      file: require('../assets/stamps/success-5025797_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
    {
      id: 'winner',
      name: 'Winner',
      file: require('../assets/stamps/winner-5257940_640.png'),
      category: 'labels',
      isPro: false,
      width: 80,
      height: 80,
    },
  ],
};

// Asset categories for filtering
export const STICKER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'emoji', label: 'Emoji' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'text-labels', label: 'Text & Labels' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'brand-icons', label: 'Brand Icons' },
  { id: 'food', label: 'Food' },
  { id: 'miscellaneous', label: 'Miscellaneous' },
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
