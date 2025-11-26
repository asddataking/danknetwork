# DankPass Rewards - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies (Already Done ✅)
```bash
npm install
```

### 2. Set Up Supabase

#### Option A: Use Supabase MCP (Recommended)
The Supabase MCP tools are already available in your Cursor environment. You can:

- List your Supabase projects
- Create a new project
- Run migrations directly

Ask your AI assistant to help you:
- "List my Supabase projects"
- "Run the rewards migration on my project"

#### Option B: Manual Setup

1. **Create a Supabase Project** (if you don't have one)
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Add Environment Variables**
   
   Create/update `.env.local`:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Optional: For premium features
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Run the Migration**
   
   ```bash
   # Using Supabase CLI (recommended)
   supabase migration up
   
   # Or manually:
   # 1. Go to Supabase Dashboard → SQL Editor
   # 2. Copy contents of supabase/migrations/004_create_rewards_system.sql
   # 3. Run the SQL
   ```

4. **Create Storage Bucket**
   
   In Supabase Dashboard:
   - Go to Storage
   - Create bucket named "receipts"
   - Set to Public or Private (with RLS)

### 3. Test the UI (Works Now!)

Even without Supabase connected, you can explore the UI:

```bash
npm run dev
```

Visit: http://localhost:3000/rewards

**What works without Supabase:**
- ✅ All page navigation
- ✅ UI components and animations
- ✅ Mock data displays
- ✅ File selection (upload simulation)

### 4. Wire Up Real Data

Replace mock data with Supabase queries in these files:

#### A. User Authentication
```typescript
// app/rewards/page.tsx
import { supabase } from '@/lib/rewards/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Get user profile
const profile = await getUserProfile(user.id);
```

#### B. Receipt Upload
```typescript
// app/rewards/page.tsx or upload/page.tsx
import { uploadReceipt } from '@/lib/rewards/supabase';

const result = await uploadReceipt(userId, file);
if (result) {
  console.log('Receipt uploaded:', result.receipt);
}
```

#### C. Perks Marketplace
```typescript
// app/rewards/perks/page.tsx
import { getActivePerks, redeemPerk } from '@/lib/rewards/supabase';

// Fetch perks
const perks = await getActivePerks();

// Redeem a perk
const redemption = await redeemPerk(userId, perkId, pointsCost);
```

#### D. User Profile
```typescript
// app/rewards/profile/page.tsx
import { getUserProfile, getUserRedemptions } from '@/lib/rewards/supabase';

const profile = await getUserProfile(userId);
const redemptions = await getUserRedemptions(userId);
```

### 5. Add Navigation Link (Optional)

Add a link to rewards in your main navigation:

```typescript
// components/Header.tsx (or wherever your nav is)
<Link href="/rewards" className="nav-link">
  🎁 Rewards
</Link>
```

## 📱 Features Checklist

### Core Features (Ready to Wire)
- [ ] User authentication via Supabase
- [ ] User profile creation on signup
- [ ] Receipt upload to Supabase Storage
- [ ] Receipt status tracking (pending/approved/rejected)
- [ ] Points awarding system
- [ ] Perks browsing and filtering
- [ ] Perk redemption with codes
- [ ] Tier calculation (Bronze→Gold→Platinum)
- [ ] Transaction history

### Premium Features (Requires Stripe)
- [ ] Premium subscription ($7/month)
- [ ] 1.5x points multiplier
- [ ] Unlimited uploads
- [ ] Exclusive perks access

### Optional Enhancements
- [ ] OCR receipt parsing (OpenAI Vision API)
- [ ] Push notifications
- [ ] Referral system
- [ ] Partner onboarding flow
- [ ] Admin dashboard
- [ ] Analytics

## 🎨 Customization

### Brand Colors
Edit `tailwind.config.ts` to customize colors:

```typescript
brand: {
  bg: 'rgb(0 0 0)',           // Background
  primary: 'rgb(0 255 136)',   // Main accent
  ink: 'rgb(255 255 255)',     // Text
  subtle: 'rgb(156 163 175)',  // Muted text
  card: 'rgb(17 17 17)',       // Card background
}
```

### Points Calculation
Default: $1 spent = 2 points

Change in your receipt processing logic:
```typescript
const points = Math.floor(receiptTotal * 2);
```

Premium users get 1.5x:
```typescript
if (isPremium) {
  points = Math.floor(points * 1.5);
}
```

### Tier Thresholds
Edit in `supabase/migrations/004_create_rewards_system.sql`:

```sql
-- Current thresholds:
-- Bronze: 0-999 points
-- Silver: 1000-2499 points
-- Gold: 2500-4999 points
-- Platinum: 5000+ points
```

## 🔧 Troubleshooting

### "Supabase is not defined"
Make sure environment variables are set in `.env.local` and restart dev server.

### "Table does not exist"
Run the migration file in Supabase Dashboard SQL Editor.

### "Storage bucket not found"
Create a "receipts" bucket in Supabase Storage.

### File upload fails
Check RLS policies on Storage bucket and ensure user is authenticated.

### Points not updating
Check that `award_points()` function exists in your database (it's in the migration).

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `app/rewards/page.tsx` | Main dashboard |
| `app/rewards/perks/page.tsx` | Perks marketplace |
| `app/rewards/upload/page.tsx` | Receipt upload |
| `app/rewards/profile/page.tsx` | User profile |
| `app/rewards/premium/page.tsx` | Premium upsell |
| `lib/rewards/supabase.ts` | Helper functions |
| `types/rewards.ts` | TypeScript types |
| `supabase/migrations/004_create_rewards_system.sql` | Database schema |

## 🚦 Testing Flow

1. **Sign Up/Login** → Creates user profile automatically
2. **Upload Receipt** → Stored in receipts table with "pending" status
3. **Admin Approves** → Points awarded, status → "approved"
4. **Browse Perks** → Filter by category, see what you can afford
5. **Redeem Perk** → Points deducted, get redemption code
6. **View Profile** → See stats, history, tier badge

## 🎯 Next Steps

1. **Connect Supabase** - Add env vars and test queries
2. **Enable Auth** - Set up sign up/login flow
3. **Test Upload** - Upload real receipt to Storage
4. **Award Points** - Manually approve receipt and award points
5. **Redeem Perk** - Test full redemption flow
6. **Add Stripe** - Enable premium subscriptions
7. **Go Live!** 🚀

## 💡 Pro Tips

- Use Supabase Dashboard to manually test queries
- Check RLS policies if data isn't showing
- Use `console.log` to debug Supabase responses
- Start with mock data, swap gradually to real data
- Test on mobile - it's designed mobile-first!

## 🆘 Need Help?

- Check the full docs: `REWARDS_INTEGRATION_COMPLETE.md`
- Review types: `types/rewards.ts`
- Examine helper functions: `lib/rewards/supabase.ts`
- Look at migration: `supabase/migrations/004_create_rewards_system.sql`

---

**Ready to launch your rewards program! 🎉**

