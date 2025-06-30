-- HOPIUM PRAYER APP - DATABASE MIGRATIONS
-- This file contains migration scripts for future schema updates

-- Migration 001: Add support for multiple prayer calculation methods
CREATE OR REPLACE FUNCTION migrate_001_add_calculation_methods()
RETURNS VOID AS $$
BEGIN
  -- Add calculation_method column to settings if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'settings' 
      AND column_name = 'calculation_method'
  ) THEN
    ALTER TABLE public.settings 
    ADD COLUMN calculation_method TEXT DEFAULT 'ISNA';
    
    -- Update existing records
    UPDATE public.settings 
    SET calculation_method = 'ISNA' 
    WHERE calculation_method IS NULL;
  END IF;
  
  -- Create calculation methods reference table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'prayer_calculation_methods'
  ) THEN
    CREATE TABLE public.prayer_calculation_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      parameters JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Insert default calculation methods
    INSERT INTO public.prayer_calculation_methods (id, name, description, parameters)
    VALUES
    ('ISNA', 'Islamic Society of North America', 'Standard method used in North America', '{"fajr_angle": 15, "isha_angle": 15}'),
    ('MWL', 'Muslim World League', 'Used in Europe, Far East, parts of US', '{"fajr_angle": 18, "isha_angle": 17}'),
    ('EGYPT', 'Egyptian General Authority', 'Used in Egypt, Africa, Syria', '{"fajr_angle": 19.5, "isha_angle": 17.5}'),
    ('MAKKAH', 'Umm al-Qura University, Makkah', 'Used in Saudi Arabia', '{"fajr_angle": 18.5, "isha_minutes": 90}'),
    ('KARACHI', 'University of Islamic Sciences, Karachi', 'Used in Pakistan, Bangladesh, India', '{"fajr_angle": 18, "isha_angle": 18}'),
    ('TEHRAN', 'Institute of Geophysics, University of Tehran', 'Used in Iran, some Shia communities', '{"fajr_angle": 17.7, "isha_angle": 14, "maghrib_angle": 4.5}'),
    ('JAFARI', 'Shia Ithna Ashari', 'Used by Shia Muslims', '{"fajr_angle": 16, "isha_angle": 14, "maghrib_angle": 4}');
    
    -- Add RLS policy
    ALTER TABLE public.prayer_calculation_methods ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can view calculation methods" 
    ON public.prayer_calculation_methods FOR SELECT 
    USING (true);
  END IF;
  
  -- Log migration
  RAISE NOTICE 'Migration 001: Added support for multiple prayer calculation methods';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 002: Add support for qibla direction calculation
CREATE OR REPLACE FUNCTION migrate_002_add_qibla_direction()
RETURNS VOID AS $$
BEGIN
  -- Create function to calculate qibla direction
  CREATE OR REPLACE FUNCTION calculate_qibla_direction(
    latitude NUMERIC,
    longitude NUMERIC
  ) RETURNS NUMERIC AS $$
  DECLARE
    makkah_lat CONSTANT NUMERIC := 21.4225; -- Kaaba latitude
    makkah_lon CONSTANT NUMERIC := 39.8262; -- Kaaba longitude
    lat_rad NUMERIC;
    lon_rad NUMERIC;
    makkah_lat_rad NUMERIC;
    makkah_lon_rad NUMERIC;
    y NUMERIC;
    x NUMERIC;
    qibla_rad NUMERIC;
    qibla_deg NUMERIC;
  BEGIN
    -- Convert to radians
    lat_rad := radians(latitude);
    lon_rad := radians(longitude);
    makkah_lat_rad := radians(makkah_lat);
    makkah_lon_rad := radians(makkah_lon);
    
    -- Calculate qibla direction using spherical trigonometry
    y := sin(makkah_lon_rad - lon_rad);
    x := cos(lat_rad) * tan(makkah_lat_rad) - sin(lat_rad) * cos(makkah_lon_rad - lon_rad);
    
    qibla_rad := atan2(y, x);
    qibla_deg := degrees(qibla_rad);
    
    -- Normalize to 0-360 degrees
    RETURN (qibla_deg + 360) % 360;
  END;
  $$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;
  
  -- Add saved locations table for qibla if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'saved_locations'
  ) THEN
    CREATE TABLE public.saved_locations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      latitude NUMERIC NOT NULL,
      longitude NUMERIC NOT NULL,
      address TEXT,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policy
    ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their own saved locations" 
    ON public.saved_locations FOR ALL 
    USING (auth.uid() = user_id);
    
    -- Add index
    CREATE INDEX idx_saved_locations_user ON public.saved_locations(user_id);
  END IF;
  
  -- Log migration
  RAISE NOTICE 'Migration 002: Added support for qibla direction calculation';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 003: Add support for community features
CREATE OR REPLACE FUNCTION migrate_003_add_community_features()
RETURNS VOID AS $$
BEGIN
  -- Add community challenges table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'community_challenges'
  ) THEN
    CREATE TABLE public.community_challenges (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT TRUE,
      requirements JSONB,
      reward_description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policy
    ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can view active challenges" 
    ON public.community_challenges FOR SELECT 
    USING (is_active = TRUE);
    
    CREATE POLICY "Creators can manage their challenges" 
    ON public.community_challenges FOR ALL 
    USING (auth.uid() = created_by);
  END IF;
  
  -- Add challenge participants table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'challenge_participants'
  ) THEN
    CREATE TABLE public.challenge_participants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      challenge_id UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      progress JSONB DEFAULT '{"completed": false, "current_value": 0}'::JSONB,
      completed_at TIMESTAMP WITH TIME ZONE,
      UNIQUE(challenge_id, user_id)
    );
    
    -- Add RLS policy
    ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own challenge participation" 
    ON public.challenge_participants FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can join challenges" 
    ON public.challenge_participants FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own challenge progress" 
    ON public.challenge_participants FOR UPDATE 
    USING (auth.uid() = user_id);
    
    -- Add index
    CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);
    CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
  END IF;
  
  -- Log migration
  RAISE NOTICE 'Migration 003: Added support for community features';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 004: Add support for advanced analytics
