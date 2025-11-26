# Reusable Components Guide

Complete guide to all new reusable components created for the unified Dank Network system.

## Auth Components

### AuthGuard

**Purpose**: Protect pages that require authentication

**Location**: `components/auth/AuthGuard.tsx`

**Usage**:
```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

**Props**:
- `children` - Content to show when authenticated
- `redirectTo` - Where to send users to sign in (default: `/deals`)
- `loadingComponent` - Custom loading UI
- `fallbackComponent` - Custom "sign in required" UI

**Features**:
- Automatic loading state
- Beautiful fallback UI with sign-in prompt
- Customizable redirect

---

### PremiumGuard

**Purpose**: Protect premium features/pages

**Location**: `components/auth/PremiumGuard.tsx`

**Usage**:
```tsx
import { PremiumGuard } from '@/components/auth/PremiumGuard';

export default function PremiumFeaturePage() {
  return (
    <PremiumGuard feature="advanced analytics">
      <YourPremiumContent />
    </PremiumGuard>
  );
}
```

**Props**:
- `children` - Content to show for premium users
- `upgradeUrl` - Where to send users to upgrade (default: `/rewards/premium`)
- `feature` - Feature name for messaging
- `loadingComponent` - Custom loading UI
- `fallbackComponent` - Custom upgrade prompt UI

**Features**:
- Automatic premium status check
- Beautiful upgrade prompt
- Feature-specific messaging

---

### AuthModal

**Purpose**: Simple modal for sign in/sign up

**Location**: `components/auth/AuthModal.tsx`

**Usage**:
```tsx
import { AuthModal } from '@/components/auth/AuthModal';

const [showAuth, setShowAuth] = useState(false);

<button onClick={() => setShowAuth(true)}>Sign In</button>
<AuthModal 
  isOpen={showAuth} 
  onClose={() => setShowAuth(false)}
  defaultMode="signin"
/>
```

**Props**:
- `isOpen` - Whether modal is visible
- `onClose` - Callback when modal closes
- `defaultMode` - 'signin', 'signup', or 'reset'

**Features**:
- Email/password authentication
- Sign in, sign up, and password reset
- Beautiful animations with Framer Motion
- Error and success messages
- Auto-fills user display name on signup

---

## Subscription Components

### PremiumBadge

**Purpose**: Show premium status indicator

**Location**: `components/subscription/PremiumBadge.tsx`

**Usage**:
```tsx
import { PremiumBadge } from '@/components/subscription/PremiumBadge';

<div className="flex items-center gap-2">
  <span>John Doe</span>
  <PremiumBadge size="sm" />
</div>
```

**Props**:
- `size` - 'sm', 'md', or 'lg'
- `showIcon` - Whether to show crown icon (default: true)
- `className` - Additional CSS classes

**Features**:
- Only shows for premium users
- Consistent styling across app
- Responsive sizing

---

### SubscriptionStatus

**Purpose**: Display subscription details with manage options

**Location**: `components/subscription/SubscriptionStatus.tsx`

**Usage**:
```tsx
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

<SubscriptionStatus showManageButton={true} />
```

**Props**:
- `showManageButton` - Show link to manage subscription
- `className` - Additional CSS classes

**Features**:
- Shows plan details (price, renewal date)
- Indicates canceled subscriptions
- Links to subscription management
- Loading and empty states

---

### UpgradePrompt

**Purpose**: Encourage users to upgrade to premium

**Location**: `components/subscription/UpgradePrompt.tsx`

**Usage**:
```tsx
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

// Inline version
<UpgradePrompt variant="inline" message="Upgrade for unlimited uploads" />

// Banner version
<UpgradePrompt variant="banner" />

// Card version (default)
<UpgradePrompt 
  variant="card"
  features={[
    'Feature 1',
    'Feature 2',
    'Feature 3',
  ]}
/>
```

**Props**:
- `variant` - 'inline', 'card', or 'banner'
- `message` - Custom message
- `features` - Array of features to highlight
- `className` - Additional CSS classes

**Features**:
- Three display variants for different contexts
- Only shows for non-premium users
- Customizable features list
- Links to premium upgrade page

---

## UI Components

### LoadingSkeleton

**Purpose**: Show loading placeholders with better perceived performance

**Location**: `components/ui/LoadingSkeleton.tsx`

**Components**:
- `Skeleton` - Basic skeleton block
- `CardSkeleton` - Skeleton for cards
- `StatCardSkeleton` - Skeleton for stat cards
- `ListItemSkeleton` - Skeleton for list items
- `ProfileSkeleton` - Skeleton for profile cards
- `TableSkeleton` - Skeleton for tables

**Usage**:
```tsx
import { 
  CardSkeleton, 
  StatCardSkeleton,
  ListItemSkeleton 
} from '@/components/ui/LoadingSkeleton';

