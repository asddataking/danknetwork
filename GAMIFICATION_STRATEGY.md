# Gamification Strategy - Dank Network

**Goal**: Engage free users and drive premium conversions through fun, rewarding game mechanics.

---

## Philosophy

### Earn & Burn Model
- **EARN**: Upload receipts, complete actions → Get points
- **BURN**: Redeem perks → Spend points

### Free-to-Premium Funnel
- Free users get taste of rewards
- Premium unlocks accelerated earning
- Show premium benefits at key moments

---

## Free User Gamification Features

### 1. **Welcome Bonus** 🎁
**What**: Instant points on signup  
**Amount**: 100 points  
**Why**: Immediate gratification, enough to redeem first perk

**Implementation**:
```sql
-- Trigger on user signup
CREATE OR REPLACE FUNCTION award_signup_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 100 points
  PERFORM award_points(
    NEW.id,
    100,
    'earn',
    'signup_bonus',
    NEW.id,
    'Welcome to Dank Network! 🎉'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION award_signup_bonus();
```

**UI**: 
- Show celebration animation on signup
- "You earned 100 points! Browse perks →"

---

### 2. **Daily Check-In Streak** 🔥
**What**: Bonus points for consecutive daily logins  
**Rewards**:
- Day 1: 10 points
- Day 2: 15 points
- Day 3: 20 points
- Day 7: 50 points (Premium: 100 points)
- Day 30: 200 points (Premium: 400 points)

**Premium Upsell**:
- "Premium users get 2x streak bonuses!"
- Show locked premium rewards in streak calendar

**Database**:
```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_check_in DATE,
  total_check_ins INTEGER DEFAULT 0
);
```

**UI**:
- Flame emoji (🔥) with streak count
- Calendar showing check-in history
- "Don't break your streak!" notification
- Compare to friends' streaks (social proof)

---

### 3. **Achievement Badges** 🏆
**What**: Unlock badges for completing milestones  
**Categories**:
- **Earner Badges**: Points milestones
  - Bronze Earner: 500 points earned
  - Silver Earner: 1,000 points
  - Gold Earner: 5,000 points (Premium: 2,500 points)
  - **Premium Diamond Earner**: 10,000 points

- **Burner Badges**: Redemption milestones
  - First Timer: First perk redeemed
  - Bargain Hunter: 5 perks redeemed
  - High Roller: Redeemed 10+ perks (Premium: 5+)
  - **Premium Whale**: Redeemed 50+ perks

- **Streak Badges**:
  - Week Warrior: 7-day streak
  - Month Master: 30-day streak (Premium: 14-day)
  - **Premium Year Champion**: 365-day streak

- **Social Badges**:
  - Referral Rookie: 1 referral
  - Influencer: 5 referrals
  - **Premium Ambassador**: 20 referrals

**Premium Upsell**:
- Show locked premium badges with "Upgrade to unlock"
- Premium badges are gold/animated
- Free badges are bronze/static

**Database**:
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_premium_only BOOLEAN DEFAULT false,
  points_bonus INTEGER DEFAULT 0 -- Bonus points for unlocking
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
```

**UI**:
- Badge showcase on profile
- Progress bars toward next badge
- Celebration animation on unlock
- Share badge on social media

---

### 4. **Leaderboard** 📊
**What**: Weekly/monthly rankings  
**Categories**:
- Most points earned this week
- Most perks redeemed
- Longest streak
- Top earners all-time

**Premium Upsell**:
- Free users see top 10
- Premium users see full leaderboard
- Premium badge next to premium users
- "Upgrade to compete in Premium League"

**Privacy**:
- Users can opt-out of leaderboard
- Show display name or anonymous "User #1234"

**UI**:
- Trophy emojis for top 3
- Your rank highlighted
- "You're 23 points away from #10!"

---

### 5. **Limited-Time Challenges** ⏰
**What**: Weekly missions for bonus points  
**Examples**:
- "Upload 3 receipts this week" → 50 bonus points
- "Redeem any perk" → 25 points back
- "Check in 5 days" → 100 bonus points
- **Premium**: "Upload 5 receipts" → 200 bonus points

**Premium Upsell**:
- Free: 1-2 challenges/week
- Premium: 5+ challenges/week with better rewards

**Database**:
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirement_type TEXT, -- 'receipt_count', 'redeem_perk', 'check_in'
  requirement_value INTEGER,
  points_reward INTEGER,
  is_premium_only BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);

CREATE TABLE user_challenges (
  user_id UUID REFERENCES auth.users(id),
  challenge_id UUID REFERENCES challenges(id),
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  claimed BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, challenge_id)
);
```