CREATE OR REPLACE FUNCTION migrate_004_add_advanced_analytics()
RETURNS VOID AS $$
BEGIN
  -- Add prayer heatmap table for visualizing prayer patterns
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'prayer_heatmap'
  ) THEN
    CREATE TABLE public.prayer_heatmap (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      prayer_date DATE NOT NULL,
      prayer_type TEXT NOT NULL,
      intensity INTEGER NOT NULL CHECK (intensity BETWEEN 0 AND 10),
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, prayer_date, prayer_type)
    );
    
    -- Add RLS policy
    ALTER TABLE public.prayer_heatmap ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own prayer heatmap" 
    ON public.prayer_heatmap FOR SELECT 
    USING (auth.uid() = user_id);
    
    -- Add function to populate heatmap
    CREATE OR REPLACE FUNCTION populate_prayer_heatmap()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Calculate intensity based on prayer attributes
      -- Factors: completed (yes/no), on time (yes/no), focus level, duration
      DECLARE
        intensity_value INTEGER;
      BEGIN
        -- Base value
        IF NEW.completed THEN
          intensity_value := 5;
        ELSE
          intensity_value := 0;
          -- Early return for non-completed prayers
          INSERT INTO public.prayer_heatmap (
            user_id, prayer_date, prayer_type, intensity, metadata
          ) VALUES (
            NEW.user_id,
            DATE(NEW.prayer_time),
            NEW.prayer_type,
            intensity_value,
            jsonb_build_object('completed', false)
          )
          ON CONFLICT (user_id, prayer_date, prayer_type)
          DO UPDATE SET 
            intensity = intensity_value,
            metadata = jsonb_build_object('completed', false);
          
          RETURN NEW;
        END IF;
        
        -- Add for focus level (0-10)
        IF NEW.focus_level IS NOT NULL THEN
          intensity_value := intensity_value + (NEW.focus_level / 2);
        END IF;
        
        -- Adjust for timeliness
        IF NEW.completed_time IS NOT NULL AND NEW.prayer_time IS NOT NULL THEN
          -- If completed within 15 minutes of scheduled time
          IF EXTRACT(EPOCH FROM (NEW.completed_time - NEW.prayer_time)) < 900 THEN
            intensity_value := intensity_value + 2;
          -- If late by more than an hour
          ELSIF EXTRACT(EPOCH FROM (NEW.completed_time - NEW.prayer_time)) > 3600 THEN
            intensity_value := intensity_value - 1;
          END IF;
        END IF;
        
        -- Cap at 0-10 range
        intensity_value := GREATEST(0, LEAST(10, intensity_value));
        
        -- Insert or update heatmap
        INSERT INTO public.prayer_heatmap (
          user_id, prayer_date, prayer_type, intensity, metadata
        ) VALUES (
          NEW.user_id,
          DATE(NEW.prayer_time),
          NEW.prayer_type,
          intensity_value,
          jsonb_build_object(
            'completed', true,
            'focus_level', NEW.focus_level,
            'duration_minutes', NEW.duration_minutes,
            'emotional_state_before', NEW.emotional_state_before,
            'emotional_state_after', NEW.emotional_state_after
          )
        )
        ON CONFLICT (user_id, prayer_date, prayer_type)
        DO UPDATE SET 
          intensity = intensity_value,
          metadata = jsonb_build_object(
            'completed', true,
            'focus_level', NEW.focus_level,
            'duration_minutes', NEW.duration_minutes,
            'emotional_state_before', NEW.emotional_state_before,
            'emotional_state_after', NEW.emotional_state_after
          );
        
        RETURN NEW;
      END;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create trigger on prayer_records
    CREATE TRIGGER prayer_records_heatmap_trigger
    AFTER INSERT OR UPDATE ON public.prayer_records
    FOR EACH ROW EXECUTE FUNCTION populate_prayer_heatmap();
  END IF;
  
  -- Log migration
  RAISE NOTICE 'Migration 004: Added support for advanced analytics';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run all migrations
CREATE OR REPLACE FUNCTION run_all_migrations()
RETURNS VOID AS $$
BEGIN
  -- Create migrations table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.migrations (
    id SERIAL PRIMARY KEY,
    migration_name TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Run migrations if they haven't been applied yet
  IF NOT EXISTS (SELECT 1 FROM public.migrations WHERE migration_name = 'migrate_001_add_calculation_methods') THEN
    PERFORM migrate_001_add_calculation_methods();
    INSERT INTO public.migrations (migration_name) VALUES ('migrate_001_add_calculation_methods');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.migrations WHERE migration_name = 'migrate_002_add_qibla_direction') THEN
    PERFORM migrate_002_add_qibla_direction();
    INSERT INTO public.migrations (migration_name) VALUES ('migrate_002_add_qibla_direction');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.migrations WHERE migration_name = 'migrate_003_add_community_features') THEN
    PERFORM migrate_003_add_community_features();
    INSERT INTO public.migrations (migration_name) VALUES ('migrate_003_add_community_features');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.migrations WHERE migration_name = 'migrate_004_add_advanced_analytics') THEN
    PERFORM migrate_004_add_advanced_analytics();
    INSERT INTO public.migrations (migration_name) VALUES ('migrate_004_add_advanced_analytics');
  END IF;
  
  RAISE NOTICE 'All migrations completed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
