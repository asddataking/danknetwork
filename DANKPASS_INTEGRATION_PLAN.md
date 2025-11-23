# DankPass Integration Plan

## Overview
Integrate the DankPass application into Dank Network with authentication required only for the DankPass section. The rest of the application remains publicly accessible.

## Current State Analysis

### Dank Network Structure
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (already configured)
- **Current Navigation**: Sidebar has external link to `https://www.dankpass.com`

### Existing Supabase Setup
- Supabase client already initialized in `lib/supabase.ts`
- Environment variables configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Currently used for Munchie Map places data

## Integration Plan

### Phase 1: Repository Analysis & Setup
**Objective**: Understand DankPass application structure and requirements

**Tasks**:
1. Clone and analyze DankPass repository from `https://github.com/asddataking/dankpass`
2. Identify:
   - Main components and pages
   - Database schema requirements
   - Dependencies needed
   - Authentication requirements
   - API endpoints
   - Styling approach
3. Document any additional Supabase tables/schemas needed
4. List all dependencies to install

**Deliverables**:
- Component inventory
- Database schema requirements
- Dependency list
- Integration points identified

---

### Phase 2: Supabase Authentication Setup
**Objective**: Configure Supabase Auth for DankPass section

**Tasks**:
1. **Enable Supabase Authentication**:
   - Access Supabase dashboard
   - Enable Email/Password provider
   - Configure email templates (optional customization)
   - Set Site URL to production domain
   - Configure redirect URLs for auth callbacks

2. **Create Auth Helper Functions**:
   - Create `lib/auth.ts` with:
     - `getAuthClient()` - Get authenticated Supabase client
     - `signIn(email, password)` - Sign in function
     - `signUp(email, password)` - Sign up function
     - `signOut()` - Sign out function
     - `getCurrentUser()` - Get current authenticated user
     - `onAuthStateChange(callback)` - Listen to auth state changes

3. **Create Auth Context/Provider**:
   - Create `components/auth/AuthProvider.tsx` to:
     - Manage global auth state
     - Provide auth methods to components
     - Handle session persistence
     - Redirect logic for protected routes

**Deliverables**:
- Supabase Auth configured
- Auth helper functions
- Auth context/provider component

---

### Phase 3: Route Protection & Middleware
**Objective**: Protect only the DankPass route while keeping rest public

**Tasks**:
1. **Create Route Protection**:
   - Create `components/auth/ProtectedRoute.tsx`:
     - Check authentication status
     - Redirect to sign-in if not authenticated
     - Show loading state during check
     - Allow access if authenticated

2. **Create Middleware** (if needed):
   - Create `middleware.ts` at root:
     - Protect `/dankpass/*` routes
     - Allow all other routes publicly
     - Handle auth redirects

3. **Create Sign-In Page**:
   - Create `app/dankpass/sign-in/page.tsx`:
     - Sign-in form (email/password)
     - Sign-up option
     - Error handling
     - Redirect to `/dankpass` after successful auth
     - Link back to homepage

**Deliverables**:
- Protected route component
- Middleware (if needed)
- Sign-in page

---

### Phase 4: DankPass Route Integration
**Objective**: Create the DankPass route structure and integrate components

**Tasks**:
1. **Create Route Structure**:
   ```
   app/dankpass/
   ├── layout.tsx          # Layout with auth check
   ├── page.tsx            # Main DankPass page (protected)
   ├── sign-in/
   │   └── page.tsx        # Sign-in page (public)
   └── [other routes]/     # Additional DankPass routes
   ```

2. **Update Navigation**:
   - Update `components/Sidebar.tsx`:
     - Change DankPass link from external to internal (`/dankpass`)
     - Remove `external: true` flag
   - Update `components/BottomNav.tsx` (optional):
     - Add DankPass link if needed for mobile

3. **Integrate DankPass Components**:
   - Copy/adapt components from DankPass repo
   - Ensure styling matches Dank Network theme
   - Update imports and paths
   - Test component functionality

4. **Database Integration**:
   - Use Supabase MCP to create required tables
   - Set up Row Level Security (RLS) policies
   - Create any necessary functions/triggers
   - Migrate data if needed

**Deliverables**:
- `/dankpass` route structure
- Updated navigation
- Integrated DankPass components
- Database tables and policies

---

### Phase 5: Homepage Integration
**Objective**: Add DankPass link/CTA on homepage

**Tasks**:
1. **Add DankPass Section to Homepage**:
   - Create `components/DankPassSection.tsx`:
     - Eye-catching CTA card
     - "Sign In to DankPass" button
     - Brief description
     - Matches Dank Network design system
   