**UI**:
- Challenge card with progress bar
- "2/3 receipts uploaded"
- Claim reward button when complete
- Push notification when new challenge available

---

### 6. **Receipt Upload Limits (Free Tier)** 📸
**What**: Free users limited to 15 receipts/month  
**Counter**: "12/15 receipts used this month"

**Premium Upsell**:
- Show counter prominently
- "3 receipts left → Upgrade for unlimited"
- When limit hit: Modal with premium CTA
- Compare: "$4.20/mo for unlimited vs $0 for 15/mo"

**UI**:
- Progress ring showing uploads
- Red when close to limit
- Upgrade button in upload page

---

### 7. **Points Multiplier Boost Events** ⚡
**What**: Limited-time 2x or 3x points events  
**Examples**:
- "Happy Hour: 2x points from 6-8pm"
- "Weekend Warrior: 2x points Saturday-Sunday"
- "Partner Spotlight: 3x points at [Partner] this week"
- **Premium**: Always get the boost + exclusive 5x events

**Premium Upsell**:
- "Premium users get 5x points during this event!"
- Show what premium users are earning
- Timer countdown: "Upgrade in next 2 hours for boost"

**UI**:
- Animated badge on upload button
- "2x POINTS ACTIVE" banner
- Push notification when event starts

---

### 8. **Referral Program** 🎪
**What**: Earn points for inviting friends  
**Rewards**:
- Referrer: 200 points when friend signs up
- Referrer: 100 points when friend uploads first receipt
- Friend: 150 signup bonus (instead of 100)

**Premium Upsell**:
- Free: 200 points per referral
- Premium: 400 points per referral
- Premium: Unlimited referrals (free: max 10/month)

**Mechanics**:
```sql
-- Track referrals
INSERT INTO referrals (referrer_id, referred_id, referral_code, status)
VALUES (...);

-- When referred user signs up
UPDATE referrals SET status = 'completed' WHERE ...;
PERFORM award_points(referrer_id, 200, 'earn', 'referral', ...);
```

**UI**:
- Unique referral code: "DANK-JOHN420"
- Share buttons (SMS, WhatsApp, Email, Copy)
- "3 friends joined! Earned 600 points"
- Leaderboard of top referrers

---

### 9. **Tier System with Visual Progression** 🎖️
**What**: Earn tier as you gain points  
**Tiers**:
- Bronze: 0-999 points
- Silver: 1,000-2,499 points
- Gold: 2,500-4,999 points
- Platinum: 5,000+ points
- **Premium Diamond**: Premium users get exclusive tier

**Benefits per Tier**:
- Bronze: 1x points
- Silver: 1.1x points, 5% off perks
- Gold: 1.25x points, 10% off perks
- Platinum: 1.5x points, 15% off perks (still < Premium 1.5x + unlimited)
- **Premium Diamond**: 2x points, 20% off perks, exclusive perks

**Premium Upsell**:
- "Platinum is great, but Diamond is forever"
- Show premium-only perks locked
- "Skip the grind → Premium"

**UI**:
- Tier badge with progress bar
- "234 points to Gold tier!"
- Tier benefits breakdown
- Animate tier up celebration

---

### 10. **Mystery Rewards / Loot Boxes** 🎁
**What**: Random chance rewards  
**Types**:
- Daily spin: 10-100 points (1 spin/day, Premium: 3 spins)
- Mystery perk: Random perk for 500 points
- Scratch card: Win 2x-5x points on next upload

**Premium Upsell**:
- Free: 1 spin/day, 10-100 points
- Premium: 3 spins/day, 50-500 points
- Premium-only: "Golden Loot Box" (1000 points guaranteed)

**UI**:
- Slot machine animation
- "You won 75 points!"
- Suspense before reveal
- Sound effects

---

## Premium Conversion Strategies

### Contextual Upsells

