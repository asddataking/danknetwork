# Dank Network

A video-first, app-style social feed PWA for Dank Network - a local Michigan media brand featuring food, weed, and sports content.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Zustand (client-side state)
- PWA-ready

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Home feed with network strip and filters
  - `danknddevour/` - Dank'N'Devour brand page
  - `recipes/` - Recipes page
  - `sports/` - Sports page
  - `saved/` - Saved videos page
- `components/` - Reusable React components
  - `VideoCard`, `VideoFeed`, `VideoModal` - Video components
  - `RecipeCard`, `RecipeGrid` - Recipe components
  - `Header`, `Footer`, `BottomNav` - Navigation components
  - `NetworkStrip`, `FilterChips` - UI components
- `data/` - Mock data files (videos, recipes)
- `lib/` - State management (Zustand store)
- `public/` - Static assets and PWA files
  - `manifest.json` - PWA manifest
  - `sw.js` - Service worker
  - `icons/` - PWA icons (see below)

## PWA Icons

The app requires PNG icons for PWA installation:
- `public/icons/icon-192x192.png` (192x192 pixels)
- `public/icons/icon-512x512.png` (512x512 pixels)

An SVG template is provided at `public/icons/icon.svg`. You can:
1. Convert the SVG to PNG at the required sizes using any image editor
2. Or create custom icons with Dank Network branding

The icons should feature the "DN" logo or Dank Network branding on a dark background.

## Features

- ✅ Video-first social feed with filtering
- ✅ Network hub connecting all Dank Network brands
- ✅ Client-side likes and saves (persisted in localStorage)
- ✅ Video modal for full-screen viewing
- ✅ Recipe section (ready for future content)
- ✅ PWA support (installable, offline-capable)
- ✅ Responsive design (mobile-first with bottom nav)
- ✅ Dark theme with turquoise/teal accents

## Brand Pages

- **Home** (`/`) - Main feed with all content, network strip, and filters
- **Dank'N'Devour** (`/danknddevour`) - Food & weed review episodes
- **Dank Recipes** (`/recipes`) - Home cooking recipes
- **Dank Sports** (`/sports`) - Sports & game-day content
- **Saved** (`/saved`) - User's saved videos

## External Links

- Dank'N'Devour: https://danknddevour.com
- DankPass: https://www.dankpass.com

