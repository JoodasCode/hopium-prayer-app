-- HOPIUM PRAYER APP - EXTENDED DATABASE SCHEMA
-- This file contains additional tables and functionality beyond the core schema

-- PERIOD EXEMPTION TRACKING

-- Period exemption records table
CREATE TABLE public.period_exemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  exemption_type TEXT NOT NULL CHECK (exemption_type IN ('menstruation', 'postpartum', 'illness', 'travel')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menstruation tracking table
CREATE TABLE public.menstruation_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  cycle_start_date DATE NOT NULL,
  cycle_length INTEGER, -- in days
  period_length INTEGER, -- in days
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table (expanded to support individual fields)
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Prayer settings
  calculation_method TEXT DEFAULT 'hanafi',
  period_exemption BOOLEAN DEFAULT FALSE,
  menstruation_tracking BOOLEAN DEFAULT FALSE,
  travel_exemption BOOLEAN DEFAULT FALSE,
  illness_exemption BOOLEAN DEFAULT FALSE,
  
  -- Notification settings
  notifications BOOLEAN DEFAULT TRUE,
  prayer_reminders BOOLEAN DEFAULT TRUE,
  reminder_time INTEGER DEFAULT 15, -- minutes before prayer
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  
  -- Habit settings
  streak_protection BOOLEAN DEFAULT TRUE,
  qada_tracking BOOLEAN DEFAULT TRUE,
  daily_goals BOOLEAN DEFAULT TRUE,
  community_presence BOOLEAN DEFAULT TRUE,
  
  -- Privacy settings
  data_collection BOOLEAN DEFAULT TRUE,
  share_insights BOOLEAN DEFAULT FALSE,
  
  -- Appearance settings
  text_size NUMERIC DEFAULT 1.0,
  reduce_animations BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACHIEVEMENTS AND GOALS

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT,
  difficulty TEXT,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 100,
  UNIQUE(user_id, achievement_id)
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  goal_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMOTIONAL AND SPIRITUAL JOURNEY

-- Emotional states tracking
CREATE TABLE public.emotional_journey (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  emotional_state TEXT NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  notes TEXT,
  related_prayer_id UUID REFERENCES public.prayer_records(id) ON DELETE SET NULL
);

-- Reflections and journal entries
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT TRUE
);

-- Lopi frequently asked questions
CREATE TABLE public.lopi_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  embedding vector(1536)
);

-- COMMUNITY FEATURES (for future implementation)

-- Friend connections
CREATE TABLE public.friend_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Prayer groups
CREATE TABLE public.prayer_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.prayer_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ANALYTICS AND SYSTEM

-- App usage analytics
CREATE TABLE public.app_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT
);

-- System notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action_url TEXT,
  action_data JSONB
);

-- ADDITIONAL INDEXES

CREATE INDEX idx_lopi_faqs_embedding ON public.lopi_faqs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_emotional_journey_user ON public.emotional_journey(user_id);
CREATE INDEX idx_reflections_user ON public.reflections(user_id);
CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- ADDITIONAL RLS POLICIES

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lopi_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Anyone can view achievements" 
ON public.achievements FOR SELECT 
USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can manage their own goals" 
ON public.goals FOR ALL 
USING (auth.uid() = user_id);

-- Emotional journey policies
CREATE POLICY "Users can manage their own emotional journey entries" 
ON public.emotional_journey FOR ALL 
USING (auth.uid() = user_id);

-- Reflections policies
CREATE POLICY "Users can manage their own reflections" 
ON public.reflections FOR ALL 
USING (auth.uid() = user_id);

-- Lopi FAQs policies
CREATE POLICY "Anyone can view Lopi FAQs" 
ON public.lopi_faqs FOR SELECT 
USING (true);

-- Friend connections policies
CREATE POLICY "Users can manage their own friend connections" 
ON public.friend_connections FOR ALL 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Prayer groups policies
CREATE POLICY "Anyone can view public prayer groups" 
ON public.prayer_groups FOR SELECT 
USING (NOT is_private);

CREATE POLICY "Members can view private prayer groups" 
ON public.prayer_groups FOR SELECT 
USING (
  is_private AND auth.uid() IN (
    SELECT user_id FROM public.group_members 
    WHERE group_id = prayer_groups.id
  )
);

CREATE POLICY "Group creators can manage their groups" 
ON public.prayer_groups FOR ALL 
USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members" 
ON public.group_members FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.group_members 
    WHERE group_id = group_members.group_id
  )
);