2. **Update Homepage**:
   - Add DankPass section to `app/page.tsx`
   - Position appropriately (after Shop Showcase or Munchie Map)
   - Link to `/dankpass` (will redirect to sign-in if not authenticated)

**Deliverables**:
- DankPass homepage section component
- Updated homepage with DankPass CTA

---

### Phase 6: Styling & Theme Consistency
**Objective**: Ensure DankPass matches Dank Network design

**Tasks**:
1. **Review Styling**:
   - Ensure DankPass uses same color scheme (neon-green, black, dark-surface)
   - Match typography (Inter font)
   - Consistent spacing and layout patterns
   - Responsive design (mobile-first)

2. **Update Components**:
   - Apply Tailwind classes matching Dank Network
   - Update any custom CSS to match theme
   - Ensure dark mode consistency

**Deliverables**:
- Styled DankPass components
- Consistent design system

---

### Phase 7: Testing & Validation
**Objective**: Ensure everything works correctly

**Tasks**:
1. **Authentication Testing**:
   - Test sign-up flow
   - Test sign-in flow
   - Test sign-out flow
   - Test session persistence
   - Test protected route access

2. **Public Access Testing**:
   - Verify all other routes remain public
   - Test homepage, shop, munchie-map, etc. without auth
   - Ensure no auth required for public routes

3. **Integration Testing**:
   - Test navigation from homepage to DankPass
   - Test redirect flow (unauthenticated → sign-in → DankPass)
   - Test all DankPass functionality
   - Test database operations

4. **Edge Cases**:
   - Expired sessions
   - Invalid credentials
   - Network errors
   - Database connection issues

**Deliverables**:
- Test results
- Bug fixes
- Documentation of any issues

---

### Phase 8: Documentation & Deployment
**Objective**: Document changes and prepare for deployment

**Tasks**:
1. **Update Documentation**:
   - Update `README.md` with DankPass info
   - Document authentication flow
   - Update environment variables if needed
   - Document database schema changes

2. **Environment Variables**:
   - Verify all required env vars are documented
   - Ensure Supabase credentials are set
   - Check for any new dependencies

3. **Deployment Checklist**:
   - All tests passing
   - Database migrations ready
   - Environment variables configured
   - Build successful
   - No console errors

**Deliverables**:
- Updated documentation
- Deployment checklist
- Environment variable documentation

---

## Technical Implementation Details

### File Structure (Proposed)
```
danknetwork/
├── app/
│   ├── dankpass/
│   │   ├── layout.tsx              # Protected layout
│   │   ├── page.tsx                # Main DankPass page
│   │   └── sign-in/
│   │       └── page.tsx            # Sign-in page
│   └── [existing routes...]
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx        # Auth context provider
│   │   ├── ProtectedRoute.tsx      # Route protection component
│   │   ├── SignInForm.tsx          # Sign-in form component
│   │   └── SignUpForm.tsx          # Sign-up form component
│   ├── DankPassSection.tsx         # Homepage CTA component
│   └── [existing components...]
├── lib/
│   ├── auth.ts                     # Auth helper functions
│   ├── supabase.ts                 # (existing, may need updates)
│   └── [existing lib files...]
└── middleware.ts                   # (optional) Route protection
```

### Authentication Flow
1. User clicks "DankPass" link from homepage
2. Navigate to `/dankpass`
3. `ProtectedRoute` checks authentication
4. If not authenticated → redirect to `/dankpass/sign-in`
5. User signs in → redirect to `/dankpass`
6. User can access DankPass features

### Database Considerations
- Use existing Supabase project
- Create DankPass-specific tables if needed
- Set up RLS policies for user data
- Ensure proper indexes for performance

---

## Dependencies to Install (Potential)
Based on typical authentication needs:
- `@supabase/auth-helpers-nextjs` (if using Next.js auth helpers)
- Additional dependencies from DankPass repo (TBD after analysis)

---

## Success Criteria
✅ Users can access DankPass from homepage
✅ Authentication required only for DankPass section
✅ All other routes remain publicly accessible
✅ Sign-in/sign-up flow works smoothly
✅ Session persistence works correctly
✅ Design matches Dank Network theme
✅ Responsive on all devices
✅ No breaking changes to existing functionality

---

## Next Steps
1. Begin with Phase 1: Analyze DankPass repository
2. Set up Supabase Authentication
3. Create authentication infrastructure
4. Integrate DankPass components
5. Test thoroughly
6. Deploy

---

## Notes
- Keep existing functionality intact
- Maintain public access to all non-DankPass routes
- Use existing Supabase instance
- Follow Dank Network design patterns
- Ensure mobile responsiveness


