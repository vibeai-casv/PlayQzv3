#!/usr/bin/env bash

# =====================================================
# Supabase Storage Setup Script
# Description: Automated setup for quiz-media bucket
# =====================================================

set -e  # Exit on error

echo "🚀 Supabase Storage Setup for AI Quiz Application"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DB_URL is set
if [ -z "$DB_URL" ]; then
    echo -e "${RED}Error: DB_URL environment variable not set${NC}"
    echo "Please set it like this:"
    echo 'export DB_URL="postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"'
    exit 1
fi

echo -e "${GREEN}✓${NC} Database URL configured"
echo ""

# Function to run SQL file
run_migration() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}Running:${NC} $description"
    
    if psql "$DB_URL" -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Success"
    else
        echo -e "${RED}✗${NC} Failed"
        exit 1
    fi
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

echo "Migration files directory: $MIGRATIONS_DIR"
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}Error: Migrations directory not found${NC}"
    exit 1
fi

# Run storage bucket migration
echo "Step 1: Creating storage bucket and policies"
echo "--------------------------------------------"
run_migration "$MIGRATIONS_DIR/008_create_storage_bucket.sql" "Storage bucket setup"
echo ""

# Run media library enhancement
echo "Step 2: Enhancing media library integration"
echo "--------------------------------------------"
run_migration "$MIGRATIONS_DIR/009_enhance_media_storage.sql" "Media library enhancement"
echo ""

# Verify setup
echo "Step 3: Verifying setup"
echo "--------------------------------------------"

# Check if bucket exists
BUCKET_CHECK=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM storage.buckets WHERE id = 'quiz-media';" 2>/dev/null | tr -d ' ')

if [ "$BUCKET_CHECK" = "1" ]; then
    echo -e "${GREEN}✓${NC} Bucket 'quiz-media' created successfully"
else
    echo -e "${RED}✗${NC} Bucket creation failed"
    exit 1
fi

# Check policies
POLICY_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}✓${NC} Storage policies configured ($POLICY_COUNT policies)"

# Check functions
FUNCTION_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_storage_url', 'validate_media_upload', 'list_storage_files');" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}✓${NC} Helper functions created ($FUNCTION_COUNT functions)"
echo ""

# Display bucket configuration
echo "📦 Bucket Configuration Summary"
echo "--------------------------------------------"
psql "$DB_URL" -c "
SELECT 
    id as bucket_name,
    CASE WHEN public THEN 'Yes' ELSE 'No' END as public_access,
    pg_size_pretty(file_size_limit) as max_file_size,
    array_length(allowed_mime_types, 1) as allowed_types
FROM storage.buckets 
WHERE id = 'quiz-media';
" 2>/dev/null

echo ""
echo "📁 Storage Policies"
echo "--------------------------------------------"
psql "$DB_URL" -c "
SELECT 
    policyname as policy,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%quiz-media%'
ORDER BY cmd, policyname;
" 2>/dev/null

echo ""
echo -e "${GREEN}✅ Storage setup completed successfully!${NC}"
echo ""
echo "🎯 Next Steps:"
echo "1. Test file upload using the examples in STORAGE_GUIDE.md"
echo "2. Create an admin user and upload test images"
echo "3. Verify public access to uploaded files"
echo ""
echo "📚 Documentation:"
echo "- Storage Guide: supabase/STORAGE_GUIDE.md"
echo "- Migration Files: supabase/migrations/008_*.sql and 009_*.sql"
echo ""
echo "🔗 Public URL Format:"
echo "https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/{folder}/{filename}"
echo ""