{loading ? (
  <>
    <StatCardSkeleton />
    <CardSkeleton />
    <ListItemSkeleton />
  </>
) : (
  <ActualContent />
)}
```

**Benefits**:
- Better UX than spinners
- Indicates content structure
- Reduces perceived loading time

---

### Spinner

**Purpose**: Unified loading spinner

**Location**: `components/ui/Spinner.tsx`

**Usage**:
```tsx
import { Spinner, SpinnerPage } from '@/components/ui/Spinner';

// Inline spinner
<Spinner size="md" />

// Full page spinner
<SpinnerPage message="Loading..." />
```

**Props**:
- `size` - 'sm', 'md', 'lg', or 'xl'
- `className` - Additional CSS classes

---

### ErrorBoundary

**Purpose**: Catch React errors and show friendly UI

**Location**: `components/ui/ErrorBoundary.tsx`

**Usage**:
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features**:
- Catches component errors
- Shows friendly error message
- Refresh and retry buttons
- Shows error details in development

---

### ErrorMessage

**Purpose**: Display error messages

**Location**: `components/ui/ErrorMessage.tsx`

**Components**:
- `ErrorMessage` - Full error box
- `ErrorInline` - Inline error text
- `ErrorCard` - Error as a card

**Usage**:
```tsx
import { ErrorMessage, ErrorInline, ErrorCard } from '@/components/ui/ErrorMessage';

<ErrorMessage 
  title="Upload Failed"
  message="Please try again"
  retry={handleRetry}
/>

<ErrorInline message="Invalid email" />

<ErrorCard 
  title="Something went wrong"
  message="Please refresh the page"
/>
```

---

### ErrorPage

**Purpose**: Full page error state

**Location**: `components/ui/ErrorPage.tsx`

**Usage**:
```tsx
import { ErrorPage, NotFoundPage } from '@/components/ui/ErrorPage';

// Custom error
<ErrorPage 
  title="Connection Lost"
  message="Please check your internet"
  retry={reconnect}
/>

// 404 page
<NotFoundPage />
```

---

## Hooks

### useAuth

**Location**: `hooks/useAuth.tsx`

**Usage**:
```tsx
import { useAuth } from '@/hooks/useAuth';

const { 
  user,           // User object
  isAuthenticated, // Boolean
  isLoading,      // Boolean
  signIn,         // Function
  signUp,         // Function
  signOut         // Function
} = useAuth();
```

**Returns**:
- `user` - Supabase User object or null
- `isAuthenticated` - Boolean auth status
- `isLoading` - Loading state
- `signIn(email, password)` - Sign in function
- `signUp(email, password, displayName)` - Sign up function
- `signOut()` - Sign out function

---

### usePremium

**Location**: `hooks/usePremium.ts`

**Usage**:
```tsx
import { usePremium } from '@/hooks/usePremium';

const { 
  isPremium,      // Boolean
  subscription,   // Subscription object
  loading         // Boolean
} = usePremium();
```

**Returns**:
- `isPremium` - Whether user has active premium
- `subscription` - Full subscription object
- `loading` - Loading state

---

## Pages

### Subscription Management

**Location**: `app/account/subscription/page.tsx`

**Features**:
- View subscription details
- See renewal date
- Cancel subscription (coming soon)
- Update payment method (coming soon)
- Protected with AuthGuard
- Shows upgrade prompt if not premium

**Access**: `/account/subscription`

---

## Best Practices

### 1. Always Use Guards

```tsx
// ❌ Don't do this
export default function Page() {
  const { user } = useAuth();
  if (!user) return <div>Sign in required</div>;
  return <Content />;
}

// ✅ Do this
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Page() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
```

### 2. Use Loading Skeletons

```tsx
// ❌ Don't do this
{loading ? <Spinner /> : <Content />}

// ✅ Do this
{loading ? <CardSkeleton /> : <Content />}
```

### 3. Handle Errors Gracefully

```tsx
// ❌ Don't do this
{error && <div>Error</div>}

// ✅ Do this
{error && <ErrorMessage message={error} retry={refetch} />}
```

### 4. Show Premium Status

```tsx
// ❌ Don't do this
{isPremium && <span>Premium</span>}

// ✅ Do this
<PremiumBadge />
```

---

## Component Hierarchy

```
App
├── ErrorBoundary (top-level)
│   ├── AuthGuard (page-level)
│   │   └── PremiumGuard (feature-level)
│   │       └── Content
│   │           ├── PremiumBadge
│   │           ├── SubscriptionStatus
│   │           └── UpgradePrompt
│   └── AuthModal (global)
```

---

## Styling

All components use:
- Tailwind CSS utility classes
- Brand color tokens (`brand-primary`, `brand-ink`, etc.)
- Framer Motion for animations
- Lucide React icons

### Brand Colors Used
- `brand-primary` - Main accent color (#00FF88)
- `brand-ink` - Text color
- `brand-subtle` - Muted text
- `brand-bg` - Background
- `brand-card` - Card background
- `brand-success` - Success state
- `brand-error` - Error state
- `brand-warn` - Warning state

