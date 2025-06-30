# Supabase Setup Guide for Hopium Prayer App

## Introduction

This guide provides step-by-step instructions for setting up the Supabase backend for the Hopium Prayer App. Supabase will serve as our backend platform, providing authentication, database storage, and real-time functionality.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com) if you don't have one)
- Node.js and npm installed on your development machine
- Git repository for the Hopium Prayer App cloned locally

## Step 1: Create a Supabase Project

1. Log in to your Supabase account at [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name**: Hopium Prayer App
   - **Database Password**: Create a secure password
   - **Region**: Choose the region closest to your target users
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Project Credentials

1. Once your project is created, go to the project dashboard
2. Click on the "Settings" icon (gear) in the left sidebar
3. Select "API" from the settings menu
4. Note down the following credentials:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon/public** key (for client-side access)
   - **service_role** key (for server-side access, keep this secure)

## Step 3: Set Up Environment Variables

1. In your Hopium Prayer App project directory, create or update the `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

2. Add these environment variables to your deployment platform (Vercel, Netlify, etc.) if you're deploying the app

## Step 4: Deploy Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Deploy the schema files in the following order:

### Step 4.1: Enable Required Extensions

1. Go to the Database page in the Supabase dashboard
2. Click on "Extensions" in the sidebar
3. Search for and enable the following extensions:
   - `uuid-ossp` - For UUID generation
   - `vector` - For pgvector functionality (AI embeddings)

Alternatively, you can enable these extensions via SQL:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

### Step 4.2: Deploy Core Schema

1. Open the SQL Editor
2. Copy the contents of `supabase/schema_core.sql`
3. Paste into the SQL Editor and click "Run"
4. Verify that the tables were created successfully

### Step 4.2: Deploy Extended Schema

1. Open a new SQL Editor tab
2. Copy the contents of `supabase/schema_extended.sql`
3. Paste into the SQL Editor and click "Run"
4. Verify that the tables were created successfully

### Step 4.3: Deploy Functions

1. Open a new SQL Editor tab
2. Copy the contents of `supabase/schema_functions.sql`
3. Paste into the SQL Editor and click "Run"
4. Verify that the functions were created successfully

### Step 4.4: Deploy Migrations

1. Open a new SQL Editor tab
2. Copy the contents of `supabase/schema_migrations.sql`
3. Paste into the SQL Editor and click "Run"
4. Run the migrations by executing: `SELECT run_all_migrations();`

### Step 4.5: Vector Embeddings for AI Features

The Lopi AI assistant's knowledge base uses vector embeddings for semantic search powered by pgvector:

1. Make sure the `vector` extension is enabled as described in Step 4.1
2. The `lopi_knowledge` table includes a vector column for embeddings
3. We use an IVFFlat index for efficient similarity search

```sql
-- The lopi_knowledge table structure
CREATE TABLE public.lopi_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    tags TEXT[],
    embedding VECTOR(1536), -- OpenAI embeddings are 1536 dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for vector similarity search
CREATE INDEX idx_lopi_knowledge_embedding ON public.lopi_knowledge USING ivfflat (embedding vector_cosine_ops);
```

#### Vector Search Functions

We've created two PostgreSQL functions for vector similarity search:

1. `match_knowledge(query_embedding VECTOR(1536), match_threshold FLOAT, match_count INT)` - Performs vector similarity search using the cosine distance operator `<=>` when embeddings are available.

2. `search_knowledge_with_embedding(query_embedding VECTOR(1536), match_threshold FLOAT, match_count INT)` - Similar to the above but returns results in a specific format for the AI assistant.

3. `get_lopi_context(user_id UUID, query_text TEXT)` - Gets context for the Lopi AI assistant based on a user query, including relevant knowledge, prayer stats, and recent prayers.

To generate and store embeddings, you'll need to use the OpenAI API or another embedding model. See the example in the `src/lib/ai.ts` file.

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" in the left sidebar
2. Under "Providers", enable the authentication methods you want to use:
   - Email (recommended)
   - Google (optional)
   - Apple (optional)
   - Facebook (optional)

3. Configure email templates:
   - Go to "Email Templates"
   - Customize the invitation, confirmation, and password reset emails to match your app's branding

## Step 6: Set Up Storage Buckets

1. Go to "Storage" in the left sidebar
2. Create the following buckets:
   - `avatars` (for user profile pictures)
   - `app-assets` (for app-related assets)

3. Set up bucket policies:
   - For `avatars`: Allow authenticated users to upload their own avatars
   - For `app-assets`: Restrict uploads to admin users, but allow public reading

## Step 7: Install Supabase Client in Your App

1. Install the Supabase client libraries:

```bash
npm install @supabase/supabase-js
```

2. Create a Supabase client instance in your app:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## Step 8: Generate TypeScript Types (Optional but Recommended)

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Login to Supabase CLI:

```bash
supabase login
```

3. Generate types based on your database schema:

```bash
supabase gen types typescript --project-id [your-project-id] --schema public > types/supabase.ts
```

## Step 9: Set Up Row-Level Security (RLS) Policies

The SQL schema files already include RLS policies, but verify they are working correctly:

1. Go to "Authentication" > "Policies" in your Supabase dashboard
2. Verify that each table has appropriate policies
3. Test the policies by creating test users and attempting to access data

## Step 10: Initialize Default Data

1. Open the SQL Editor
2. Run the following command to initialize default achievements:

```sql
SELECT initialize_default_achievements();
```

## Step 11: Test the Setup

1. Create a test user through your app's signup flow
2. Verify that the user can:
   - Sign up and log in
   - Create and view prayer records
   - Update settings
   - Use the Lopi AI assistant

## Step 12: Set Up Scheduled Functions (Optional)

For features like daily streak updates, you'll need to set up scheduled functions:

1. Install the pg_cron extension (if your Supabase plan supports it):

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

2. Schedule the streak update function to run daily:

```sql
SELECT cron.schedule('0 0 * * *', 'SELECT update_streaks();');
```

## Step 13: Set Up Monitoring and Backups

1. Go to "Settings" > "Database" in your Supabase dashboard
2. Enable point-in-time recovery for database backups
3. Set up database alerts for monitoring performance

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   - Verify that your environment variables are correctly set
   - Check that the authentication providers are properly configured

2. **Database Errors**:
   - Check the SQL logs in the Supabase dashboard
   - Verify that all migrations ran successfully

3. **RLS Policy Issues**:
   - Test policies with different user roles
   - Use the Supabase dashboard to debug policy effects

### Getting Help

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Supabase Discord Community: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: Create an issue in the project repository

## Next Steps

After setting up Supabase, you should:

1. Implement the authentication flow in your frontend
2. Connect the prayer tracking components to the Supabase backend
3. Set up the Lopi AI assistant integration
4. Test the app thoroughly with real user scenarios

## Conclusion

Your Supabase backend is now set up and ready to support the Hopium Prayer App. The database schema includes all necessary tables, functions, and security policies for user authentication, prayer tracking, analytics, and the Lopi AI assistant.
