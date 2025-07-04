#!/bin/bash

# Lopi App Environment Setup Script
echo "🚀 Setting up Lopi App environment..."

# Create .env.local file with Supabase credentials
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ohilegtcwwmgqolearrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaWxlZ3Rjd3dtZ3FvbGVhcnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODA0NDcsImV4cCI6MjA2Njg1NjQ0N30.w8ijVd95kCbIuWNtA_POldshfg1wVeCoGmpT2ApdqCo

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
EOF

echo "✅ Environment file created successfully!"
echo "📁 Location: .env.local"
echo ""
echo "🔧 Next steps:"
echo "1. Run: npm run dev"
echo "2. Test Supabase connection"
echo "3. Begin Phase 1 implementation"
echo ""
echo "🗄️ Database Info:"
echo "- Project: Hopium App"
echo "- URL: https://ohilegtcwwmgqolearrh.supabase.co"
echo "- Tables: 20+ comprehensive schema"
echo "- Status: Active and ready" 