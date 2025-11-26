# 🛠️ Fourthwall Integration Fix Guide

## Problem
Your Fourthwall shop is not displaying products on the live site.

## Root Cause
The Fourthwall integration requires specific environment variables to be configured in Vercel, particularly `FW_SHOP_URL`.

## Quick Fix

### Step 1: Check Current Configuration
Visit your new diagnostic endpoint to see what's wrong:
```
https://yourdomain.vercel.app/api/fourthwall/check
```

This will show you:
- ✅ Which environment variables are set
- ❌ Which ones are missing
- 📦 Whether your Fourthwall shop is accessible
- 🔍 How many products were found

### Step 2: Get Your Fourthwall Shop URL
1. Log into your Fourthwall account
2. Go to your shop settings
3. Your shop URL should look like: `https://your-shop.fourthwall.com`
4. Make sure your shop is **public** and has **active products**

### Step 3: Add Environment Variables to Vercel

Go to your Vercel project settings:
```
https://vercel.com/[your-username]/danknetwork/settings/environment-variables
```

Add these required variables for all environments (Production, Preview, Development):

#### Required:
```
FW_SHOP_URL=https://your-shop.fourthwall.com
```

#### Optional but Recommended:
```
FW_STOREFRONT_TOKEN=your_storefront_token_here
FW_COLLECTION_SLUG=all
FW_DONATION_PRODUCT_HANDLE=donation
```

### Step 4: Get Your Fourthwall Storefront Token (Optional)
The storefront token provides a fallback if the JSON feed fails.

1. Log into Fourthwall
2. Go to Settings → API or Developer Settings
3. Create or find your Storefront API token
4. Copy it and add to Vercel as `FW_STOREFRONT_TOKEN`

### Step 5: Redeploy
After adding environment variables:
1. Go to your Vercel dashboard
2. Trigger a new deployment (or push a commit to trigger auto-deploy)
3. Wait for deployment to complete

### Step 6: Verify
1. Visit `https://yourdomain.vercel.app/api/fourthwall/check` again
2. Should show ✅ green checkmarks
3. Visit `https://yourdomain.vercel.app/shop`
4. Products should now be visible!

## Troubleshooting

### Issue: "FW_SHOP_URL not set"
**Solution**: Add the environment variable in Vercel (see Step 3)

### Issue: "All feed URL patterns failed"
**Possible causes**:
1. Your shop URL is incorrect
2. Your shop is not public
3. Your shop has no active products
4. Network/firewall issue

**Solution**:
- Try visiting your shop URL directly: `https://your-shop.fourthwall.com`
- Make sure you can see products when visiting
- Check shop settings to ensure it's public
- Try adding `FW_STOREFRONT_TOKEN` as fallback

### Issue: "Feed returned 0 products"
**Possible causes**:
1. Your shop has no published products
2. Products are in draft mode
3. Collection filter is incorrect

**Solution**:
- Log into Fourthwall and verify you have active products
- Make sure products are published (not draft)
- Check `FW_COLLECTION_SLUG` matches your collection handle

### Issue: Products show but are outdated
**Cause**: Cache is stale but no fresh data can be fetched

**Solution**:
1. Check if new deployments can fetch fresh data
2. Verify `FW_SHOP_URL` is still correct
3. Products cache expires after 1 hour, so wait and check again

## How It Works

### Data Flow:
1. **Primary**: Fetch from Fourthwall JSON feed
   - URL: `https://your-shop.fourthwall.com/products.json`
   - No authentication needed if shop is public
   
2. **Fallback**: Fetch from Fourthwall Storefront API
   - Requires `FW_STOREFRONT_TOKEN`
   - More reliable but requires API access
   
3. **Cache**: Store in Supabase `products_cache` table
   - Cached for 1 hour
   - Used if both above methods fail

### Feed URL Patterns Tried:
The integration tries multiple URL patterns automatically:
- `https://your-shop.fourthwall.com/products.json`
- `https://your-shop.fourthwall.com/collections/all/products.json`
- `https://your-shop.fourthwall.com/api/products.json`
- `https://your-shop.fourthwall.com/feed/products.json`

## Testing Locally

To test locally before deploying:

1. Create `.env.local` file in your project root:
```env
# Copy from Vercel
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Add Fourthwall vars
FW_SHOP_URL=https://your-shop.fourthwall.com
FW_STOREFRONT_TOKEN=your_token (optional)
FW_COLLECTION_SLUG=all
```

2. Run dev server:
```bash
npm run dev
```

3. Visit `http://localhost:3000/shop`

4. Check diagnostic endpoint:
```bash
curl http://localhost:3000/api/fourthwall/check
```

## Debug Endpoints

### `/api/fourthwall/check`
Shows environment config and feed accessibility

### `/api/fourthwall/debug`
Shows raw feed data and transformation results

### `/api/fourthwall/products`
The actual products API endpoint used by the shop page

## Need Help?

If you're still having issues:

1. Check the Vercel deployment logs for errors
2. Visit the diagnostic endpoints above
3. Make sure your Fourthwall shop is accessible publicly
4. Verify all environment variables are set correctly
5. Try adding the `FW_STOREFRONT_TOKEN` as a fallback

## Common Fourthwall Shop URL Formats

Your shop URL might be one of these formats:
- `https://shop.yourdomain.com` (custom domain)
- `https://yourusername.fourthwall.com` (subdomain)
- `https://fourthwall.com/yourusername` (path-based)

Make sure to use the correct format that actually loads your shop when visited in a browser.

