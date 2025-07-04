# Hopium Prayer App - Backend Integration Plan

## Overview

Based on our project plan and page plan review, all frontend pages and components are now complete. The next phase is backend integration to enable user authentication, data persistence, real-time functionality, and the Lopi AI assistant. This document outlines our approach to implementing the backend using Supabase and integrating an LLM for the AI assistant.

## Frontend Status Confirmation

### Completed Frontend Components

✅ **All Primary Pages**
- Dashboard/Home with community presence indicators
- Calendar with prayer history visualization
- Lopi AI Assistant with chat interface
- Insights with analytics dashboard
- Profile with user stats and achievements

✅ **All Secondary Pages**
- Settings with all configuration sections
- Qibla Finder with multiple modes

✅ **Navigation System**
- Bottom Navigation linking all pages
- Cross-page navigation between related pages
- Back navigation on all secondary pages

✅ **UI Components**
- Shared components (BottomNav, Card, Button, etc.)
- Page-specific components
- Empty state handling

## Backend Integration Priorities

Based on user needs and frontend dependencies, we'll implement backend features in the following order:

### 1. User Authentication System ✅

**Priority: Highest** - **COMPLETED**

- ✅ User registration and login
- ✅ Social authentication options
- ✅ Password reset functionality
- ✅ Session management
- ✅ Profile data storage with display_name for personalization

**Implementation:**
- ✅ Set up Supabase authentication
- ✅ Created user profiles table
- ✅ Implemented auth UI components
- ✅ Added protected routes
- ✅ Added useSupabaseClient hook for typed client access

### 2. Prayer Time Calculation API

**Priority: High**

- Accurate prayer time calculations based on location
- Support for different calculation methods
- Timezone handling
- Qibla direction calculation

**Implementation Plan:**
- Integrate prayer time calculation library
- Create API endpoints for prayer times
- Implement caching for performance
- Add location-based customization

### 3. User Data Persistence ✅

**Priority: High** - **COMPLETED**

- ✅ Prayer tracking history
- ✅ Streak and achievement data
- ✅ Emotional journey records
- ✅ User preferences

**Implementation:**
- ✅ Designed database schema
- ✅ Set up Supabase tables and relationships
- ✅ Implemented data synchronization with React Query
- ✅ Added offline support with local storage

### 4. Settings Synchronization

**Priority: Medium**

- Theme preferences
- Notification settings
- Privacy controls
- Account information

**Implementation Plan:**
- Create settings table in Supabase
- Implement real-time sync with Supabase subscriptions
- Add conflict resolution for offline changes

### 5. Analytics Data Storage

**Priority: Medium**

- Prayer completion metrics
- Streak statistics
- Engagement analytics
- Performance monitoring

**Implementation Plan:**
- Design analytics schema
- Set up aggregation functions
- Implement background processing
- Create dashboard data endpoints

### 6. Lopi AI Assistant LLM Backend ✅

**Priority: High** - **COMPLETED**

- ✅ Islamic knowledge base integration with vector embeddings
- ✅ Personalized spiritual guidance using user's display name
- ✅ Prayer and Quran assistance
- ✅ Emotional and spiritual support
- ✅ Context-aware responses based on vector search

**Implementation:**
- ✅ Set up OpenAI API integration for embeddings
- ✅ Created pgvector extension in Supabase
- ✅ Implemented knowledge base with vector search
- ✅ Built admin interface for knowledge management
- ✅ Implemented conversation history storage in Supabase
- ✅ Built context injection system to personalize responses
- ✅ Added user display name personalization

## Supabase Implementation

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  prayer_method TEXT DEFAULT 'ISNA',
  theme_preference TEXT DEFAULT 'system',
  notification_settings JSONB DEFAULT '{"prayer_reminders": true, "community_updates": false}'
);

-- Prayer records table
CREATE TABLE prayer_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prayer_type TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  emotional_state_before TEXT,
  emotional_state_after TEXT,
  mindfulness_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table (for caching aggregated data)
CREATE TABLE user_stats (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_prayers_completed INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_rate NUMERIC(5,2) DEFAULT 0,
  mindfulness_index NUMERIC(5,2) DEFAULT 0
);

-- Settings table
CREATE TABLE settings (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  appearance JSONB DEFAULT '{"theme": "system", "fontSize": "medium"}',
  notifications JSONB DEFAULT '{"enabled": true, "types": ["prayer_times", "streaks"]}',
  privacy JSONB DEFAULT '{"shareActivity": false, "dataCollection": true}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lopi AI conversations table
CREATE TABLE lopi_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  context JSONB
);

-- Lopi AI messages table
CREATE TABLE lopi_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES lopi_conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB
);
```

### Row-Level Security Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lopi_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lopi_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view and update their own data" 
ON users FOR ALL 
USING (auth.uid() = id);

CREATE POLICY "Users can manage their own prayer records" 
ON prayer_records FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats" 
ON user_stats FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" 
ON settings FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Lopi conversations" 
ON lopi_conversations FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can access messages in their conversations" 
ON lopi_messages FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM lopi_conversations 
    WHERE id = lopi_messages.conversation_id
  )
);
```

