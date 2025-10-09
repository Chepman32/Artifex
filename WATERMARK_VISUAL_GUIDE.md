# Watermark Tool - Visual Guide

## 🎨 User Interface Flow

```
┌─────────────────────────────────────────┐
│         Editor Screen                    │
│  ┌────────────────────────────────────┐ │
│  │                                     │ │
│  │         Canvas Area                 │ │
│  │      (Image with elements)          │ │
│  │                                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [💧] [T] [🎨] [🔖] [🖼️]               │
│   ↑                                      │
│   Watermark Tool Button                  │
└─────────────────────────────────────────┘
                ↓ (Tap)
┌─────────────────────────────────────────┐
│    Watermark Tool Modal                  │
│  ┌────────────────────────────────────┐ │
│  │ 💧 Watermark Tool                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Watermark Text:                         │
│  ┌────────────────────────────────────┐ │
│  │ © Your Brand                       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [🎨 All] [📐 Coverage] [🔲 Pattern]    │
│  [⚡ Density] [📏 Size] [✨ Style]       │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │ • • • •  │  │ •      • │            │
│  │ • • • •  │  │          │            │
│  │ • • • •  │  │ •      • │            │
│  │ Tile     │  │ Corners  │            │
│  │ Pattern  │  │ Branding │            │
│  └──────────┘  └──────────┘            │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │ •        │  │ •   •    │            │
│  │   •      │  │    •   • │            │
│  │     •    │  │  •     • │            │
│  │ Diagonal │  │ Scattered│            │
│  │ Stripe   │  │ Protection│           │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
                ↓ (Select Preset)
┌─────────────────────────────────────────┐
│    Customization Panel                   │
│  ┌────────────────────────────────────┐ │
│  │ ‹ Back to Presets                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Global Adjustments                      │
│                                          │
│  Opacity                                 │
│  100% ████████████████████░░░░          │
│  [-] [+]                                 │
│                                          │
│  Size                                    │
│  100% ██████████░░░░░░░░░░░░            │
│  [-] [+]                                 │
│                                          │
│  Rotation                                │
│  0°   ██████████░░░░░░░░░░░░            │
│  [-] [+]                                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Selected Preset                    │ │
│  │ Tile Pattern                       │ │
│  │ Dense grid covering entire image   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Apply Watermark               │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                ↓ (Apply)
┌─────────────────────────────────────────┐
│         Editor Screen                    │
│  ┌────────────────────────────────────┐ │
│  │  © Brand  © Brand  © Brand         │ │
│  │                                     │ │
│  │  © Brand  © Brand  © Brand         │ │
│  │         Image with                  │ │
│  │  © Brand  Watermarks © Brand       │ │
│  │                                     │ │
│  │  © Brand  © Brand  © Brand         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [💧] [T] [🎨] [🔖] [🖼️]               │
└─────────────────────────────────────────┘
```

## 📐 Pattern Visualizations

### Grid Pattern

```
┌─────────────────────────┐
│  •    •    •    •    •  │
│                          │
│  •    •    •    •    •  │
│                          │
│  •    •    •    •    •  │
│                          │
│  •    •    •    •    •  │
│                          │
│  •    •    •    •    •  │
└─────────────────────────┘
Evenly distributed grid
Use: Maximum coverage
```

### Diagonal Pattern

```
┌─────────────────────────┐
│  •                       │
│      •                   │
│          •               │
│              •           │
│                  •       │
│                      •   │
│                          │
└─────────────────────────┘
Diagonal line placement
Use: Artistic watermarking
```

### Scattered Pattern

```
┌─────────────────────────┐
│      •         •         │
│                          │
│  •        •              │
│                  •       │
│          •               │
│                      •   │
│  •              •        │
└─────────────────────────┘
Random placement
Use: Natural protection
```

### Corners Pattern

```
┌─────────────────────────┐
│  •                   •  │
│                          │
│                          │
│                          │
│                          │
│                          │
│  •                   •  │
└─────────────────────────┘
Four corner placement
Use: Minimal branding
```

### Edges Pattern