#### 1. **At Receipt Upload Limit**
```
❌ You've hit your monthly limit (15/15)
💎 Premium: Unlimited uploads
⚡ Premium: 1.5x points on every upload
🎯 Upgrade for $4.20/mo →
```

#### 2. **When Burning Points**
```
You're burning 500 points for this perk.
💎 Premium users get 20% off all perks!
   This would cost you only 400 points.
   
   Saved: 100 points per redemption
   Premium: $4.20/month
   
   [Upgrade to Premium →]
```

#### 3. **On Leaderboard**
```
🏆 You're #15 this week!

Top players are Premium:
#1: @dankvader 🔥 (2,450 pts) 👑
#2: @420blazeit (2,100 pts) 👑
#3: @greengoddess (1,895 pts) 👑

Premium users earn 1.5x points.
[Join the Premium League →]
```

#### 4. **When Viewing Premium Badge**
```
🔒 Premium Diamond Earner
    Unlock at 10,000 points
    
    (You're at 3,200 points)
    
    💎 OR upgrade to Premium and get
       this badge immediately + 2x earning
       
    [Unlock with Premium →]
```

#### 5. **During Multiplier Event**
```
🔥 2x Points Weekend Active!

You're earning: 2x points
Premium users: 3x points (2x event + 1.5x premium)

On a $50 receipt:
You earn: 200 points
Premium: 300 points

[Get 1.5x more →]
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. ✅ Welcome bonus (100 points on signup)
2. ✅ Receipt upload limit counter
3. ✅ Basic leaderboard (top 10)
4. ✅ Tier progression (Bronze → Platinum)

### Phase 2: Engagement (3-5 days)
1. Daily check-in streak system
2. Achievement badges (3-5 starter badges)
3. Referral program
4. Limited-time challenges (weekly)

### Phase 3: Premium Conversion (2-3 days)
1. Contextual upsells at key moments
2. Premium vs Free comparison tables
3. Premium-only badges/features
4. A/B test messaging

### Phase 4: Advanced (1-2 weeks)
1. Mystery rewards / daily spin
2. Points multiplier events
3. Social features (compare with friends)
4. Push notifications

---

## Metrics to Track

### Engagement Metrics
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Avg. check-ins per week
- Avg. receipts uploaded per user
- Streak retention (% keeping 7-day streak)

### Conversion Metrics
- Free → Premium conversion rate
- Time to conversion (days from signup)
- Conversion source (which upsell worked)
- Churn rate after seeing limit

### Economy Metrics
- Avg. points earned per user
- Avg. points burned per user
- Points velocity (earn/burn ratio)
- Most popular perks
- Premium vs Free earning delta

---

## Balancing the Economy

### Points Value
- $1 spent = 2 points (free)
- $1 spent = 3 points (premium, 1.5x)
- Average perk cost: 300-500 points
- Time to first perk: 3-5 receipts (free), 2-3 receipts (premium)

### Perk Pricing
- Entry perks: 100-300 points
- Mid-tier perks: 300-800 points
- Premium perks: 800-2000 points
- Exclusive premium perks: 500+ points (premium only)

### Free User Math
- Monthly limit: 15 receipts
- Avg receipt: $30
- Avg points: 30 × 2 × 15 = 900 points/month
- Can redeem: 2-3 perks/month
- **Need 3+ perks/month?** → Upgrade to premium

### Premium User Math
- Unlimited receipts
- 1.5x multiplier
- Same $450/month spending
- Points: 450 × 3 = 1,350 points/month
- Can redeem: 3-4 perks/month
- Extra perks/month: +1-2
- Cost: $4.20/month
- **Value prop**: Clear win if 3+ receipts/week

---

## Success Criteria

### Engagement Goals
- 40% of users return within 7 days
- 60% of users upload 2+ receipts in first week
- 30% of users maintain 7-day streak

### Conversion Goals
- 5-10% free → premium conversion
- 50% of users hitting upload limit convert
- 30% of users viewing premium perks convert

### Retention Goals
- 80% retention at 7 days
- 60% retention at 30 days
- 40% retention at 90 days

---

**Strategy**: Make free tier fun and rewarding, but show clear value in upgrading. Premium should feel like a no-brainer for active users.

