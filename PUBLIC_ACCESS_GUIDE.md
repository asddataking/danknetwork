# Public Access Guide

## Philosophy

The Dank Network app is **publicly viewable by default**. Users only need to sign in when they want to **interact** with personal features.

---

## Public vs Auth-Required Pages

### ✅ Fully Public (No Sign-In Required)

#### `/` - Homepage
- **Access**: Everyone
- **Content**: General Dank Network content, videos, food reviews
- **Auth**: Optional

#### `/deals` - Daily Dispo Deals
- **Access**: Everyone
- **Content**: View deals, subscribe to newsletter
- **Auth**: Optional (pre-fills email if signed in, shows premium status)
- **Premium**: Shows full list vs top 3

#### `/rewards` - DankPass Rewards Dashboard
- **Access**: Everyone can view the concept
- **Content**: Explains how rewards work, shows mock/example data
- **Auth**: Required to see personal dashboard with real data
- **Behavior**: 
  - **Not signed in**: Shows "How It Works" with sign-in CTA
  - **Signed in**: Shows personal stats, points, receipts

#### `/rewards/premium` - Premium Upgrade Page
- **Access**: Everyone
- **Content**: Premium benefits, pricing
- **Auth**: Optional (shows current status if signed in)

#### `/rewards/perks` - Browse Perks
- **Access**: Everyone can **browse** perks
- **Content**: All available perks, categories, descriptions
- **Auth**: Required to **redeem** perks
- **Behavior**:
  - **Not signed in**: Can view all perks, "Sign in to redeem" buttons
  - **Signed in**: Can redeem perks if enough points
  - **Premium perks**: Show locked icon for non-premium users

---

### 🔐 Auth-Required Pages

#### `/rewards/profile` - Personal Profile
- **Access**: Authenticated users only
- **Reason**: Personal data (points, tier, stats)
- **Guard**: Use `<AuthGuard>`

#### `/rewards/upload` - Upload Receipts
- **Access**: Authenticated users only
- **Reason**: User must be identified to award points
- **Guard**: Use `<AuthGuard>` or inline check

#### `/account/subscription` - Manage Subscription
- **Access**: Authenticated users only
- **Reason**: Personal subscription details
- **Guard**: Use `<AuthGuard>`

---

## Implementation Patterns

### Pattern 1: Fully Public Page

```tsx
export default function PublicPage() {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();
  
  return (
    <div>
      <h1>Public Content</h1>
      {/* Show content to everyone */}
      
      {!isAuthenticated && (
        <div className="cta">
          <Link href="/deals">Sign In for More Features</Link>
        </div>
      )}
      
      {isAuthenticated && (
        <div>
          <p>Welcome back, {user.email}!</p>
          {isPremium && <PremiumBadge />}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Public Browse, Auth to Interact

```tsx
export default function BrowsePage() {
  const { isAuthenticated } = useAuth();
  
  const handleAction = () => {
    if (!isAuthenticated) {
      alert('Please sign in to continue');
      // Or open AuthModal
      return;
    }
    // Proceed with action
  };
  
  return (
    <div>
      {/* Show content to everyone */}
      <ProductList />
      
      {/* Conditionally enable interactions */}
      <button 
        onClick={handleAction}
        className={!isAuthenticated ? 'disabled' : ''}
      >
        {isAuthenticated ? 'Add to Cart' : 'Sign In to Add to Cart'}
      </button>
    </div>
  );
}
```

### Pattern 3: Auth-Required Page

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function PersonalPage() {
  return (
    <AuthGuard>
      <PersonalContent />
    </AuthGuard>
  );
}
```

---

## Component Behavior

### AuthGuard
- **Use for**: Pages with ONLY personal data
- **Behavior**: Redirects to sign-in if not authenticated
- **Examples**: `/rewards/profile`, `/account/subscription`

### PremiumGuard
- **Use for**: Premium-only pages (rare)
- **Behavior**: Shows upgrade prompt if not premium
- **Examples**: Future premium-only content pages

