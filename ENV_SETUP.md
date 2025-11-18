# Environment Variables Setup

This document lists all required and optional environment variables for the Dank Network app.

## Required Variables

### Supabase (for Munchie Map)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### YouTube (for Video Feed)
```env
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_youtube_channel_id
```

### Fourthwall (for Shop/Donations)
```env
FW_STOREFRONT_TOKEN=your_fourthwall_storefront_token
FW_SHOP_URL=https://your-shop.fourthwall.com
FW_COLLECTION_SLUG=all
FW_DONATION_PRODUCT_HANDLE=donation
```

## Optional Variables

### Map Tiles (for Munchie Map)
```env
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
# OR
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
MAPBOX_SECRET_TOKEN=your_mapbox_secret_token
```

**Note:** The public token is used for client-side map rendering. The secret token can be used for server-side geocoding or other advanced features if needed.

If neither MapTiler nor Mapbox is provided, the map will use OpenStreetMap tiles (free but may have rate limits).

## Setup Instructions

1. Copy `.env.local.example` to `.env.local` (if it exists)
2. Add all required variables to `.env.local`
3. **Restart your dev server** after adding/changing environment variables:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

## Testing Your Setup

### Test YouTube Integration
1. Visit `http://localhost:3000`
2. Videos should load from your YouTube channel
3. Check browser console for any errors

### Test Supabase Integration
1. Visit `http://localhost:3000/munchie-map`
2. Map should load and display places from your Supabase database
3. Check browser console for any errors

### Test Fourthwall Integration
1. Visit `http://localhost:3000/shop`
2. Products should load from your Fourthwall store
3. Check browser console for any errors

## Getting Your Credentials

### YouTube Channel ID
1. Go to your YouTube channel
2. View page source (Ctrl+U or Cmd+U)
3. Search for `"channelId"` - the value after it is your channel ID
4. Or visit: https://www.youtube.com/account_advanced (while logged in)

### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the key to YouTube Data API v3 for security

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

