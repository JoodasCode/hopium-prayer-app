-- OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- This script optimizes all Row Level Security policies to improve performance
-- by replacing auth.uid() with (SELECT auth.uid()) to prevent re-evaluation per row

-- Migration to optimize RLS policies
CREATE OR REPLACE FUNCTION optimize_rls_policies()
RETURNS VOID AS $$
BEGIN
  -- Drop existing policies and recreate with optimized versions
  
  -- 1. USERS TABLE
  DROP POLICY IF EXISTS "Users can view and update their own data" ON public.users;
  CREATE POLICY "Users can view and update their own data" 
  ON public.users FOR ALL 
  USING ((SELECT auth.uid()) = id);
  
  -- 2. PRAYER_RECORDS TABLE
  DROP POLICY IF EXISTS "Users can manage their own prayer records" ON public.prayer_records;
  CREATE POLICY "Users can manage their own prayer records" 
  ON public.prayer_records FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 3. USER_STATS TABLE
  DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
  CREATE POLICY "Users can view their own stats" 
  ON public.user_stats FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 4. SETTINGS TABLE
  DROP POLICY IF EXISTS "Users can manage their own settings" ON public.settings;
  CREATE POLICY "Users can manage their own settings" 
  ON public.settings FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 5. MULVI_CONVERSATIONS TABLE (formerly lopi_conversations)
  DROP POLICY IF EXISTS "Users can manage their own Lopi conversations" ON public.mulvi_conversations;
  CREATE POLICY "Users can manage their own Lopi conversations" 
  ON public.mulvi_conversations FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 6. MULVI_MESSAGES TABLE (formerly lopi_messages)
  DROP POLICY IF EXISTS "Users can access messages in their conversations" ON public.mulvi_messages;
  CREATE POLICY "Users can access messages in their conversations" 
  ON public.mulvi_messages FOR ALL 
  USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.mulvi_conversations 
      WHERE id = mulvi_messages.conversation_id
    )
  );
  
  -- 7. USER_ACHIEVEMENTS TABLE
  DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
  CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 8. GOALS TABLE
  DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
  CREATE POLICY "Users can manage their own goals" 
  ON public.goals FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 9. NOTIFICATIONS TABLE
  DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
  CREATE POLICY "Users can manage their own notifications" 
  ON public.notifications FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 10. USER_ONBOARDING TABLE
  DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.user_onboarding;
  CREATE POLICY "Users can view their own onboarding data" 
  ON public.user_onboarding FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.user_onboarding;
  CREATE POLICY "Users can update their own onboarding data" 
  ON public.user_onboarding FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.user_onboarding;
  CREATE POLICY "Users can insert their own onboarding data" 
  ON public.user_onboarding FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
  
  -- 11. USER_INTENTIONS TABLE
  DROP POLICY IF EXISTS "Users can view their own intentions" ON public.user_intentions;
  CREATE POLICY "Users can view their own intentions" 
  ON public.user_intentions FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can update their own intentions" ON public.user_intentions;
  CREATE POLICY "Users can update their own intentions" 
  ON public.user_intentions FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can insert their own intentions" ON public.user_intentions;
  CREATE POLICY "Users can insert their own intentions" 
  ON public.user_intentions FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
  
  -- 12. QADA_PRAYERS TABLE
  DROP POLICY IF EXISTS "Users can view their own qada prayers" ON public.qada_prayers;
  CREATE POLICY "Users can view their own qada prayers" 
  ON public.qada_prayers FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can insert their own qada prayers" ON public.qada_prayers;
  CREATE POLICY "Users can insert their own qada prayers" 
  ON public.qada_prayers FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can update their own qada prayers" ON public.qada_prayers;
  CREATE POLICY "Users can update their own qada prayers" 
  ON public.qada_prayers FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 13. PERIOD_EXEMPTIONS TABLE
  DROP POLICY IF EXISTS "Users can view their own period exemptions" ON public.period_exemptions;
  CREATE POLICY "Users can view their own period exemptions" 
  ON public.period_exemptions FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can insert their own period exemptions" ON public.period_exemptions;
  CREATE POLICY "Users can insert their own period exemptions" 
  ON public.period_exemptions FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can update their own period exemptions" ON public.period_exemptions;
  CREATE POLICY "Users can update their own period exemptions" 
  ON public.period_exemptions FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can delete their own period exemptions" ON public.period_exemptions;
  CREATE POLICY "Users can delete their own period exemptions" 
  ON public.period_exemptions FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 14. USER_GAMIFICATION TABLE
  DROP POLICY IF EXISTS "Users can view own gamification profile" ON public.user_gamification;
  CREATE POLICY "Users can view own gamification profile" 
  ON public.user_gamification FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 15. XP_TRANSACTIONS TABLE
  DROP POLICY IF EXISTS "Users can view own XP transactions" ON public.xp_transactions;
  CREATE POLICY "Users can view own XP transactions" 
  ON public.xp_transactions FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 16. USER_BADGES TABLE
  DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
  CREATE POLICY "Users can view own badges" 
  ON public.user_badges FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 17. USER_CHALLENGES TABLE
  DROP POLICY IF EXISTS "Users can view own challenges" ON public.user_challenges;
  CREATE POLICY "Users can view own challenges" 
  ON public.user_challenges FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 18. PRAYER_REMINDERS TABLE
  DROP POLICY IF EXISTS "Users can manage their own prayer reminders" ON public.prayer_reminders;
  CREATE POLICY "Users can manage their own prayer reminders" 
  ON public.prayer_reminders FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 19. SAVED_LOCATIONS TABLE (from migrations)
  DROP POLICY IF EXISTS "Users can manage their own saved locations" ON public.saved_locations;
  CREATE POLICY "Users can manage their own saved locations" 
  ON public.saved_locations FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 20. COMMUNITY_CHALLENGES TABLE (from migrations)
  DROP POLICY IF EXISTS "Creators can manage their challenges" ON public.community_challenges;
  CREATE POLICY "Creators can manage their challenges" 
  ON public.community_challenges FOR ALL 
  USING ((SELECT auth.uid()) = created_by);
  
  -- 21. CHALLENGE_PARTICIPANTS TABLE (from migrations)
  DROP POLICY IF EXISTS "Users can view their own challenge participation" ON public.challenge_participants;
  CREATE POLICY "Users can view their own challenge participation" 
  ON public.challenge_participants FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_participants;
  CREATE POLICY "Users can join challenges" 
  ON public.challenge_participants FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "Users can update their own challenge progress" ON public.challenge_participants;
  CREATE POLICY "Users can update their own challenge progress" 
  ON public.challenge_participants FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 22. PRAYER_HEATMAP TABLE (from migrations)
  DROP POLICY IF EXISTS "Users can view their own prayer heatmap" ON public.prayer_heatmap;
  CREATE POLICY "Users can view their own prayer heatmap" 
  ON public.prayer_heatmap FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 23. EMOTIONAL_JOURNEY TABLE (from extended schema)
  DROP POLICY IF EXISTS "Users can manage their own emotional journey entries" ON public.emotional_journey;
  CREATE POLICY "Users can manage their own emotional journey entries" 
  ON public.emotional_journey FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 24. REFLECTIONS TABLE (from extended schema)
  DROP POLICY IF EXISTS "Users can manage their own reflections" ON public.reflections;
  CREATE POLICY "Users can manage their own reflections" 
  ON public.reflections FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
  
  -- 25. FRIEND_CONNECTIONS TABLE (from extended schema)
  DROP POLICY IF EXISTS "Users can manage their own friend connections" ON public.friend_connections;
  CREATE POLICY "Users can manage their own friend connections" 
  ON public.friend_connections FOR ALL 
  USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_id);
  
  -- 26. PRAYER_GROUPS TABLE (from extended schema)
  DROP POLICY IF EXISTS "Members can view private prayer groups" ON public.prayer_groups;
  CREATE POLICY "Members can view private prayer groups" 
  ON public.prayer_groups FOR SELECT 
  USING (
    is_private AND (SELECT auth.uid()) IN (
      SELECT user_id FROM public.group_members 
      WHERE group_id = prayer_groups.id
    )
  );
  
  DROP POLICY IF EXISTS "Group creators can manage their groups" ON public.prayer_groups;
  CREATE POLICY "Group creators can manage their groups" 
  ON public.prayer_groups FOR ALL 
  USING ((SELECT auth.uid()) = created_by);
  
  -- 27. GROUP_MEMBERS TABLE (from extended schema)
  DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
  CREATE POLICY "Users can view group members" 
  ON public.group_members FOR SELECT 
  USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.group_members 
      WHERE group_id = group_members.group_id
    )
  );
  
  DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
  CREATE POLICY "Group admins can manage members" 
  ON public.group_members FOR ALL 
  USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.group_members 
      WHERE group_id = group_members.group_id AND role = 'admin'
    ) OR 
    (SELECT auth.uid()) IN (
      SELECT created_by FROM public.prayer_groups 
      WHERE id = group_members.group_id
    )
  );
  
  -- 28. APP_ANALYTICS TABLE (from extended schema)
  DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.app_analytics;
  CREATE POLICY "Users can insert their own analytics" 
  ON public.app_analytics FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
  
  -- Log completion
  RAISE NOTICE 'RLS policies optimization completed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the optimization
SELECT optimize_rls_policies();

-- Drop the function after execution
DROP FUNCTION IF EXISTS optimize_rls_policies();

-- Add comment to track this optimization
COMMENT ON SCHEMA public IS 'RLS policies optimized for performance on ' || CURRENT_TIMESTAMP; 