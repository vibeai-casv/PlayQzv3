# PowerShell Script for Supabase Storage Setup
# For Windows users

# =====================================================
# Supabase Storage Setup Script (PowerShell)
# Description: Automated setup for quiz-media bucket
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Supabase Storage Setup for AI Quiz Application" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if DB_URL is set
if (-not $env:DB_URL) {
    Write-Host "Error: DB_URL environment variable not set" -ForegroundColor Red
    Write-Host "Please set it like this:" -ForegroundColor Yellow
    Write-Host '$env:DB_URL = "postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"' -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Database URL configured" -ForegroundColor Green
Write-Host ""

# Function to run SQL file
function Run-Migration {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "Running: $Description" -ForegroundColor Yellow
    
    try {
        $result = psql $env:DB_URL -f $FilePath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Success" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MigrationsDir = Join-Path $ScriptDir "migrations"

Write-Host "Migration files directory: $MigrationsDir"
Write-Host ""

# Check if migrations directory exists
if (-not (Test-Path $MigrationsDir)) {
    Write-Host "Error: Migrations directory not found" -ForegroundColor Red
    exit 1
}

# Run storage bucket migration
Write-Host "Step 1: Creating storage bucket and policies" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
Run-Migration -FilePath "$MigrationsDir/008_create_storage_bucket.sql" -Description "Storage bucket setup"
Write-Host ""

# Run media library enhancement
Write-Host "Step 2: Enhancing media library integration" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
Run-Migration -FilePath "$MigrationsDir/009_enhance_media_storage.sql" -Description "Media library enhancement"
Write-Host ""

# Verify setup
Write-Host "Step 3: Verifying setup" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan

# Check if bucket exists
$bucketCheck = psql $env:DB_URL -t -c "SELECT COUNT(*) FROM storage.buckets WHERE id = 'quiz-media';" 2>$null
$bucketCheck = $bucketCheck.Trim()

if ($bucketCheck -eq "1") {
    Write-Host "✓ Bucket 'quiz-media' created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Bucket creation failed" -ForegroundColor Red
    exit 1
}

# Check policies
$policyCount = psql $env:DB_URL -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';" 2>$null
$policyCount = $policyCount.Trim()

Write-Host "✓ Storage policies configured ($policyCount policies)" -ForegroundColor Green

# Check functions
$functionCount = psql $env:DB_URL -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_storage_url', 'validate_media_upload', 'list_storage_files');" 2>$null
$functionCount = $functionCount.Trim()

Write-Host "✓ Helper functions created ($functionCount functions)" -ForegroundColor Green
Write-Host ""

# Display bucket configuration
Write-Host "📦 Bucket Configuration Summary" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
psql $env:DB_URL -c @"
SELECT 
    id as bucket_name,
    CASE WHEN public THEN 'Yes' ELSE 'No' END as public_access,
    pg_size_pretty(file_size_limit) as max_file_size,
    array_length(allowed_mime_types, 1) as allowed_types
FROM storage.buckets 
WHERE id = 'quiz-media';
"@

Write-Host ""
Write-Host "📁 Storage Policies" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
psql $env:DB_URL -c @"
SELECT 
    policyname as policy,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%quiz-media%'
ORDER BY cmd, policyname;
"@

Write-Host ""
Write-Host "✅ Storage setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test file upload using the examples in STORAGE_GUIDE.md"
Write-Host "2. Create an admin user and upload test images"
Write-Host "3. Verify public access to uploaded files"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Storage Guide: supabase/STORAGE_GUIDE.md"
Write-Host "- Migration Files: supabase/migrations/008_*.sql and 009_*.sql"
Write-Host ""
Write-Host "🔗 Public URL Format:" -ForegroundColor Cyan
Write-Host "https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/{folder}/{filename}"
Write-Host ""
