-- HOPIUM PRAYER APP - CORE DATABASE SCHEMA

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- USERS AND AUTHENTICATION

-- Users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  prayer_method TEXT DEFAULT 'ISNA',
  theme_preference TEXT DEFAULT 'system',
  notification_settings JSONB DEFAULT '{"prayer_reminders": true, "community_updates": false}',
  location JSONB DEFAULT '{"latitude": null, "longitude": null, "city": null, "country": null}',
  last_active TIMESTAMP WITH TIME ZONE
);

-- PRAYER DATA

-- Prayer records table
CREATE TABLE public.prayer_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prayer_type TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  emotional_state_before TEXT,
  emotional_state_after TEXT,
  mindfulness_score INTEGER,
  location JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table (for caching aggregated data)
CREATE TABLE public.user_stats (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_prayers_completed INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_rate NUMERIC(5,2) DEFAULT 0,
  mindfulness_index NUMERIC(5,2) DEFAULT 0,
  prayer_distribution JSONB DEFAULT '{"fajr": 0, "dhuhr": 0, "asr": 0, "maghrib": 0, "isha": 0}',
  weekly_stats JSONB,
  monthly_stats JSONB
);

-- USER PREFERENCES AND SETTINGS

-- Settings table
CREATE TABLE public.settings (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  appearance JSONB DEFAULT '{"theme": "system", "fontSize": "medium"}',
  notifications JSONB DEFAULT '{"enabled": true, "types": ["prayer_times", "streaks"]}',
  privacy JSONB DEFAULT '{"shareActivity": false, "dataCollection": true}',
  qibla_preferences JSONB DEFAULT '{"defaultMode": "standard"}',
  calendar_preferences JSONB DEFAULT '{"defaultView": "month"}',
  insights_preferences JSONB DEFAULT '{"defaultTab": "overview"}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOPI AI ASSISTANT

-- Lopi AI conversations table
CREATE TABLE public.lopi_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  context JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  category TEXT
);

-- Lopi AI messages table
CREATE TABLE public.lopi_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.lopi_conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  tokens_used INTEGER,
  model_used TEXT
);

-- Lopi knowledge base
CREATE TABLE public.lopi_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  embedding vector(1536)
);

-- INDEXES FOR PERFORMANCE

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_onboarding ON public.users(onboarding_completed);

-- Prayer records indexes
CREATE INDEX idx_prayer_records_user ON public.prayer_records(user_id);
CREATE INDEX idx_prayer_records_completed ON public.prayer_records(user_id, completed);
CREATE INDEX idx_prayer_records_date ON public.prayer_records(user_id, scheduled_time);
CREATE INDEX idx_prayer_records_type ON public.prayer_records(user_id, prayer_type);

-- Lopi indexes
CREATE INDEX idx_lopi_conversations_user ON public.lopi_conversations(user_id);
CREATE INDEX idx_lopi_messages_conversation ON public.lopi_messages(conversation_id);
CREATE INDEX idx_lopi_knowledge_topic ON public.lopi_knowledge(topic);
CREATE INDEX idx_lopi_knowledge_embedding ON public.lopi_knowledge USING ivfflat (embedding vector_cosine_ops);

-- ROW LEVEL SECURITY POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lopi_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lopi_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lopi_knowledge ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view and update their own data" 
ON public.users FOR ALL 
USING (auth.uid() = id);

-- Prayer records policies
CREATE POLICY "Users can manage their own prayer records" 
ON public.prayer_records FOR ALL 
USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR ALL 
USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can manage their own settings" 
ON public.settings FOR ALL 
USING (auth.uid() = user_id);

-- Lopi conversations policies
CREATE POLICY "Users can manage their own Lopi conversations" 
ON public.lopi_conversations FOR ALL 
USING (auth.uid() = user_id);

-- Lopi messages policies
CREATE POLICY "Users can access messages in their conversations" 
ON public.lopi_messages FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.lopi_conversations 
    WHERE id = lopi_messages.conversation_id
  )
);

-- Lopi knowledge policies
CREATE POLICY "Anyone can view Lopi knowledge" 
ON public.lopi_knowledge FOR SELECT 
USING (true);

-- FUNCTIONS AND TRIGGERS

-- Function to update user_stats when prayer_records are modified
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats when a prayer is completed or uncompleted
  IF (TG_OP = 'INSERT' AND NEW.completed = TRUE) OR 
     (TG_OP = 'UPDATE' AND OLD.completed = FALSE AND NEW.completed = TRUE) THEN
    
    -- Update total prayers completed
    UPDATE public.user_stats
    SET total_prayers_completed = total_prayers_completed + 1,
        last_calculated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update prayer distribution
    UPDATE public.user_stats
    SET prayer_distribution = jsonb_set(
      prayer_distribution,
      array[LOWER(NEW.prayer_type)],
      to_jsonb((prayer_distribution->>LOWER(NEW.prayer_type))::int + 1)
    )
    WHERE user_id = NEW.user_id;
    
  ELSIF (TG_OP = 'UPDATE' AND OLD.completed = TRUE AND NEW.completed = FALSE) THEN
    
    -- Update total prayers completed
    UPDATE public.user_stats
    SET total_prayers_completed = GREATEST(0, total_prayers_completed - 1),
        last_calculated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update prayer distribution
    UPDATE public.user_stats
    SET prayer_distribution = jsonb_set(
      prayer_distribution,
      array[LOWER(NEW.prayer_type)],
      to_jsonb(GREATEST(0, (prayer_distribution->>LOWER(NEW.prayer_type))::int - 1))
    )
    WHERE user_id = NEW.user_id;
    
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for prayer_records
CREATE TRIGGER prayer_records_trigger
AFTER INSERT OR UPDATE ON public.prayer_records
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();
