# Icon Generation Guide for Spark

This guide explains how to generate all required icons and images for Spark's SEO and PWA functionality.

## Required Assets

### App Icons (for PWA and Mobile)
- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)
- `apple-icon.png` (180x180)
- `favicon.ico` (16x16, 32x32, 48x48)

### Social Media Images
- `og-image.png` (1200x630) - Open Graph image for general pages
- `og-lesson-image.png` (1200x630) - Open Graph image for lesson pages
- `twitter-image.png` (1200x675) - Twitter Card image
- `twitter-lesson-image.png` (1200x675) - Twitter Card for lessons

### PWA Screenshots
- `screenshot-mobile.png` (540x720) - Mobile screenshot
- `screenshot-desktop.png` (1280x720) - Desktop screenshot

### Shortcuts
- `shortcut-create.png` (96x96)
- `shortcut-lessons.png` (96x96)

### Logo
- `logo.png` (Recommended: 512x512 with transparency)

## Option 1: Using Online Tools

### Favicon Generator
1. Go to https://realfavicongenerator.net/
2. Upload your base icon (`icon.svg`)
3. Customize settings:
   - iOS: Use solid background (#9333EA)
   - Android: Use solid background (#9333EA)
   - Windows: Use solid background (#9333EA)
4. Download and extract to `public/` folder

### PWA Icon Generator
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your base icon (`icon.svg` or a 512x512 PNG)
3. Download the generated icons
4. Place in `public/` folder

### Social Media Image Creator
1. Go to https://www.canva.com/
2. Use these templates:
   - "Facebook Post" (1200x630) for Open Graph
   - "Twitter Post" (1200x675) for Twitter Cards
3. Design with Spark branding:
   - Colors: Purple (#9333EA), Pink (#DB2777), Red (#DC2626)
   - Include: "Spark" logo, tagline, and imagery
   - Font: Use Fredoka or similar playful fonts
4. Export as PNG

## Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Generate PWA icons from SVG
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}.png
done

# Generate Apple icon
convert icon.svg -resize 180x180 apple-icon.png

# Generate favicon (multi-resolution)
convert icon.svg -define icon:auto-resize=16,32,48 favicon.ico
```

## Option 3: Using Node.js (Sharp)

Install Sharp:
```bash
npm install sharp
```

Create a script `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = './public/icon.svg';

async function generateIcons() {
  // Generate PWA icons
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(`./public/icon-${size}.png`);
    console.log(`Generated icon-${size}.png`);
  }

  // Generate Apple icon
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile('./public/apple-icon.png');
  console.log('Generated apple-icon.png');

  // Generate favicon
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile('./public/favicon-32.png');
  console.log('Generated favicon');
}

generateIcons().catch(console.error);
```

Run:
```bash
node scripts/generate-icons.js
```

## Design Guidelines

### Color Palette
- Primary: Purple (#9333EA)
- Secondary: Pink (#DB2777)
- Accent: Red (#DC2626)
- Background Light: #FAFAFA
- Background Dark: #1F2937

### Icon Design Principles
1. **Simple & Recognizable**: The spark/lightning symbol should be instantly recognizable
2. **Works at Small Sizes**: Icon should be clear even at 16x16
3. **Consistent Branding**: Use the gradient (purple → pink → red)
4. **Sufficient Contrast**: White spark on gradient background
5. **Safe Area**: Keep important elements within 80% of icon area

### Social Media Images
1. **Visual Hierarchy**: Logo → Tagline → Call-to-action
2. **Typography**: Bold, playful fonts (Fredoka/Baloo 2)
3. **Imagery**: Include illustrations of kids learning, sparkles, educational elements
4. **Localization**: Consider adding Hindi text or Indian cultural elements

## Testing

After generating icons:

1. **Favicon**: Check in browser tabs across different browsers
2. **PWA Icons**: Test Add to Home Screen on iOS and Android
3. **Social Media**: Use validators:
   - Open Graph: https://www.opengraph.xyz/
   - Twitter Cards: https://cards-dev.twitter.com/validator
4. **PWA Manifest**: Use Lighthouse in Chrome DevTools

## Current Status

✅ Base SVG icon created (`icon.svg`)
⚠️ PNG icons need to be generated
⚠️ Social media images need to be created
⚠️ Screenshots need to be captured

## Next Steps

1. Choose one of the methods above to generate all required icons
2. Create social media images with Spark branding
3. Update `public/robots.txt` with your production domain
4. Update verification codes in `app/layout.tsx` when available
5. Test all SEO features using the validators mentioned above
