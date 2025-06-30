# Hopium Enhanced Onboarding Flow

## 🌙 HOPIUM ONBOARDING FLOW: *"Your Journey Begins…"*

### 🎬 Step 0: ✨ "Welcome to Hopium"

* **Animated opening**: Slow, warm pulse animation with soft calligraphy
* **Haptic pattern**: Gentle rhythmic pulse synchronized with visuals
* **Message**: "This isn't just an app. It's your quiet companion in a noisy world."
* **Interaction**: Press and hold to begin journey (with haptic confirmation)

> [VIDEO PLACEHOLDER] - Custom opening animation to be added

---

### 🧠 Step 1: **"Why Are You Here?"**

> (Tap one or more emotional motivations)

* 🙏 "I want to reconnect with prayer"
* 🧘 "I need peace from my hectic life"
* ⏱ "I keep forgetting and missing prayers"
* 💭 "I want to form a habit"
* ✍️ "Other" (Custom input)

> 📌 Purpose: Creates **emotional anchoring**, lets us personalize Lopi & tips from Day 1

---

### 📖 Step 1.5: **"Your Prayer Story"**

> Understanding where you are in your journey

* "Returning after a break"
* "Just starting my journey"
* "Maintaining my practice"
* "Seeking deeper connection"

> This helps tailor content difficulty and Lopi's guidance approach

---

### 🎨 Step 2: **Choose Your Vibe**

> Pick a theme + tone for your journey

* 🌙 Serene (Minimal, soothing blue/green)
* 🔥 Degen (Dark mode, motivational)
* 🐣 Beginner (Friendly + educational)
* 🎨 Custom builder (optional, for later MVPs)

✨ **Micro-interaction**: Theme preview swatch animates as you hover/tap with subtle haptic feedback

---

### 📍 Step 3: **Prayer Orientation**

> Set technical + spiritual preferences:

* Qibla: Ask for location (gently, respectfully)
* Calc Method: Dropdown (auto-suggested)
* Hijri Calendar Offset? (+1/-1)
* Auto Location Updates? Toggle

🧭 Visual: show a mini "compass to Kaaba" animation — gives orientation metaphor

> [VISUALIZATION PLACEHOLDER] - Global visualization showing connection to Kaaba

---

### 🙏 Step 3.5: **Prayer Baseline**

> "Which prayers do you currently observe regularly?"

* [ ] Fajr
* [ ] Dhuhr
* [ ] Asr
* [ ] Maghrib
* [ ] Isha

> Sets realistic starting points for streaks and prevents discouragement

---

### ⏰ Step 4: **Reminders That Work for You**

* "When should we nudge you?"

  * 🌅 Before prayer
  * 🕌 After adhan
  * ⏳ Just before it ends
* Vibe options:

  * 🔔 Soft reminder
  * 📿 Lopi's spiritual nudge
  * 🤫 No reminder (manual)

🎵 Preview each reminder with unique haptic pattern
🧠 Explain why this helps: "Tiny nudges make big habits."

---

### 🎯 Step 5: **Set Your Intention**

> Inspired by Duolingo and Calm

"You've taken the first step. What's your intention for this week?"

* "Pray 3 out of 5 daily prayers"
* "Never miss Maghrib"
* "Feel better after each prayer"
* Or: "Set later"

🎉 Celebrate with glowing text and distinct haptic pulse: "You've set your intention. Hopium will help you hold it."

---

### 🤖 Final Step: Meet Lopi (optional)

* Avatar introduction:

  * "I'm Lopi — your spiritual companion"
  * Offers encouragement, insights, gentle reminders
  * Ask: "Want daily advice from me?" → opt-in toggle

> [CUSTOM LOPI MESSAGE PLACEHOLDER] - Personalized based on user's motivations

---

### 👥 Community Preview (optional)

* Anonymous visualization of others on similar journeys
* "You're joining 1,247 others who started their journey this week"
* Creates belonging without social pressure

---

### 🎁 Completion Screen

* **Big animation**: Floating prayer orbs or streak tree sprouting with synchronized haptics
* "Your journey starts now"
* [🔓 Start Your First Prayer →]

> [ANIMATION PLACEHOLDER] - Final celebration animation to be added

---

## 🧠 Technical Implementation

### Data Structure

```typescript
// Core onboarding state management
interface OnboardingState {
  step: number;
  motivations: string[];
  prayerStory: string;
  theme: 'serene' | 'degen' | 'beginner' | 'custom';
  prayerBaseline: Record<string, boolean>;
  intentions: string[];
  lopiEnabled: boolean;
  completedAt?: Date;
}

// Supabase tables
tables:
  - user_onboarding: Stores onboarding state and progress
  - user_intentions: Tracks weekly intentions and completion
  - user_motivations: Stores motivation tags for personalization
```

### Stack Implementation

| Feature         | Stack Tips                                           |
| --------------- | ---------------------------------------------------- |
| Animation       | Lottie.js or Framer Motion (lightweight, smooth)     |
| Haptics         | React Native Haptic Feedback or Web Vibration API    |
| Progress flow   | Controlled form with Zustand or React Hook Form      |
| Onboarding data | Save in Supabase `user_settings` + `user_intentions` |
| Optional steps  | Gate Lopi until onboarding finished                  |
| Emotion hook    | Store `motivation` answer for Lopi's first messages  |

### Motivation Tagging System

Create a weighted tag system from their "Why Are You Here?" selections to influence:
- Lopi's conversation style
- Dashboard content prioritization
- Notification messaging

---

## 🧪 MVP Optimization Plan

1. **Basic flow** = name, theme, qibla, reminder
2. **Enhanced flow** = add "Why", Lopi intro, streak goal
3. **Full experience** = all steps including prayer baseline and story
4. A/B test bounce rate + first 3-day retention across versions

### Measurement Framework

**Key Metrics**:
- Completion rate (overall and per step)
- Time spent on emotional vs. technical steps
- Correlation between motivation selections and 30-day retention

**Qualitative Feedback**:
- Optional "how did this make you feel?" single-question survey at end
- Sentiment analysis on first interactions with Lopi

---

## 🪄 Closing Vibe

The onboarding should feel like a **soft sunrise**, not a checklist.

It's not "set up the app."

It's:

> "Begin your sacred rhythm. We'll make sure it sticks — with love, with care, and with a little Hopium."
