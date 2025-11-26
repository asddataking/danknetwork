# Receipt Upload Implementation

## Overview

Implemented a complete receipt upload, OCR extraction, and validation system using Google Gemini Flash, similar to the Daily Dispo Deals extraction mechanism.

## Architecture

### 1. Receipt Extraction (`lib/ai/receipt-extraction.ts`)

Uses Google Gemini 1.5 Flash for cost-effective OCR and validation:

- **Input**: Receipt image (JPEG, PNG, PDF) as base64
- **Output**: Structured receipt data with validation
- **Cost**: ~$0.075 per 1M input tokens (15-60x cheaper than OpenAI)

### Features

#### Data Extraction
- Merchant name and address
- Purchase date (normalized to ISO format)
- Line items with:
  - Item name
  - Quantity
  - Unit price
  - Total price
  - Category (for dispensary items)
- Totals: subtotal, tax, total amount

#### Validation
- Checks if image is actually a receipt
- Validates data completeness (merchant, items, total)
- Verifies math (line items add up correctly)
- Checks date reasonableness
- Provides confidence score (0-1)
- Returns validation notes for issues

#### Points Calculation
- Base rate: $1 = 2 points
- Premium multiplier: 1.5x (3 points per dollar)
- Partner multiplier support (for future partner bonuses)

## API Endpoint (`app/api/receipts/upload/route.ts`)

### POST `/api/receipts/upload`

Handles the complete upload flow:

1. **File Upload** → Supabase Storage (`receipts` bucket)
2. **OCR Extraction** → Gemini Flash processes the image
3. **Validation** → Checks if receipt is valid and calculates points
4. **Database** → Creates receipt record (ready for when rewards tables exist)

### Request
```typescript
FormData {
  file: File,      // Image or PDF
  userId: string   // Auth user ID
}
```

### Response
```typescript
{
  success: boolean,
  receipt: {
    id: string,
    imageUrl: string,
    status: 'approved' | 'pending',
    extractedData: ExtractedReceipt,
    pointsAwarded: number,
    message: string
  }
}
```

### Features
- **Automatic approval**: If Gemini validates the receipt with high confidence
- **Manual review queue**: Unclear receipts go to pending status
- **Premium detection**: Applies 1.5x multiplier for premium users
- **Upload limits**: Respects free tier limits (ready for implementation)

## Integration

### Upload Page (`app/rewards/upload/page.tsx`)

Updated to use the real API:

```typescript
// Upload each file
for (const file of uploadedFiles) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', user.id);
  
  const response = await fetch('/api/receipts/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  // Handle response...
}
```

### User Feedback
- Shows approval/pending count
- Displays total points awarded
- Provides clear success/error messages

## Environment Variables

Add to `.env.local`:

```bash
# Google Gemini API (required for receipt OCR)
GEMINI_API_KEY=your_gemini_api_key
# or
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Optional: Override default model
GEMINI_MODEL_NAME=gemini-1.5-flash
```

## Supabase Storage Setup

Create a `receipts` bucket in Supabase Storage:

1. Go to Storage in Supabase Dashboard
2. Create new bucket: `receipts`
3. Set to **public** (images need to be accessible for OCR)
4. Set up RLS policies:
   - Users can upload to their own folder (`user_id/*`)
   - Users can read their own receipts

## Database Integration

When rewards tables are ready (`user_profiles`, `receipts`, etc.), the API will automatically:

1. Create receipt record in `receipts` table
2. Update user points in `user_profiles`
3. Create points transaction in `points_transactions`

### Database Schema (from `004_create_rewards_system.sql`)

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  partner_id UUID REFERENCES partners(id),
  image_url TEXT NOT NULL,
  total DECIMAL(10, 2),
  purchase_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

## Points Calculation Logic

```typescript
function calculatePointsFromReceipt(
  totalAmount: number,
  isPremium: boolean,
  partnerMultiplier: number = 1.0
): number {
  const basePoints = Math.floor(totalAmount * 2); // $1 = 2 points
  const premiumMultiplier = isPremium ? 1.5 : 1.0;
  const finalPoints = Math.floor(basePoints * premiumMultiplier * partnerMultiplier);
  return finalPoints;
}
```

### Examples
- Free user, $25 receipt → 50 points
- Premium user, $25 receipt → 75 points (1.5x)
- Premium user, $25 receipt, 2x partner → 150 points

## Error Handling

The system gracefully handles:
- Invalid file types
- Blurry or unreadable images
- Non-receipt images (random photos, documents)
- API failures (falls back to manual review)
- Missing data (merchant, items, totals)

## Future Enhancements

1. **Partner Detection**: Auto-detect partner businesses and apply multipliers
2. **Item Categorization**: Extract product categories for rewards targeting
3. **Duplicate Detection**: Check for duplicate receipts by merchant + date + total
4. **Batch Processing**: Support multiple receipts in one upload
5. **Receipt History**: View past receipts and points earned
6. **Manual Review Dashboard**: Admin interface for approving pending receipts

## Cost Analysis

### Gemini Flash Pricing
- Input: ~$0.075 per 1M tokens
- Output: ~$0.30 per 1M tokens
- Average receipt: ~500 tokens input, 200 tokens output
- **Cost per receipt**: ~$0.0001 (0.01 cents)

### vs OpenAI GPT-4 Vision
- GPT-4V: ~$0.01 per image (100x more expensive)
- Gemini Flash: ~$0.0001 per image

**Conclusion**: Can process **100,000 receipts for $10** with Gemini Flash!

## Testing

1. Upload a test receipt (clear photo of any receipt)
2. Check console for extraction results
3. Verify points calculation matches ($1 = 2 points, 1.5x for premium)
4. Test with blurry image (should go to pending)
5. Test with non-receipt image (should be rejected)

## Related Files

- `lib/ai/receipt-extraction.ts` - Core OCR logic
- `app/api/receipts/upload/route.ts` - Upload API
- `app/rewards/upload/page.tsx` - Upload UI
- `supabase/functions/_shared/gemini.ts` - Gemini integration example
- `supabase/migrations/004_create_rewards_system.sql` - Database schema