### Conditional Rendering
- **Use for**: Most pages - show content with CTAs
- **Behavior**: Inline "Sign in" prompts
- **Examples**: `/rewards`, `/rewards/perks`, `/deals`

---

## Updated Page Behaviors

### `/rewards` (Dashboard)
**Before**: Auth-guarded, blocked everyone  
**After**: Public-friendly with smart CTAs

```tsx
{!isAuthenticated ? (
  <>
    <h1>Earn Rewards with DankPass!</h1>
    <p>Sign in to start earning points</p>
    <button onClick={() => setShowAuth(true)}>Sign In</button>
    
    {/* Show example stats/demo */}
    <ExampleDashboard />
  </>
) : (
  <>
    <h1>Welcome back!</h1>
    <YourStats />
    <UploadArea />
    <RecentReceipts />
  </>
)}
```

### `/rewards/perks` (Browse Perks)
**Before**: Auth-guarded, blocked everyone  
**After**: Everyone can browse, auth to redeem

```tsx
<PerksList>
  {perks.map(perk => (
    <PerkCard key={perk.id}>
      <h3>{perk.title}</h3>
      <p>{perk.description}</p>
      <p>{perk.pointsCost} points</p>
      
      {!isAuthenticated ? (
        <button onClick={() => setShowAuth(true)}>
          Sign In to Redeem
        </button>
      ) : !canAfford(perk.pointsCost) ? (
        <button disabled>
          Need {perk.pointsCost - userPoints} more points
        </button>
      ) : perk.isPremiumOnly && !isPremium ? (
        <button onClick={() => router.push('/rewards/premium')}>
          Upgrade to Redeem
        </button>
      ) : (
        <button onClick={() => redeem(perk)}>
          Redeem for {perk.pointsCost} Points
        </button>
      )}
    </PerkCard>
  ))}
</PerksList>
```

### `/rewards/upload` (Upload Receipts)
**Before**: Auth-guarded  
**After**: Still auth-guarded (OR inline check with prominent CTA)

**Option A**: Keep AuthGuard (strict)
```tsx
<AuthGuard>
  <UploadPage />
</AuthGuard>
```

**Option B**: Inline check (softer)
```tsx
{!isAuthenticated ? (
  <div className="text-center">
    <Camera className="w-16 h-16 mx-auto mb-4" />
    <h2>Sign In to Upload Receipts</h2>
    <p>Create an account to start earning points</p>
    <button onClick={() => setShowAuth(true)}>Sign In</button>
  </div>
) : (
  <UploadArea />
)}
```

---

## Best Practices

### 1. Show, Don't Hide
❌ Don't hide content from unauthenticated users  
✅ Show content with "Sign in to interact" CTAs

### 2. Clear Value Proposition
❌ Generic "Sign in required"  
✅ "Sign in to redeem this perk" (specific benefit)

### 3. Gradual Engagement
1. User browses publicly
2. Finds something interesting
3. Clicks to interact
4. Prompted to sign in
5. Returns to complete action

### 4. Preserve Context
When redirecting to sign-in:
- Remember what they were trying to do
- Return them to that action after sign-in
- Pre-fill forms with any entered data

---

## AuthModal Integration

For public pages with inline auth prompts:

```tsx
const [showAuthModal, setShowAuthModal] = useState(false);

<button onClick={() => setShowAuthModal(true)}>
  Sign In to Continue
</button>

<AuthModal 
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  defaultMode="signin"
/>
```

After successful auth, `useAuth()` will update and the page will show authenticated content automatically.

---

## Summary

**Public Access (Browse)**:
- `/` - Homepage
- `/deals` - Daily Deals
- `/rewards` - Rewards info + example
- `/rewards/premium` - Premium benefits
- `/rewards/perks` - Browse perks

**Auth Required (Interact)**:
- Uploading receipts
- Redeeming perks  
- Viewing personal profile
- Managing subscription
- Seeing personal stats/points

**Philosophy**: Let users explore the app freely, then sign in when they find value.