```
┌─────────────────────────┐
│  •   •   •   •   •   •  │
│  •                   •  │
│  •                   •  │
│  •                   •  │
│  •                   •  │
│  •                   •  │
│  •   •   •   •   •   •  │
└─────────────────────────┘
Border distribution
Use: Frame effect
```

### Center Pattern

```
┌─────────────────────────┐
│                          │
│                          │
│                          │
│            •             │
│                          │
│                          │
│                          │
└─────────────────────────┘
Single centered mark
Use: Logo placement
```

### Single Pattern

```
┌─────────────────────────┐
│                          │
│                          │
│                          │
│                          │
│                          │
│                          │
│                      •   │
└─────────────────────────┘
Bottom-right placement
Use: Signature style
```

## 🎛️ Control Visualizations

### Opacity Slider

```
10%  ░░░░░░░░░░░░░░░░░░░░  Very subtle
30%  ████░░░░░░░░░░░░░░░░  Subtle
50%  ██████████░░░░░░░░░░  Balanced
70%  ██████████████░░░░░░  Visible
100% ████████████████████  Prominent
```

### Size Slider

```
50%  ░░░░░░░░░░░░░░░░░░░░  Small
75%  ███████░░░░░░░░░░░░░  Medium-small
100% ██████████░░░░░░░░░░  Normal
150% ███████████████░░░░░  Large
200% ████████████████████  Very large
```

### Rotation Slider

```
-45° ╱                     Tilted left
-30° ╱                     Slight left
-15° ╱                     Minimal left
0°   │                     Straight
+15° ╲                     Minimal right
+30° ╲                     Slight right
+45° ╲                     Tilted right
```

## 📊 Preset Comparison Chart

```
Preset Name          Pattern    Count  Opacity  Size   Rotation
─────────────────────────────────────────────────────────────
Tile Pattern         Grid       20     15-25%   120px  ±15°
Corner Branding      Corners    4      60%      100px  0°
Diagonal Stripe      Diagonal   8      30-40%   110px  -45°
Scattered Protection Scattered  12     25-45%   100px  ±30°
Minimal              Center     1      50%      150px  0°
Border Guard         Edges      12     35-45%   90px   ±10°
Photographer         Single     1      70%      120px  0°
Dense Grid           Grid       30     20-30%   100px  ±5°
Moderate Coverage    Grid       12     30-40%   110px  ±10°
Large                Scattered  6      40-60%   180px  ±20°
Small                Scattered  15     25-35%   70px   ±15°
Micro                Grid       40     15-20%   50px   ±5°
```

## 🎨 Visual Preset Gallery

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ • • • •  │  │ •      • │  │ •        │  │ •   •    │
│ • • • •  │  │          │  │   •      │  │    •   • │
│ • • • •  │  │          │  │     •    │  │  •     • │
│ • • • •  │  │ •      • │  │       •  │  │ •    •   │
│          │  │          │  │          │  │          │
│ Tile     │  │ Corners  │  │ Diagonal │  │ Scattered│
│ Pattern  │  │ Branding │  │ Stripe   │  │ Protection│
└──────────┘  └──────────┘  └──────────┘  └──────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│          │  │ • • • •  │  │          │  │ •••••••• │
│          │  │ •    •   │  │          │  │ •••••••• │
│    •     │  │ •    •   │  │          │  │ •••••••• │
│          │  │ • • • •  │  │        • │  │ •••••••• │
│          │  │          │  │          │  │          │
│ Minimal  │  │ Border   │  │ Photo-   │  │ Dense    │
│          │  │ Guard    │  │ grapher  │  │ Grid     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ • • • •  │  │ •  •     │  │ •  •  •  │  │ ........ │
│ • • • •  │  │    •  •  │  │          │  │ ........ │
│ • • • •  │  │ •     •  │  │ •  •  •  │  │ ........ │
│          │  │          │  │          │  │ ........ │
│          │  │          │  │          │  │          │
│ Moderate │  │ Large    │  │ Small    │  │ Micro    │
│ Coverage │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## 🔄 State Flow Diagram

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Select    │
│   Preset    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Generate   │
│ Watermarks  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Apply     │
│  Settings   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Convert to │
│  Elements   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Add to     │
│  Canvas     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Render    │
│   Result    │
└─────────────┘
```

## 📱 Mobile UI Layout

```
┌─────────────────────────────────┐
│  ← Gallery        Export         │  Top Bar
├─────────────────────────────────┤
│                                  │
│  ┌───────────────────────────┐  │
│  │                            │  │
│  │                            │  │
│  │        Canvas Area         │  │  Main Canvas
│  │     (with watermarks)      │  │
│  │                            │  │
│  │                            │  │
│  └───────────────────────────┘  │
│                                  │
├─────────────────────────────────┤
│  [💧] [T] [🎨] [🔖] [🖼️]       │  Tool Bar
└─────────────────────────────────┘

