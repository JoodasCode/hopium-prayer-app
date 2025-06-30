-- HOPIUM PRAYER APP - DATABASE FUNCTIONS
-- This file contains additional PostgreSQL functions for the Hopium Prayer App

-- PRAYER TIME CALCULATION FUNCTIONS

-- Function to calculate prayer times based on location and method
CREATE OR REPLACE FUNCTION calculate_prayer_times(
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT,
  calculation_method TEXT DEFAULT 'ISNA',
  date_param DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- This is a placeholder function that would normally contain complex
  -- astronomical calculations for prayer times
  -- In a real implementation, this would use the appropriate formulas based on
  -- sun position, location, and calculation method
  
  -- For now, return a sample structure with placeholder times
  result := jsonb_build_object(
    'date', date_param,
    'latitude', latitude,
    'longitude', longitude,
    'timezone', timezone,
    'method', calculation_method,
    'prayers', jsonb_build_object(
      'fajr', '05:30',
      'sunrise', '06:45',
      'dhuhr', '12:15',
      'asr', '15:30',
      'maghrib', '18:15',
      'isha', '19:45'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ANALYTICS FUNCTIONS

-- Function to get prayer statistics for a specific time period
CREATE OR REPLACE FUNCTION get_prayer_stats(
  user_uuid UUID,
  start_date DATE,
  end_date DATE
) RETURNS JSONB AS $$
DECLARE
  total_prayers INTEGER;
  completed_prayers INTEGER;
  missed_prayers INTEGER;
  late_prayers INTEGER;
  on_time_prayers INTEGER;
  completion_rate NUMERIC;
  avg_delay_minutes NUMERIC;
  most_missed_prayer TEXT;
  best_prayer TEXT;
  result JSONB;
BEGIN
  -- Count total prayers in period
  SELECT COUNT(*) INTO total_prayers
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND DATE(prayer_time) BETWEEN start_date AND end_date;
  
  -- Count completed prayers
  SELECT COUNT(*) INTO completed_prayers
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND completed = TRUE
    AND DATE(prayer_time) BETWEEN start_date AND end_date;
  
  -- Count missed prayers
  SELECT COUNT(*) INTO missed_prayers
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND completed = FALSE
    AND DATE(prayer_time) BETWEEN start_date AND end_date;
  
  -- Count late prayers (completed more than 15 minutes after scheduled time)
  SELECT COUNT(*) INTO late_prayers
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND completed = TRUE
    AND EXTRACT(EPOCH FROM (completed_time - prayer_time)) > 900 -- 15 minutes in seconds
    AND DATE(prayer_time) BETWEEN start_date AND end_date;
  
  -- Count on-time prayers
  on_time_prayers := completed_prayers - late_prayers;
  
  -- Calculate completion rate
  IF total_prayers > 0 THEN
    completion_rate := (completed_prayers::NUMERIC / total_prayers) * 100;
  ELSE
    completion_rate := 0;
  END IF;
  
  -- Calculate average delay in minutes for completed prayers
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (completed_time - prayer_time)) / 60), 0) INTO avg_delay_minutes
  FROM public.prayer_records
  WHERE user_id = user_uuid
    AND completed = TRUE
    AND DATE(prayer_time) BETWEEN start_date AND end_date;
  
  -- Find most missed prayer
  SELECT prayer_name INTO most_missed_prayer
  FROM (
    SELECT prayer_name, COUNT(*) as missed_count
    FROM public.prayer_records
    WHERE user_id = user_uuid
      AND completed = FALSE
      AND DATE(prayer_time) BETWEEN start_date AND end_date
    GROUP BY prayer_name
    ORDER BY missed_count DESC
    LIMIT 1
  ) subquery;
  
  -- Find best prayer (highest completion rate)
  SELECT prayer_name INTO best_prayer
  FROM (
    SELECT 
      prayer_name, 
      COUNT(*) FILTER (WHERE completed = TRUE) * 100.0 / COUNT(*) as completion_pct
    FROM public.prayer_records
    WHERE user_id = user_uuid
      AND DATE(prayer_time) BETWEEN start_date AND end_date
    GROUP BY prayer_name
    ORDER BY completion_pct DESC
    LIMIT 1
  ) subquery;
  
  -- Build result JSON
  result := jsonb_build_object(
    'total_prayers', total_prayers,
    'completed_prayers', completed_prayers,
    'missed_prayers', missed_prayers,
    'late_prayers', late_prayers,
    'on_time_prayers', on_time_prayers,
    'completion_rate', ROUND(completion_rate, 2),
    'avg_delay_minutes', ROUND(avg_delay_minutes, 2),
    'most_missed_prayer', most_missed_prayer,
    'best_prayer', best_prayer,
    'period', jsonb_build_object(
      'start_date', start_date,
      'end_date', end_date,
      'days', end_date - start_date + 1
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate insights based on prayer patterns
CREATE OR REPLACE FUNCTION generate_prayer_insights(
  user_uuid UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  weekly_stats JSONB;
  monthly_stats JSONB;
  yearly_stats JSONB;
  streak INTEGER;
  trend TEXT;
  best_day_of_week TEXT;
  worst_day_of_week TEXT;
  emotional_impact JSONB;
BEGIN
  -- Get stats for different time periods
  SELECT get_prayer_stats(user_uuid, CURRENT_DATE - 7, CURRENT_DATE) INTO weekly_stats;
  SELECT get_prayer_stats(user_uuid, CURRENT_DATE - 30, CURRENT_DATE) INTO monthly_stats;
  SELECT get_prayer_stats(user_uuid, CURRENT_DATE - 365, CURRENT_DATE) INTO yearly_stats;
  
  -- Get current streak
  SELECT current_streak INTO streak FROM public.user_stats WHERE user_id = user_uuid;
  
  -- Determine trend (improving, steady, declining)
  IF (weekly_stats->>'completion_rate')::NUMERIC > (monthly_stats->>'completion_rate')::NUMERIC THEN
    trend := 'improving';
  ELSIF (weekly_stats->>'completion_rate')::NUMERIC < (monthly_stats->>'completion_rate')::NUMERIC - 5 THEN
    trend := 'declining';
  ELSE
    trend := 'steady';
  END IF;
  
  -- Find best and worst days of the week
  SELECT TO_CHAR(DATE(prayer_time), 'Day') INTO best_day_of_week
  FROM (
    SELECT 
      DATE(prayer_time),
      COUNT(*) FILTER (WHERE completed = TRUE) * 100.0 / COUNT(*) as completion_pct
    FROM public.prayer_records
    WHERE user_id = user_uuid
      AND DATE(prayer_time) >= CURRENT_DATE - 90
    GROUP BY DATE(prayer_time)
    ORDER BY completion_pct DESC
    LIMIT 1
  ) subquery;
  
  SELECT TO_CHAR(DATE(prayer_time), 'Day') INTO worst_day_of_week
  FROM (
    SELECT 
      DATE(prayer_time),
      COUNT(*) FILTER (WHERE completed = TRUE) * 100.0 / COUNT(*) as completion_pct
    FROM public.prayer_records
    WHERE user_id = user_uuid
      AND DATE(prayer_time) >= CURRENT_DATE - 90
    GROUP BY DATE(prayer_time)
    ORDER BY completion_pct ASC
    LIMIT 1
  ) subquery;
  
  -- Analyze emotional impact
  SELECT jsonb_build_object(
    'most_common_before', most_common_before,
    'most_common_after', most_common_after,
    'positive_change_rate', positive_change_rate
  ) INTO emotional_impact
  FROM (
    SELECT
      (SELECT emotional_state 
       FROM public.emotional_journey 
       WHERE user_id = user_uuid AND related_prayer_id IS NOT NULL
       GROUP BY emotional_state 
       ORDER BY COUNT(*) DESC LIMIT 1) as most_common_before,
      (SELECT emotional_state 
       FROM public.emotional_journey 
       WHERE user_id = user_uuid AND related_prayer_id IS NOT NULL
       GROUP BY emotional_state 
       ORDER BY COUNT(*) DESC LIMIT 1) as most_common_after,
      (SELECT 
         COUNT(*) FILTER (WHERE intensity_after > intensity_before) * 100.0 / COUNT(*)
       FROM (
         SELECT 
           pr.id,
           (SELECT intensity FROM public.emotional_journey 
            WHERE related_prayer_id = pr.id 
            ORDER BY recorded_at ASC LIMIT 1) as intensity_before,
           (SELECT intensity FROM public.emotional_journey 
            WHERE related_prayer_id = pr.id 
            ORDER BY recorded_at DESC LIMIT 1) as intensity_after
         FROM public.prayer_records pr
         WHERE pr.user_id = user_uuid AND pr.completed = TRUE
       ) subquery
      ) as positive_change_rate
  ) subquery;
  
  -- Build final insights
  result := jsonb_build_object(
    'streak', streak,
    'trend', trend,
    'completion_rate', jsonb_build_object(
      'weekly', weekly_stats->>'completion_rate',
      'monthly', monthly_stats->>'completion_rate',
      'yearly', yearly_stats->>'completion_rate'
    ),
    'prayer_patterns', jsonb_build_object(
      'best_day', best_day_of_week,
      'worst_day', worst_day_of_week,
      'most_missed', weekly_stats->>'most_missed_prayer',
      'best_prayer', weekly_stats->>'best_prayer'
    ),
    'emotional_impact', emotional_impact,
    'recommendations', jsonb_build_array(
      CASE
        WHEN trend = 'declining' THEN 'Consider setting prayer reminders to improve consistency'
        WHEN trend = 'improving' THEN 'Great progress! Keep up the momentum'
        ELSE 'Maintain your steady prayer schedule'
      END,
      CASE
        WHEN weekly_stats->>'most_missed_prayer' IS NOT NULL THEN 
          'Focus on improving your ' || weekly_stats->>'most_missed_prayer' || ' prayer consistency'
        ELSE 'All prayers are being performed consistently'
      END,
      CASE
        WHEN worst_day_of_week IS NOT NULL THEN 
          'Create a special routine for ' || worst_day_of_week || ' to improve prayer consistency'
        ELSE 'Your prayer consistency is balanced throughout the week'
      END
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LOPI AI ASSISTANT FUNCTIONS

-- Function to search for relevant FAQs based on vector similarity
CREATE OR REPLACE FUNCTION search_lopi_faqs(
  query_text TEXT,
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
) RETURNS TABLE(
  id UUID,
  question TEXT,
  answer TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.question,
    f.answer,
    1 - (f.embedding <=> query_embedding) AS similarity
  FROM public.lopi_faqs f
  WHERE 1 - (f.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation context for Lopi AI
CREATE OR REPLACE FUNCTION get_conversation_context(
  conversation_id UUID,
  message_limit INT DEFAULT 10
) RETURNS JSONB AS $$
DECLARE
  conv_data RECORD;
  messages JSONB;
  user_data JSONB;
  prayer_stats JSONB;
  result JSONB;
BEGIN
  -- Get conversation data
  SELECT * INTO conv_data 
  FROM public.lopi_conversations 
  WHERE id = conversation_id;
  
  -- If conversation not found, return empty
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Conversation not found');
  END IF;
  
  -- Get recent messages
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'role', role,
      'content', content,
      'created_at', created_at
    ) ORDER BY created_at DESC
  ) INTO messages
  FROM public.lopi_messages
  WHERE conversation_id = conv_data.id
  ORDER BY created_at DESC
  LIMIT message_limit;
  
  -- Get user data
  SELECT jsonb_build_object(
    'id', u.id,
    'username', u.username,
    'name', u.name,
    'created_at', u.created_at
  ) INTO user_data
  FROM public.users u
  WHERE u.id = conv_data.user_id;
  
  -- Get prayer stats
  SELECT get_prayer_stats(conv_data.user_id, CURRENT_DATE - 30, CURRENT_DATE) INTO prayer_stats;
  
  -- Build result
  result := jsonb_build_object(
    'conversation', jsonb_build_object(
      'id', conv_data.id,
      'title', conv_data.title,
      'created_at', conv_data.created_at,
      'updated_at', conv_data.updated_at
    ),
    'messages', messages,
    'user', user_data,
    'prayer_stats', prayer_stats
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTIFICATION AND REMINDER FUNCTIONS

-- Function to create prayer reminders for a user
CREATE OR REPLACE FUNCTION create_prayer_reminders(
  user_uuid UUID,
  reminder_minutes INTEGER DEFAULT 15,
  for_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  prayer_times JSONB;
  prayer_name TEXT;
  prayer_time TEXT;
  reminder_time TIMESTAMP;
  prayers_created INTEGER := 0;
  user_settings RECORD;
BEGIN
  -- Get user settings
  SELECT * INTO user_settings FROM public.user_settings WHERE user_id = user_uuid;
  
  -- If no settings or notifications disabled, return
  IF NOT FOUND OR NOT user_settings.prayer_reminders_enabled THEN
    RETURN jsonb_build_object('status', 'skipped', 'reason', 'Reminders disabled');
  END IF;
  
  -- Get prayer times for the user's location
  SELECT calculate_prayer_times(
    user_settings.latitude,
    user_settings.longitude,
    user_settings.timezone,
    user_settings.calculation_method,
    for_date
  ) INTO prayer_times;
  
  -- Create a notification for each prayer
  FOR prayer_name, prayer_time IN 
    SELECT key, value FROM jsonb_each_text(prayer_times->'prayers')
  LOOP
    -- Skip sunrise as it's not a prayer time
    IF prayer_name = 'sunrise' THEN
      CONTINUE;
    END IF;
    
    -- Calculate reminder time
    reminder_time := (for_date || ' ' || prayer_time)::TIMESTAMP - (reminder_minutes * INTERVAL '1 minute');
    
    -- Only create reminders for future times
    IF reminder_time > NOW() THEN
      -- Insert notification
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        action_data
      ) VALUES (
        user_uuid,
        prayer_name || ' Prayer Reminder',
        'Your ' || prayer_name || ' prayer time is approaching in ' || reminder_minutes || ' minutes',
        'prayer_reminder',
        jsonb_build_object(
          'prayer_name', prayer_name,
          'prayer_time', prayer_time,
          'for_date', for_date
        )
      );
      
      prayers_created := prayers_created + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'reminders_created', prayers_created,
    'for_date', for_date,
    'reminder_minutes', reminder_minutes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGERS

-- Trigger function to update user stats after prayer record changes
CREATE OR REPLACE FUNCTION update_user_stats_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Determine which user to update
  IF TG_OP = 'DELETE' THEN
    user_uuid := OLD.user_id;
  ELSE
    user_uuid := NEW.user_id;
  END IF;
  
  -- Update user stats
  WITH prayer_counts AS (
    SELECT
      COUNT(*) AS total_prayers,
      COUNT(*) FILTER (WHERE completed = TRUE) AS completed_prayers,
      COUNT(*) FILTER (WHERE completed = FALSE) AS missed_prayers,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          ROUND((COUNT(*) FILTER (WHERE completed = TRUE))::NUMERIC / COUNT(*) * 100, 2)
        ELSE 0
      END AS completion_rate
    FROM public.prayer_records
    WHERE user_id = user_uuid
  )
  UPDATE public.user_stats
  SET
    total_prayers = pc.total_prayers,
    total_prayers_completed = pc.completed_prayers,
    total_prayers_missed = pc.missed_prayers,
    completion_rate = pc.completion_rate,
    updated_at = NOW()
  FROM prayer_counts pc
  WHERE user_id = user_uuid;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    WITH prayer_counts AS (
      SELECT
        COUNT(*) AS total_prayers,
        COUNT(*) FILTER (WHERE completed = TRUE) AS completed_prayers,
        COUNT(*) FILTER (WHERE completed = FALSE) AS missed_prayers,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(*) FILTER (WHERE completed = TRUE))::NUMERIC / COUNT(*) * 100, 2)
          ELSE 0
        END AS completion_rate
      FROM public.prayer_records
      WHERE user_id = user_uuid
    )
    INSERT INTO public.user_stats (
      user_id,
      total_prayers,
      total_prayers_completed,
      total_prayers_missed,
      completion_rate
    )
    SELECT
      user_uuid,
      pc.total_prayers,
      pc.completed_prayers,
      pc.missed_prayers,
      pc.completion_rate
    FROM prayer_counts pc;
  END IF;
  
  -- Check for achievements
  PERFORM check_achievements(user_uuid);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on prayer_records table
CREATE TRIGGER prayer_records_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.prayer_records
FOR EACH ROW EXECUTE FUNCTION update_user_stats_trigger();
