# Setup Checklist for Receipt Upload

## ✅ Step 1: Environment Variables (DONE!)
- [x] Added `GEMINI_API_KEY` to `.env.local`

## 📦 Step 2: Create Supabase Storage Bucket

### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/svxaujkqspifjrzphqvs
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `receipts`
   - **Public bucket**: ✅ Enable (images need to be accessible for OCR)
   - Click **"Create bucket"**

### Option B: Via SQL (Alternative)
```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Set up RLS policies
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🧪 Step 3: Test Receipt Upload

### 3.1 Restart Dev Server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart to load the new env variable
npm run dev
```

### 3.2 Test the Upload Flow
1. Navigate to `http://localhost:3000/rewards/upload`
2. If not signed in, you'll see a sign-in prompt
3. Sign in or create an account using the AuthModal
4. Once signed in, you should see the upload area
5. Drag and drop a receipt image (or click to browse)
6. Click "Upload" button

### 3.3 Expected Results
- ✅ File uploads to Supabase Storage
- ✅ Gemini processes the image
- ✅ You see: "Successfully uploaded! X points earned"
- ✅ Check browser console for extraction details

### 3.4 Test Receipt Examples
**Good test receipt (should auto-approve):**
- Clear photo of any retail receipt
- Well-lit, all text readable
- Total amount visible

**Pending review receipt (should go to manual review):**
- Blurry or dark photo
- Partially cut off
- Handwritten receipt

**Rejected receipt (should fail validation):**
- Random photo (not a receipt)
- Completely illegible
- Non-receipt document

## 🔍 Step 4: Verify in Supabase

### Check Storage
1. Go to **Storage** > **receipts** bucket
2. You should see folders like `{userId}/`
3. Inside, you'll see uploaded receipt images

### Check Console Logs
Look for these in browser DevTools Console:
```
[Receipt Upload] File uploaded: https://...
[Receipt Upload] Extraction complete - Valid: true, Confidence: 0.95
```

## 🐛 Troubleshooting

### "Stripe is not configured" error
- This is OK for now! Receipt upload works independently
- You'll just see this warning in console
- Receipts still upload and process fine

### "Failed to upload file" error
**Cause**: Storage bucket not created
**Fix**: Complete Step 2 above

### "GEMINI_API_KEY not configured" error
**Cause**: 
- Dev server not restarted after adding key
- Typo in variable name (should be `GEMINI_API_KEY` or `GOOGLE_GEMINI_API_KEY`)

**Fix**: 
- Restart dev server
- Check `.env.local` has correct variable name

### "Supabase URL and service role key must be configured"
**Cause**: Missing `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
**Fix**: Add it from Supabase Dashboard > Settings > API

### Receipt extraction returns empty data
**Cause**: 
- API rate limit reached
- Invalid API key
- Image too large

**Fix**:
- Check Gemini API quota
- Verify API key is valid
- Try smaller image (<5MB)

## 📊 Step 5: View Extraction Results

The API returns detailed extraction data. Check browser console for:
```json
{
  "merchantName": "Target Store #1234",
  "purchaseDate": "2024-01-15",
  "totalAmount": 25.99,
  "lineItems": [
    {
      "itemName": "Product Name",
      "quantity": 1,
      "unitPrice": 10.00,
      "totalPrice": 10.00
    }
  ],
  "validationConfidence": 0.95,
  "isValid": true
}
```

## 🎯 Step 6: Apply Rewards Tables (When Ready)

Once you're ready to fully enable the rewards system:

```bash
# This will create the rewards tables
# user_profiles, receipts, partners, perks, etc.
supabase db push
```

Or manually apply:
```sql
-- Run supabase/migrations/004_create_rewards_system.sql
```

After this, receipts will automatically:
- Create database records
- Update user points
- Create points transactions
- Link to partners (when detected)

## ✅ Verification Checklist

- [ ] `GEMINI_API_KEY` added to `.env.local`
- [ ] Dev server restarted
- [ ] Storage bucket `receipts` created
- [ ] Can navigate to `/rewards/upload`
- [ ] Can sign in/up
- [ ] Can upload receipt image
- [ ] See success message with points
- [ ] Receipt appears in Supabase Storage
- [ ] Console shows extraction data
- [ ] No errors in console (except Stripe warning - OK)

## 🎉 Success Criteria

You'll know it's working when:
1. Receipt uploads without errors
2. You see: "Receipt processed! You'll receive X points once approved."
3. Browser console shows the extracted receipt data
4. File appears in Supabase Storage > receipts bucket

## 📞 Need Help?

If you run into issues:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify all environment variables are set
4. Make sure storage bucket exists
5. Try with a clear, simple receipt first

---

**Current Status:**
- ✅ Gemini API configured
- ⏳ Storage bucket creation needed
- ⏳ Testing needed

**Next Step:** Create the storage bucket, then test an upload! 🚀

