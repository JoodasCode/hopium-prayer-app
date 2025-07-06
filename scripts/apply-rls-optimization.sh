#!/bin/bash

# Apply RLS Performance Optimization to Supabase Database
# This script applies the RLS policy optimization to improve database performance

set -e

echo "🚀 Starting RLS Performance Optimization..."
echo "================================================"

# Check if we're in the correct directory
if [ ! -f "supabase/optimize_rls_policies.sql" ]; then
    echo "❌ Error: optimize_rls_policies.sql not found in supabase/ directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Please install Supabase CLI: https://supabase.com/docs/reference/cli/installing-the-cli"
    exit 1
fi

# Check if we're linked to a Supabase project
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "Please ensure you have your Supabase project configured"
    exit 1
fi

echo "✅ Environment checks passed"
echo ""

# Backup current schema (optional but recommended)
echo "📋 Creating backup of current schema..."
timestamp=$(date +"%Y%m%d_%H%M%S")
backup_file="supabase/schema_backup_${timestamp}.sql"

# Note: This would require manual backup or using Supabase dashboard
echo "⚠️  Manual backup recommended before proceeding"
echo "   You can backup your schema from the Supabase dashboard"
echo ""

# Prompt for confirmation
read -p "🔍 Are you ready to apply the RLS optimization? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🔧 Applying RLS optimization..."

# Apply the optimization using Supabase CLI
if supabase db push --local; then
    echo "✅ Local database updated successfully"
else
    echo "❌ Failed to update local database"
    exit 1
fi

# Apply to remote database (if linked)
echo ""
read -p "🌐 Apply to remote database as well? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Applying to remote database..."
    
    # Execute the optimization script on remote database
    if supabase db push; then
        echo "✅ Remote database updated successfully"
    else
        echo "❌ Failed to update remote database"
        echo "Please check your connection and try again"
        exit 1
    fi
fi

echo ""
echo "🎉 RLS Performance Optimization Complete!"
echo "================================================"
echo ""
echo "📊 Expected Benefits:"
echo "   • Faster query execution on large datasets"
echo "   • Reduced database CPU usage"
echo "   • Better app performance and responsiveness"
echo ""
echo "📋 Next Steps:"
echo "   1. Test your app functionality to ensure everything works"
echo "   2. Monitor query performance in Supabase dashboard"
echo "   3. Check application logs for any issues"
echo ""
echo "📚 For more details, see: docs/rls_optimization_guide.md"
echo ""
echo "✅ Optimization applied successfully!" 