# Hopium Prayer App - Supabase Database Schema

## Overview

This directory contains the SQL schema files for the Hopium Prayer App's Supabase backend. The schema is organized into multiple files to make it more manageable and easier to understand.

## Files

- **schema_core.sql**: Core database schema including users, prayer records, user stats, settings, and Lopi AI assistant tables.
- **schema_extended.sql**: Extended functionality including achievements, goals, emotional journey tracking, and community features.
- **schema_functions.sql**: PostgreSQL functions for prayer time calculations, analytics, and other backend logic.
- **schema_migrations.sql**: Migration scripts for future schema updates and feature additions.

## Deployment Instructions

### Prerequisites

1. A Supabase account and project
2. Supabase CLI installed (optional, for local development)

### Deployment Steps

1. **Create a new Supabase project** through the Supabase dashboard if you haven't already.

2. **Deploy the schema files** in the following order:
   - First: `schema_core.sql`
   - Second: `schema_extended.sql`
   - Third: `schema_functions.sql`
   - Fourth: `schema_migrations.sql`

3. **Run the migrations** by executing the following SQL command in the Supabase SQL editor:
   ```sql
   SELECT run_all_migrations();
   ```

4. **Set up environment variables** in your frontend application:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Database Structure

### Core Tables

- **users**: User accounts and profiles
- **prayer_records**: Individual prayer tracking records
- **user_stats**: Aggregated prayer statistics and streaks
- **settings**: User preferences and configuration
- **lopi_conversations**: AI assistant conversation history
- **lopi_messages**: Individual messages in AI conversations

### Extended Tables

- **achievements**: Available achievements and badges
- **user_achievements**: Achievements earned by users
- **goals**: User-defined prayer and spiritual goals
- **emotional_journey**: Emotional state tracking
- **reflections**: User journal entries and reflections

### Community Tables

- **friend_connections**: User friendship relationships
- **prayer_groups**: Community prayer groups
- **group_members**: Members of prayer groups

## Security

The database uses Supabase's Row Level Security (RLS) policies to ensure that users can only access their own data. Each table has appropriate RLS policies defined to protect user privacy while enabling necessary functionality.

## Functions and Triggers

The schema includes various PostgreSQL functions and triggers to handle:

- Prayer time calculations based on location
- Streak tracking and updates
- Achievement checking and awarding
- Analytics and insights generation
- Automatic user stats updates

## Future Migrations

The `schema_migrations.sql` file contains functions for future schema updates, including:

- Support for multiple prayer calculation methods
- Qibla direction calculation
- Enhanced community features
- Advanced analytics and visualizations

## Local Development

For local development with Supabase:

1. Install the Supabase CLI
2. Run `supabase start` to start a local Supabase instance
3. Apply the schema files to your local instance
4. Connect your frontend to the local Supabase instance

## Troubleshooting

If you encounter issues during deployment:

1. Check the Supabase logs for any SQL errors
2. Ensure you're running the schema files in the correct order
3. Verify that all required extensions are enabled in your Supabase project
4. Check that your environment variables are correctly set in your frontend application