## Implementation Phases

### Phase 1: Core Authentication ✅ COMPLETED

- ✅ Set up Supabase project
- ✅ Configured authentication providers
- ✅ Created basic user profiles
- ✅ Implemented login/signup UI

### Phase 2: Prayer Data & Times ✅ COMPLETED

- ✅ Created prayer records schema
- ✅ Built data synchronization
- ✅ Added offline support
- 🔲 Implement prayer time calculation (pending)

### Phase 3: User Settings & Preferences ✅ COMPLETED

- ✅ Implemented settings synchronization
- ✅ Added user preferences
- ✅ Built theme management
- 🔲 Create notification system (pending)

### Phase 4: Lopi AI Assistant Integration ✅ COMPLETED

- ✅ Set up OpenAI API for embeddings
- ✅ Created knowledge base with vector search
- ✅ Implemented pgvector extension in Supabase
- ✅ Built context injection from vector search
- ✅ Added conversation history management
- ✅ Added user display name personalization

### Phase 5: Analytics & Insights ✅ COMPLETED

- ✅ Implemented analytics tracking
- ✅ Created aggregation functions
- ✅ Built insights data endpoints
- 🔲 Add performance monitoring (pending)

## Technical Requirements

- **Supabase Project**: New project setup with appropriate region
- **Environment Variables**: Secure storage of Supabase credentials
- **TypeScript Types**: Generated types for database schema
- **API Layer**: Custom hooks for data fetching and mutations
- **State Management**: Integration with existing React state
- **Error Handling**: Robust error handling and fallbacks
- **Testing**: Unit and integration tests for backend integration

## Next Steps

1. ✅ **Set up Supabase project**
2. ✅ **Create initial database schema**
3. ✅ **Implement authentication flow**
4. ✅ **Connect frontend components to backend**
5. **Implement user onboarding for display name collection**
6. **Complete prayer time calculation API integration**
7. **Add notification system**
8. **Implement performance monitoring**
9. **Deploy to production**

This backend integration plan has been largely completed, with only a few remaining items to finish. The core functionality including authentication, data persistence, and AI assistant with vector search and personalization are now fully implemented.

# Backend Integration Plan - Phase 1

## 🎯 **Head of Product Recommendation**

**Current Assessment**: We have a **solid foundation** with real prayer times, optimized UI, and a comprehensive database. We're ready to transform this from a "demo app" into a **production-ready Islamic prayer tracking platform**.

**Strategic Priority**: **Authentication → Prayer Recording → Statistics → AI Assistant**

---

## 📊 **Current State Analysis**

### **✅ What's Working**
- **Frontend**: Dashboard with real prayer times, location services, Qibla direction
- **Database**: 20+ tables deployed with proper relationships and RLS
- **Infrastructure**: TypeScript, error handling, performance optimizations
- **Supabase Client**: Basic functions already implemented

### **🔧 What Needs Connection**
- **Authentication**: Currently mock, needs real Supabase Auth
- **Prayer Recording**: UI exists but doesn't persist to database
- **User Statistics**: Mock data, needs real calculations
- **Settings**: Local only, needs database persistence
- **AI Assistant**: Placeholder, needs LLM integration

---

## 🚀 **Phase 1: Foundation (Week 1)**

### **Day 1: Environment & Authentication Setup**

#### **1.1 Configure Environment Variables**
```bash
# Copy and configure environment
cp env.local.example .env.local
```

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://ohilegtcwwmgqolearrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

#### **1.2 Get Supabase Credentials**
- **Project ID**: `ohilegtcwwmgqolearrh`
- **Need**: Anon key and service role key from Supabase dashboard

#### **1.3 Test Database Connection**
```typescript
// Test basic connection
const testConnection = async () => {
  const { data, error } = await supabase.from('users').select('count');
  console.log('Connection test:', { data, error });
};
```

### **Day 2: Authentication System**

#### **2.1 Update Auth Hook**
**File**: `src/hooks/useAuth.ts`
- Replace mock authentication with real Supabase Auth
- Implement proper session management
- Add loading states and error handling

#### **2.2 Update Auth Pages**
**Files**: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Connect to real authentication functions
- Add proper form validation
- Implement error messaging

#### **2.3 Protected Routes**
**File**: `src/components/auth/ProtectedRoute.tsx`
- Implement real authentication checks
- Add loading states
- Redirect to login when needed

### **Day 3: User Profile System**

#### **3.1 User Creation Flow**
- Auto-create user profile on signup
- Initialize default settings
- Set up onboarding state

#### **3.2 User State Management**
**File**: `src/contexts/UserStateContext.tsx`
- Connect to real user data
- Implement profile updates
- Add settings persistence

### **Day 4-5: Prayer Recording System**

#### **4.1 Prayer Completion Logic**
**File**: `src/components/dashboard/TodaysPrayers.tsx`
- Connect prayer completion buttons to database
- Implement real-time status updates
- Add emotional state tracking

#### **4.2 Prayer History**
- Create prayer records on completion
- Track completion times
- Store emotional states and notes

