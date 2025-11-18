# Vercel Environment Variables Setup

## Required Supabase Environment Variables

Add these to your Vercel project settings:

1. Go to: https://vercel.com/dan-richmonds-projects/danknetwork/settings/environment-variables

2. Add the following variables:

### For Production, Preview, and Development:

```
NEXT_PUBLIC_SUPABASE_URL=https://svxaujkqspifjrzphqvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eGF1amtxc3BpZmpyenBocXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDU2MzcsImV4cCI6MjA3NTkyMTYzN30.0Q1Q1MXAncn8UOxil60WdnW-0Ft2cXSFpUrdr-yFIac
```

### Other Required Variables (if not already set):

```
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_youtube_channel_id
FW_STOREFRONT_TOKEN=your_fourthwall_storefront_token
FW_SHOP_URL=https://your-shop.fourthwall.com
FW_COLLECTION_SLUG=all
FW_DONATION_PRODUCT_HANDLE=donation
```

### Optional Map Variables:

```
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
# OR
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
MAPBOX_SECRET_TOKEN=your_mapbox_secret_token
```

## After Adding Variables

1. **Redeploy** your project (or wait for the next deployment)
2. The environment variables will be available to your API routes
3. Visit `/munchie-map` to see places from Supabase

## Testing

After deployment, check:
- Browser console for any errors
- Network tab to see if `/api/places` returns data
- Map should show 6 places (restaurants and dispensaries)