When Watermark Tool Active:
┌─────────────────────────────────┐
│  💧 Watermark Tool               │  Modal Header
├─────────────────────────────────┤
│  Watermark Text:                 │
│  ┌─────────────────────────────┐│
│  │ © Your Brand                ││  Text Input
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  [🎨] [📐] [🔲] [⚡] [📏] [✨]  │  Categories
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ • •  │ │ •  • │ │ •    │    │
│  │ • •  │ │      │ │  •   │    │  Preset Grid
│  │ Tile │ │Corner│ │Diag. │    │
│  └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ • •  │ │  •   │ │ • •  │    │
│  │  • • │ │      │ │ • •  │    │
│  │Scatter│ │Minimal│ │Border│   │
│  └──────┘ └──────┘ └──────┘    │
└─────────────────────────────────┘

When Customizing:
┌─────────────────────────────────┐
│  ‹ Back to Presets               │  Back Button
├─────────────────────────────────┤
│  Global Adjustments              │
│                                  │
│  Opacity                         │
│  100% ████████████░░░░          │  Sliders
│  [-] [+]                         │
│                                  │
│  Size                            │
│  100% ██████████░░░░░░          │
│  [-] [+]                         │
│                                  │
│  Rotation                        │
│  0°   ██████████░░░░░░          │
│  [-] [+]                         │
│                                  │
│  ┌─────────────────────────────┐│
│  │ Selected Preset             ││
│  │ Tile Pattern                ││  Info Box
│  │ Dense grid covering image   ││
│  └─────────────────────────────┘│
│                                  │
│  ┌─────────────────────────────┐│
│  │    Apply Watermark          ││  Action Button
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

## 🎯 Use Case Examples

### Photography Portfolio

```
Before:                After:
┌─────────────┐       ┌─────────────┐
│             │       │             │
│   Photo     │  →    │   Photo     │
│             │       │             │
│             │       │  © John Doe │
└─────────────┘       └─────────────┘
Preset: Photographer
```

### Social Media Protection

```
Before:                After:
┌─────────────┐       ┌─────────────┐
│             │       │ @user  @user│
│   Image     │  →    │   Image     │
│             │       │ @user  @user│
│             │       │ @user  @user│
└─────────────┘       └─────────────┘
Preset: Scattered Protection
```

### Document Watermarking

```
Before:                After:
┌─────────────┐       ┌─────────────┐
│             │       │ CONFIDENTIAL│
│  Document   │  →    │  Document   │
│             │       │ CONFIDENTIAL│
│             │       │ CONFIDENTIAL│
└─────────────┘       └─────────────┘
Preset: Diagonal Stripe
```

## 🎨 Color & Opacity Guide

```
Opacity Levels:

10-20%  ░░░░░░░░  Barely visible, subtle protection
20-30%  ▒▒▒▒▒▒▒▒  Light, doesn't distract
30-40%  ▓▓▓▓▓▓▓▓  Noticeable but not intrusive
40-60%  ████████  Clear and visible
60-80%  ████████  Prominent watermark
80-100% ████████  Maximum visibility
```

## 📏 Size Guidelines

```
Image Size    Recommended Watermark Size
─────────────────────────────────────────
< 500px       50-70px (Small/Micro)
500-1000px    70-120px (Small/Medium)
1000-2000px   120-180px (Medium/Large)
> 2000px      180-250px (Large)
```

## ✨ This visual guide helps understand the watermark system at a glance!
