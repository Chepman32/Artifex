import Foundation
import CoreGraphics

// MARK: - Asset Types

struct AssetItem: Identifiable {
    let id: String
    let name: String
    let assetName: String  // Name in xcassets or bundle
    let category: String
    let isPro: Bool
    var width: CGFloat?
    var height: CGFloat?
}

struct FontAsset: Identifiable {
    let id: String
    let name: String
    let family: String
    let isPro: Bool
}

struct AssetCategory: Identifiable {
    let id: String
    let label: String
}

// MARK: - Asset Catalog

enum AssetCatalog {

    // MARK: - Fonts

    static let freeFonts: [FontAsset] = [
        FontAsset(id: "system", name: "System", family: "System", isPro: false),
        FontAsset(id: "sf-pro", name: "SF Pro", family: "SF Pro Display", isPro: false),
        FontAsset(id: "helvetica", name: "Helvetica", family: "Helvetica", isPro: false),
        FontAsset(id: "arial", name: "Arial", family: "Arial", isPro: false),
        FontAsset(id: "times", name: "Times", family: "Times New Roman", isPro: false),
        FontAsset(id: "courier", name: "Courier", family: "Courier New", isPro: false),
        FontAsset(id: "georgia", name: "Georgia", family: "Georgia", isPro: false),
        FontAsset(id: "verdana", name: "Verdana", family: "Verdana", isPro: false),
    ]