CREATE POLICY "Group admins can manage members" 
ON public.group_members FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.group_members 
    WHERE group_id = group_members.group_id AND role = 'admin'
  ) OR 
  auth.uid() IN (
    SELECT created_by FROM public.prayer_groups 
    WHERE id = group_members.group_id
  )
);

-- App analytics policies
CREATE POLICY "Users can insert their own analytics" 
ON public.app_analytics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

-- ADDITIONAL FUNCTIONS

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  last_prayer_date DATE := NULL;
  prayer_date DATE;
  prayers_today INTEGER;
  prayers_yesterday INTEGER;
BEGIN
  -- Check if user has prayers today
  SELECT COUNT(*) INTO prayers_today
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND completed = TRUE
    AND DATE(completed_time) = CURRENT_DATE;
  
  -- Check if user has prayers yesterday
  SELECT COUNT(*) INTO prayers_yesterday
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND completed = TRUE
    AND DATE(completed_time) = CURRENT_DATE - INTERVAL '1 day';
  
  -- If no prayers today or yesterday, find the last prayer date
  IF prayers_today = 0 AND prayers_yesterday = 0 THEN
    SELECT MAX(DATE(completed_time)) INTO last_prayer_date
    FROM public.prayer_records
    WHERE user_id = user_uuid
      AND completed = TRUE;
      
    -- If no prayers at all, return 0
    IF last_prayer_date IS NULL THEN
      RETURN 0;
    END IF;
    
    -- If last prayer was more than 1 day ago, streak is broken
    IF CURRENT_DATE - last_prayer_date > 1 THEN
      RETURN 0;
    END IF;
  END IF;
  
  -- Calculate streak by counting consecutive days with prayers
  FOR prayer_date IN 
    SELECT DISTINCT DATE(completed_time) AS prayer_date
    FROM public.prayer_records
    WHERE user_id = user_uuid
      AND completed = TRUE
    ORDER BY prayer_date DESC
  LOOP
    IF last_prayer_date IS NULL THEN
      last_prayer_date := prayer_date;
      current_streak := 1;
    ELSIF last_prayer_date - prayer_date = 1 THEN
      last_prayer_date := prayer_date;
      current_streak := current_streak + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streaks daily
CREATE OR REPLACE FUNCTION update_streaks()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  new_streak INTEGER;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    -- Calculate current streak
    new_streak := calculate_streak(user_record.id);
    
    -- Update user_stats
    UPDATE public.user_stats
    SET 
      current_streak = new_streak,
      best_streak = GREATEST(best_streak, new_streak),
      last_calculated_at = NOW()
    WHERE user_id = user_record.id;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
      INSERT INTO public.user_stats (user_id, current_streak, best_streak)
      VALUES (user_record.id, new_streak, new_streak);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for achievements
CREATE OR REPLACE FUNCTION check_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  achievement_record RECORD;
  user_stat RECORD;
  meets_requirements BOOLEAN;
BEGIN
  -- Get user stats
  SELECT * INTO user_stat FROM public.user_stats WHERE user_id = user_uuid;
  
  -- If no stats found, exit
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check each achievement
  FOR achievement_record IN SELECT * FROM public.achievements LOOP
    meets_requirements := FALSE;
    
    -- Check if user already has this achievement
    IF EXISTS (SELECT 1 FROM public.user_achievements 
               WHERE user_id = user_uuid AND achievement_id = achievement_record.id) THEN
      CONTINUE;
    END IF;
    
    -- Check requirements based on achievement type
    CASE 
      -- Streak achievements
      WHEN achievement_record.requirements->>'type' = 'streak' THEN
        IF user_stat.current_streak >= (achievement_record.requirements->>'value')::INTEGER THEN
          meets_requirements := TRUE;
        END IF;
      
      -- Total prayers achievements
      WHEN achievement_record.requirements->>'type' = 'total_prayers' THEN
        IF user_stat.total_prayers_completed >= (achievement_record.requirements->>'value')::INTEGER THEN
          meets_requirements := TRUE;
        END IF;
      
      -- Completion rate achievements
      WHEN achievement_record.requirements->>'type' = 'completion_rate' THEN
        IF user_stat.completion_rate >= (achievement_record.requirements->>'value')::NUMERIC THEN
          meets_requirements := TRUE;
        END IF;
      
      -- Add more achievement types as needed
    END CASE;
    
    -- Award achievement if requirements are met
    IF meets_requirements THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (user_uuid, achievement_record.id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