#### **4.3 Statistics Calculation**
**File**: `src/components/dashboard/StreakOverview.tsx`
- Calculate real streaks from database
- Implement completion rate calculations
- Add weekly/monthly analytics

---

## 🔧 **Technical Implementation Details**

### **Database Functions Needed**

#### **1. Prayer Statistics Function**
```sql
CREATE OR REPLACE FUNCTION calculate_user_stats(user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  best_streak INTEGER,
  total_prayers INTEGER,
  completion_rate DECIMAL
) AS $$
BEGIN
  -- Implementation for calculating user statistics
  RETURN QUERY
  SELECT 
    calculate_current_streak(user_id),
    calculate_best_streak(user_id),
    count_total_prayers(user_id),
    calculate_completion_rate(user_id);
END;
$$ LANGUAGE plpgsql;
```

#### **2. Daily Prayer Creation Function**
```sql
CREATE OR REPLACE FUNCTION create_daily_prayers(user_id UUID, prayer_date DATE)
RETURNS VOID AS $$
BEGIN
  -- Create prayer records for each prayer time
  INSERT INTO prayer_records (user_id, prayer_type, scheduled_time, completed)
  VALUES 
    (user_id, 'fajr', prayer_date + '05:00'::time, false),
    (user_id, 'dhuhr', prayer_date + '12:30'::time, false),
    (user_id, 'asr', prayer_date + '16:00'::time, false),
    (user_id, 'maghrib', prayer_date + '19:00'::time, false),
    (user_id, 'isha', prayer_date + '21:00'::time, false);
END;
$$ LANGUAGE plpgsql;
```

### **Frontend Integration Points**

#### **1. Dashboard Prayer Times**
```typescript
// Update usePrayerTimes hook to include database integration
const usePrayerTimes = () => {
  const { user } = useAuth();
  
  // Get prayer times from calculation
  const prayerTimes = calculatePrayerTimes(location);
  
  // Get prayer completion status from database
  const { data: prayerRecords } = useQuery({
    queryKey: ['prayer-records', user?.id, today],
    queryFn: () => getPrayerRecords(user.id, today),
    enabled: !!user
  });
  
  // Merge calculation with database status
  return mergePrayerData(prayerTimes, prayerRecords);
};
```

#### **2. Prayer Completion Handler**
```typescript
const handlePrayerCompletion = async (prayerId: string) => {
  try {
    await markPrayerCompleted(
      prayerId,
      new Date().toISOString(),
      emotionalState,
      notes
    );
    
    // Update UI immediately
    queryClient.invalidateQueries(['prayer-records']);
    queryClient.invalidateQueries(['user-stats']);
    
    // Show success feedback
    toast.success('Prayer recorded successfully!');
  } catch (error) {
    toast.error('Failed to record prayer');
  }
};
```

### **Row Level Security (RLS) Policies**

#### **1. Users Table**
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### **2. Prayer Records Table**
```sql
-- Users can only access their own prayer records
CREATE POLICY "Users can view own prayers" ON prayer_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers" ON prayer_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers" ON prayer_records
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 📋 **Implementation Checklist**

### **Environment Setup**
- [ ] Configure `.env.local` with Supabase credentials
- [ ] Test database connection
- [ ] Verify RLS policies are active

### **Authentication**
- [ ] Replace mock auth with Supabase Auth
- [ ] Update login/signup pages
- [ ] Implement protected routes
- [ ] Add loading states and error handling

### **User Management**
- [ ] Auto-create user profiles on signup
- [ ] Connect user state to database
- [ ] Implement settings persistence

### **Prayer System**
- [ ] Connect prayer completion to database
- [ ] Implement real-time status updates
- [ ] Add emotional state tracking
- [ ] Create prayer history views

### **Statistics**
- [ ] Calculate real streaks from database
- [ ] Implement completion rate calculations
- [ ] Add weekly/monthly analytics
- [ ] Create statistics dashboard

---

## 🎯 **Success Metrics**

### **Phase 1 Complete When:**
- [ ] Users can register and login with real accounts
- [ ] Dashboard shows user-specific prayer data
- [ ] Prayer completion persists to database
- [ ] Statistics reflect real user data
- [ ] Settings persist across sessions

### **Technical Validation:**
- [ ] No console errors in production
- [ ] All database queries use proper types
- [ ] RLS policies prevent unauthorized access
- [ ] Loading states provide good UX
- [ ] Error handling covers edge cases

---

## 🚨 **Risk Mitigation**

### **Data Migration**
- Start with new users, don't migrate existing mock data
- Use database transactions for multi-step operations
- Implement proper rollback procedures

### **Performance**
- Use React Query for efficient data fetching
- Implement proper database indexing
- Monitor query performance in production

### **User Experience**
- Maintain loading states during data operations
- Provide clear error messages
- Ensure offline capability where possible

---

## 📞 **Next Actions**

1. **Get Supabase Credentials** - Need anon key and service role key
2. **Configure Environment** - Set up `.env.local` file
3. **Test Database Connection** - Verify we can connect and query
4. **Start with Authentication** - Replace mock auth system
5. **Connect Prayer Recording** - Core functionality integration

**Ready to begin implementation immediately once credentials are configured.**