    static let proFonts: [FontAsset] = [
        FontAsset(id: "playfair", name: "Playfair Display", family: "Playfair Display", isPro: false),
        FontAsset(id: "montserrat", name: "Montserrat", family: "Montserrat", isPro: false),
        FontAsset(id: "roboto", name: "Roboto", family: "Roboto", isPro: false),
        FontAsset(id: "lato", name: "Lato", family: "Lato", isPro: false),
        FontAsset(id: "open-sans", name: "Open Sans", family: "Open Sans", isPro: false),
        FontAsset(id: "source-sans", name: "Source Sans Pro", family: "Source Sans Pro", isPro: false),
        FontAsset(id: "poppins", name: "Poppins", family: "Poppins", isPro: false),
        FontAsset(id: "nunito", name: "Nunito", family: "Nunito", isPro: false),
        FontAsset(id: "raleway", name: "Raleway", family: "Raleway", isPro: false),
        FontAsset(id: "inter", name: "Inter", family: "Inter", isPro: false),
        FontAsset(id: "work-sans", name: "Work Sans", family: "Work Sans", isPro: false),
        FontAsset(id: "dm-sans", name: "DM Sans", family: "DM Sans", isPro: false),
        FontAsset(id: "space-grotesk", name: "Space Grotesk", family: "Space Grotesk", isPro: false),
        FontAsset(id: "manrope", name: "Manrope", family: "Manrope", isPro: false),
        FontAsset(id: "plus-jakarta", name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", isPro: false),
        FontAsset(id: "satoshi", name: "Satoshi", family: "Satoshi", isPro: false),
        FontAsset(id: "cabinet-grotesk", name: "Cabinet Grotesk", family: "Cabinet Grotesk", isPro: false),
        FontAsset(id: "clash-display", name: "Clash Display", family: "Clash Display", isPro: false),
        FontAsset(id: "general-sans", name: "General Sans", family: "General Sans", isPro: false),
        FontAsset(id: "switzer", name: "Switzer", family: "Switzer", isPro: false),
        FontAsset(id: "sf-compact", name: "SF Compact", family: "SF Compact Display", isPro: false),
        FontAsset(id: "neue-haas", name: "Neue Haas Grotesk", family: "Neue Haas Grotesk", isPro: false),
    ]

    static var allFonts: [FontAsset] { freeFonts + proFonts }

    // MARK: - Stickers

    static let freeStickers: [AssetItem] = [
        // Emoji
        AssetItem(id: "s1", name: "Heart", assetName: "heart", category: "emoji", isPro: false),
        AssetItem(id: "s2", name: "I Love You", assetName: "i-love-you", category: "emoji", isPro: false),
        AssetItem(id: "s3", name: "Valentines Day", assetName: "valentines-day", category: "emoji", isPro: false),
        // Social Media
        AssetItem(id: "s4", name: "Check It Out", assetName: "check-it-out", category: "social-media", isPro: false),
        AssetItem(id: "s5", name: "Follow Us", assetName: "follow-us", category: "social-media", isPro: false),
        AssetItem(id: "s6", name: "Link In Bio", assetName: "link-in-bio", category: "social-media", isPro: false),
        AssetItem(id: "s7", name: "Send Mail", assetName: "send-mail", category: "social-media", isPro: false),
        AssetItem(id: "s8", name: "After", assetName: "after", category: "social-media", isPro: false),
        AssetItem(id: "s9", name: "New Reel", assetName: "new-reel", category: "social-media", isPro: false),
        // Text Labels
        AssetItem(id: "s10", name: "Thank You", assetName: "thank-you", category: "text-labels", isPro: false),
        AssetItem(id: "s11", name: "Lettering", assetName: "lettering-1", category: "text-labels", isPro: false),
        AssetItem(id: "s12", name: "Attention Please", assetName: "attention-please", category: "text-labels", isPro: false),
        AssetItem(id: "s13", name: "Nice", assetName: "nice", category: "text-labels", isPro: false),
        AssetItem(id: "s14", name: "Free Banner", assetName: "free-banner", category: "text-labels", isPro: false),
        AssetItem(id: "s15", name: "Free Label", assetName: "free-label", category: "text-labels", isPro: false),
        AssetItem(id: "s16", name: "New Product", assetName: "new-product", category: "text-labels", isPro: false),
        AssetItem(id: "s17", name: "Sticker Design", assetName: "sticker-design", category: "text-labels", isPro: false),
        // Seasonal
        AssetItem(id: "s18", name: "Halloween Ghost", assetName: "halloween-ghost", category: "seasonal", isPro: false),
        AssetItem(id: "s19", name: "Halloween Ghost with Pumpkin", assetName: "halloween-ghost-pumpkin", category: "seasonal", isPro: false),
        AssetItem(id: "s20", name: "Halloween Pumpkin", assetName: "halloween-pumpkin", category: "seasonal", isPro: false),
        AssetItem(id: "s21", name: "Christmas Santa", assetName: "christmas-santa", category: "seasonal", isPro: false),
        AssetItem(id: "s22", name: "Thank You Flowers", assetName: "thank-you-flowers", category: "seasonal", isPro: false),
        // Brand Icons
        AssetItem(id: "s23", name: "Facebook", assetName: "facebook", category: "brand-icons", isPro: false),
        AssetItem(id: "s24", name: "Apple", assetName: "apple", category: "brand-icons", isPro: false),
        AssetItem(id: "s25", name: "Instagram", assetName: "Instagram", category: "brand-icons", isPro: false),
        // Food
        AssetItem(id: "s26", name: "Smoothie Drink", assetName: "drink-smoothie", category: "food", isPro: false),
        // Miscellaneous
        AssetItem(id: "s27", name: "Download Folder", assetName: "download-folder", category: "miscellaneous", isPro: false),
        AssetItem(id: "s28", name: "Cool Text", assetName: "cool-text", category: "miscellaneous", isPro: false),
        AssetItem(id: "s29", name: "Sticker Icon", assetName: "sticker-icon", category: "miscellaneous", isPro: false),
    ]

    static let proStickers: [AssetItem] = []

    static var allStickers: [AssetItem] { freeStickers + proStickers }

    // MARK: - Watermark Templates

    static let freeWatermarks: [AssetItem] = [
        AssetItem(id: "w1", name: "Simple Text", assetName: "text:© Your Name", category: "signature", isPro: false, width: 200, height: 40),
        AssetItem(id: "w2", name: "Website URL", assetName: "text:www.yoursite.com", category: "signature", isPro: false, width: 180, height: 30),
        AssetItem(id: "w3", name: "Photo Credit", assetName: "text:Photo by You", category: "signature", isPro: false, width: 150, height: 25),
        AssetItem(id: "w4", name: "Brand Name", assetName: "text:YOUR BRAND", category: "logo", isPro: false, width: 160, height: 35),
        AssetItem(id: "w5", name: "Social Handle", assetName: "text:@yourusername", category: "signature", isPro: false, width: 140, height: 30),
        AssetItem(id: "w6", name: "Copyright", assetName: "text:© 2025 All Rights Reserved", category: "signature", isPro: false, width: 220, height: 25),
        AssetItem(id: "w7", name: "Made With Love", assetName: "text:Made with ❤️", category: "badge", isPro: false, width: 120, height: 30),
        AssetItem(id: "w8", name: "Professional", assetName: "text:PROFESSIONAL PHOTOGRAPHY", category: "badge", isPro: false, width: 250, height: 20),
        AssetItem(id: "w9", name: "Studio Name", assetName: "text:Your Studio", category: "logo", isPro: false, width: 130, height: 40),
        AssetItem(id: "w10", name: "Date Stamp", assetName: "text:2025", category: "stamp", isPro: false, width: 60, height: 25),
    ]

    static let proWatermarks: [AssetItem] = [
        AssetItem(id: "pw1", name: "Elegant Script", assetName: "text:Elegant Signature", category: "signature", isPro: false, width: 200, height: 50),
        AssetItem(id: "pw2", name: "Modern Logo", assetName: "text:MODERN BRAND", category: "logo", isPro: false, width: 180, height: 60),
    ]

    static var allWatermarks: [AssetItem] { freeWatermarks + proWatermarks }

    // MARK: - Stamps

    static let freeStamps: [AssetItem] = [
        AssetItem(id: "approved-147677", name: "Approved", assetName: "approved-147677_640", category: "approval", isPro: false, width: 80, height: 80),
        AssetItem(id: "approved-1966719", name: "Approved Alt", assetName: "approved-1966719_640", category: "approval", isPro: false, width: 80, height: 80),
        AssetItem(id: "approved-1966719-1", name: "Approved Alt 2", assetName: "approved-1966719_640-1", category: "approval", isPro: false, width: 80, height: 80),
        AssetItem(id: "draft", name: "Draft", assetName: "draft-160133_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "original", name: "Original", assetName: "original-160130_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "paid-160126", name: "Paid", assetName: "paid-160126_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "received", name: "Received", assetName: "received-160122_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "red-stamp", name: "Red Stamp", assetName: "red-42286_640", category: "seals", isPro: false, width: 80, height: 80),
        AssetItem(id: "seal", name: "Seal", assetName: "seal-1771694_640", category: "seals", isPro: false, width: 80, height: 80),
    ]

    static let proStamps: [AssetItem] = [
        AssetItem(id: "best-seller", name: "Best Seller", assetName: "best-seller-158885_1280", category: "labels", isPro: false, width: 100, height: 100),
        AssetItem(id: "cancelled", name: "Cancelled", assetName: "cancelled-5250908_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "do-not-copy", name: "Do Not Copy", assetName: "do-not-copy-160138_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "label", name: "Label", assetName: "label-5419657_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "paid-alt", name: "Paid Alt", assetName: "paid-5025785_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "quality-1", name: "Quality", assetName: "quality-5254406_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "quality-2", name: "Quality Alt", assetName: "quality-5254458_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "real-stamp", name: "Real Stamp", assetName: "real-stamp-7823814_640", category: "seals", isPro: false, width: 80, height: 80),
        AssetItem(id: "sold", name: "Sold", assetName: "sold-5250892_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "stamp", name: "Stamp", assetName: "stamp-161691_640", category: "seals", isPro: false, width: 80, height: 80),
        AssetItem(id: "success", name: "Success", assetName: "success-5025797_640", category: "labels", isPro: false, width: 80, height: 80),
        AssetItem(id: "winner", name: "Winner", assetName: "winner-5257940_640", category: "labels", isPro: false, width: 80, height: 80),
    ]

    static var allStamps: [AssetItem] { freeStamps + proStamps }

    // MARK: - Categories

    static let stickerCategories: [AssetCategory] = [
        AssetCategory(id: "all", label: "All"),
        AssetCategory(id: "emoji", label: "Emoji"),
        AssetCategory(id: "social-media", label: "Social Media"),
        AssetCategory(id: "text-labels", label: "Text & Labels"),
        AssetCategory(id: "seasonal", label: "Seasonal"),
        AssetCategory(id: "brand-icons", label: "Brand Icons"),
        AssetCategory(id: "food", label: "Food"),
        AssetCategory(id: "miscellaneous", label: "Miscellaneous"),
    ]

    static let watermarkCategories: [AssetCategory] = [
        AssetCategory(id: "all", label: "All"),
        AssetCategory(id: "signature", label: "Signature"),
        AssetCategory(id: "logo", label: "Logo"),
        AssetCategory(id: "badge", label: "Badge"),
        AssetCategory(id: "stamp", label: "Stamp"),
    ]

    static let stampCategories: [AssetCategory] = [
        AssetCategory(id: "all", label: "All"),
        AssetCategory(id: "approval", label: "Approval"),
        AssetCategory(id: "labels", label: "Labels"),
        AssetCategory(id: "seals", label: "Seals"),
    ]
}
