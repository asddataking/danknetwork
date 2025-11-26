# Fourthwall Products Debug Guide 🛠️

## Problem
Fourthwall products showing 0 items because:
- `products_cache` table is empty (0 rows)
- JSON feed or Storefront API not populating the cache

## Solution: New Debug Tools

### 🎯 Quick Start (3 steps)

1. **Visit Debug Dashboard**
   ```
   https://your-vercel-url.vercel.app/fourthwall-debug
   ```

2. **Try These Buttons:**
   - 🔍 **Debug Check** - See what's wrong
   - 🔄 **Refresh from JSON Feed** - Get real products
   - 🌱 **Seed Test Products** - Get fake products (for testing UI)

3. **Check Results**
   - Green = Success! Products cached
   - Red = Error (read the message)

---

## Tool Details

### 1. 🔍 Debug Check
**Endpoint:** `/api/fourthwall/debug`

**What it does:**
- Tests all Fourthwall JSON feed URLs
- Tests Storefront API (if token configured)
- Shows raw response data
- Identifies configuration issues

**Use when:**
- You want to see if Fourthwall is responding
- You need to check environment variables
- Products aren't showing up

**Response shows:**
- Feed URL status (403, 404, 200)
- Product count in feed
- First product sample
- Storefront API test results

---

### 2. 🔄 Refresh Cache (Primary Method)
**Endpoint:** `/api/fourthwall/refresh-cache`

**What it does:**
- Fetches products from Fourthwall JSON feed
- Transforms them to our format
- Saves to `products_cache` table
- Sets 1-hour expiration

**Use when:**
- You want to get REAL products from Fourthwall
- Cache is empty or stale
- You've added new products to Fourthwall
- After fixing configuration

**Success looks like:**
```json
{
  "success": true,
  "message": "Successfully cached 12 products",
  "savedProducts": 12,
  "totalProducts": 12,
  "feedUrl": "https://your-shop.fourthwall.com/products.json"
}
```

**Failure looks like:**
```json
{
  "error": "No products found",
  "attemptedUrls": [...],
  "suggestion": "Check if your Fourthwall shop has published products"
}
```

---

### 3. 🌱 Seed Test Products (Backup Method)
**Endpoint:** `/api/fourthwall/seed-test-products`

**What it does:**
- Creates 4 fake products
- Uses placeholder Unsplash images
- Saves to `products_cache` table
- Sets 1-hour expiration

**Use when:**
- JSON feed is still broken
- You want to test the UI while debugging
- You need products NOW for a demo

**⚠️ Warning:**
- These are FAKE products
- Checkout URLs won't work
- Images are placeholders
- Use only for testing!

**Products seeded:**
1. Dank Network Hoodie - $49.99
2. Dank'N'Devour T-Shirt - $24.99
3. Dank Network Snapback - $29.99
4. Dank Network Sticker Pack - $9.99

---

## Troubleshooting

### Problem: "FW_SHOP_URL not configured"

**Solution:** Add to Vercel environment variables:
```
FW_SHOP_URL=https://dankndevour-shop.fourthwall.com/
```

Then redeploy.

---

### Problem: "All feed URL patterns failed"

**Possible causes:**
1. Shop URL is wrong
2. Shop has 0 products
3. Products aren't published
4. Fourthwall is blocking requests

**Debug steps:**
1. Visit your shop directly: `https://dankndevour-shop.fourthwall.com/`
2. Check if products show up
3. Try visiting: `https://dankndevour-shop.fourthwall.com/products.json`
4. See if JSON returns

---

### Problem: "0 products found in JSON feed"

**Possible causes:**
1. Shop has no products
2. All products are unpublished/draft
3. Collection is empty
4. JSON feed format changed

**Debug steps:**
1. Log into Fourthwall admin
2. Check Products → Published count
3. Make sure at least 1 product is "Published" and "Available"
4. Check collection slug (should be "all" or empty)

---

### Problem: Products cache but don't show on site

**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Check `/api/fourthwall/products` - should return products
3. Check homepage - ShopShowcase component should render
4. Check browser console for errors

---

## Environment Variables Checklist

### Required (for JSON feed - primary method)
```env
FW_SHOP_URL=https://dankndevour-shop.fourthwall.com/
```

### Optional (for Storefront API - fallback)
```env
FW_STOREFRONT_TOKEN=your_token_here
FW_COLLECTION_SLUG=all
```

### Supabase (required for cache)
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## Testing Workflow

### Option A: Real Products (Preferred)
1. Visit `/fourthwall-debug`
2. Click "🔄 Refresh from JSON Feed"
3. Wait 5-10 seconds
4. Check response - should show "Successfully cached X products"
5. Visit homepage - products should appear
6. Products expire in 1 hour, will auto-refresh

### Option B: Test Products (For UI testing)
1. Visit `/fourthwall-debug`
2. Click "🌱 Seed Test Products"
3. Check response - should show 4 products seeded
4. Visit homepage - test products appear
5. Replace with real products when ready

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/fourthwall/products` | GET | Get cached products (for UI) |
| `/api/fourthwall/debug` | GET | Debug Fourthwall config |
| `/api/fourthwall/refresh-cache` | GET | Fetch from JSON feed |
| `/api/fourthwall/seed-test-products` | GET | Seed fake products |
| `/fourthwall-debug` | Page | Debug dashboard UI |

---

## Next Steps

1. ✅ **Visit debug dashboard:** `/fourthwall-debug`
2. ✅ **Run debug check** to see configuration status
3. ✅ **Try refresh cache** to get real products
4. ✅ **If refresh fails, seed test products** for UI testing
5. ✅ **Check homepage** to see products display
6. ✅ **Fix configuration** based on debug output
7. ✅ **Run refresh again** once fixed

---

## Production Deployment

Before going to production:

1. ✅ Make sure `FW_SHOP_URL` is set in Vercel
2. ✅ Run refresh cache manually once
3. ✅ Verify products load on homepage
4. ✅ Test checkout flow end-to-end
5. ✅ Remove test seed endpoint (optional for security)
6. ✅ Products will auto-refresh via cron or on-demand

---

## Cache Behavior

- **Expiration:** 1 hour
- **Refresh:** Automatic when expired + page request
- **Fallback order:**
  1. Fresh cache (< 1 hour old)
  2. JSON feed
  3. Storefront API (if token configured)
  4. Stale cache (> 1 hour old)
  5. Empty array

---

## Support

If products still won't load after trying everything:

1. Check Fourthwall admin - are products actually there?
2. Try visiting shop directly - do products show?
3. Check Supabase - does `products_cache` table exist?
4. Check Vercel logs for detailed error messages
5. Run debug check and send the full JSON output

---

**Status:** Ready to test! 🚀  
**Next:** Visit `/fourthwall-debug` and click some buttons!

