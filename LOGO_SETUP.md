# Logo Setup Guide

## Current Logo

The site uses `/public/logo.svg` as the official logo, displayed in the header navigation.

## How to Replace the Logo

### Option 1: Replace the SVG file
1. Create or export your logo as an SVG file
2. Replace `/public/logo.svg` with your new logo
3. Recommended dimensions: 180×40px (or maintain ~4.5:1 aspect ratio)
4. The logo will automatically scale responsively:
   - Desktop: 36px height
   - Mobile: 28px height

### Option 2: Use PNG/JPG instead
1. Export your logo as a PNG or JPG (recommended: 360×80px @2x for retina displays)
2. Save as `/public/logo.png` (or `.jpg`)
3. Update `components/Header.js`:
   ```jsx
   <img src="/logo.png" alt="MyTeachingSheets" className="site-logo" />
   ```

### Option 3: Use Next.js Image component (recommended for production)
For better performance and automatic optimization:

```jsx
import Image from 'next/image'

// In the Header component:
<Link className="nav-brand" href="/">
  <Image 
    src="/logo.svg" 
    alt="MyTeachingSheets" 
    width={180} 
    height={40}
    className="site-logo"
    priority
  />
</Link>
```

## Design Guidelines

- **Colors**: Use your brand colors (current theme uses navy #0b2b4a and teal #3aa6a2)
- **Format**: SVG preferred for crisp scaling; PNG acceptable with @2x resolution
- **Dimensions**: ~180×40px works well; maintain 4-5:1 width-to-height ratio
- **Transparency**: Ensure background is transparent
- **Contrast**: Logo should be readable on white background

## Current Logo Colors
- Primary: `#0b2b4a` (navy)
- Accent: `#3aa6a2` (teal)

## Testing Your Logo
1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:3000
3. Check logo appearance on:
   - Desktop (wide screen)
   - Mobile (narrow screen)
   - Dark mode (if applicable)
4. Verify hover state (slight opacity change)

## Accessibility
- Always include descriptive `alt` text
- Ensure sufficient contrast with header background
- Logo should be readable at small sizes

## File Location
```
public/
  ├── logo.svg          # Main logo file (replace this)
  ├── logo-dark.svg     # Optional: dark mode variant
  └── favicon.ico       # Browser tab icon (update separately)
```

## Custom Hero Background

You can provide a custom background image for the homepage hero by dropping a file into the `public/` folder with one of these names:

- `hero-bg-custom.jpg`
- `hero-bg-custom.jpeg`
- `hero-bg-custom.png`
- `hero-bg-custom.webp`

The Next.js page will detect the first matching file at build time and automatically use it as the hero background. No code changes are required — just add the file and rebuild / restart the dev server.

Notes:
- The CSS prefers the custom image if present; otherwise it falls back to the bundled `hero-bg.svg`.
- For photographic backgrounds, aim for at least 1600px wide and a good center crop so focal areas work across screen sizes.
- To change the file name or behavior, edit `pages/index.js`'s `getStaticProps` detection logic.

## Need Help?
- Online logo makers: Canva, Figma, Adobe Express
- Export as SVG from: Figma, Adobe Illustrator, Inkscape
- Optimize SVGs: https://jakearchibald.github.io/svgomg/
