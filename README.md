# Dank Network

**Unified platform for DankPass Rewards, Daily Dispo Deals, and cannabis content.**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase, Stripe, and Gemini API keys

# Run dev server
npm run dev
```

Visit `http://localhost:3000`

**First time?** → Read **[MASTER_GUIDE.md](MASTER_GUIDE.md)**

---

## 📱 Features

### DankPass Rewards
- 📸 Upload receipts, earn points
- 🎁 Redeem perks from partners
- 👑 Premium membership (1.5x points)
- 🤖 AI-powered receipt OCR (Gemini Flash)

### Daily Dispo Deals
- 📧 Daily email newsletter
- 🌿 Curated dispensary deals
- 🏆 Free tier (top 3) vs Premium (full list)
- 🤖 AI-powered deal extraction

### Premium Subscription
- 💎 $4.20/month network-wide
- ⚡ Unlocks all premium features
- 🎯 Single subscription for everything

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (Postgres)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: Google Gemini Flash
- **Storage**: Supabase Storage
- **Email**: MailerSend
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion

---

## 📚 Documentation

### Getting Started
- **[MASTER_GUIDE.md](MASTER_GUIDE.md)** - Complete system overview
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step setup
- **[ENV_SETUP.md](ENV_SETUP.md)** - Environment variables

### Development
- **[COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md)** - UI component library
- **[PUBLIC_ACCESS_GUIDE.md](PUBLIC_ACCESS_GUIDE.md)** - Auth patterns
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Roadmap & easy wins

### Features
- **[RECEIPT_UPLOAD_IMPLEMENTATION.md](RECEIPT_UPLOAD_IMPLEMENTATION.md)** - Receipt OCR system
- **[DAILY_DISPO_DEALS_SETUP.md](DAILY_DISPO_DEALS_SETUP.md)** - Deals newsletter

---

## 🎯 Current Status

### ✅ Complete & Working
- Unified Supabase Auth
- Premium subscription system
- Receipt upload with Gemini OCR
- Daily Dispo Deals newsletter
- Subscription management
- Reusable component library
- Error handling & loading states

### ⏳ Ready (After Tables Applied)
- Receipt points awarded to accounts
- Perk redemption tracking
- Points transactions log
- Partner multipliers

### 🔮 Planned
- Admin dashboard
- Partner management
- Email notifications
- Referral system

---

## 🚦 Next Steps

### This Week (Quick Wins)
1. ✅ Configure storage policies (5 min)
2. ✅ Test receipt upload (30 min)
3. 🔲 Add AuthModal to pages (1 hour)
4. 🔲 Make rewards browsable (1-2 hours)
5. 🔲 Mobile responsive check (1 hour)

**See [NEXT_STEPS.md](NEXT_STEPS.md) for complete roadmap**

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────┐
│          Next.js 14 App                 │
├─────────────────────────────────────────┤
│  Auth (useAuth)     Premium (usePremium)│
│         ↓                    ↓           │
│    Supabase Auth      subscriptions     │
│         ↓                    ↓           │
│  ┌──────────┐        ┌──────────┐       │
│  │ Rewards  │        │  Deals   │       │
│  │ System   │        │  System  │       │
│  └──────────┘        └──────────┘       │
│       ↓                    ↓             │
│  ┌────────────────────────────┐         │
│  │   Supabase (Postgres)      │         │
│  └────────────────────────────┘         │
└─────────────────────────────────────────┘
         ↓              ↓           ↓
    Gemini Flash    Stripe     MailerSend
     (OCR)        (Payments)    (Email)
```

---

## 🔑 Key Concepts

### Public-First Design
- Anyone can browse content
- Sign-in only required for interactions
- Demo/example content for guests
- Smooth auth flow when needed

### Unified Premium
- Single subscription ($4.20/mo)
- Unlocks ALL premium features
- Network-wide benefits
- One source of truth (`subscriptions` table)

### Component Library
- Reusable auth/premium components
- Consistent loading & error states
- Mobile-responsive by default
- Accessible & performant

---

## 🧪 Testing

```bash
# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📦 Deployment

### Environment Variables
See [ENV_SETUP.md](ENV_SETUP.md) for complete list.

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PREMIUM_PRICE_ID`
- `GEMINI_API_KEY`

### Deploy to Vercel
```bash
vercel deploy
```

**See [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) for deployment config**

---

## 🤝 Contributing

1. Read [MASTER_GUIDE.md](MASTER_GUIDE.md)
2. Check [NEXT_STEPS.md](NEXT_STEPS.md) for tasks
3. Follow existing patterns in [COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md)
4. Test your changes
5. Submit PR

---

## 📄 License

All rights reserved - Dank Network

---

## 📞 Support

**Questions?**
1. Check documentation above
2. Search codebase for examples
3. Review component library
4. Check Supabase/Stripe/Gemini docs

---

**Built with 💚 by the Dank Network team**
