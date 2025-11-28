# Supabase Database Migrations

This directory contains SQL migration scripts for the AI Quiz Application database.

## Migration Files

### 001_create_profiles_table.sql
**User Profiles Extension**
- Extends `auth.users` with custom profile data
- Enum types: `user_category`, `user_role`, `theme_preference`
- Includes automatic profile creation on signup
- RLS policies for user privacy and admin access

**Key Features:**
- JSONB fields for preferences and stats
- Email or phone requirement validation
- Bio length constraint (500 chars max)
- Phone format validation
- Auto-update timestamp trigger
- Indexes on email, phone, category, role

### 002_create_media_library_table.sql
**Media File Management**
- Stores uploaded images (logos, personalities, avatars)
- Enum: `media_type`
- File size limit: 10MB
- Supported formats: JPEG, PNG, GIF, WebP, SVG

**Key Features:**
- URL validation
- MIME type validation
- Active/inactive status
- Soft delete capability
- Admin-only upload/management
- Public read access for active media

### 003_create_questions_table.sql
**Quiz Questions Database**
- Enum types: `question_type`, `difficulty_level`
- Supports: text MCQ, logo identification, person identification
- JSONB options for flexibility

**Question Types:**
1. `text_mcq` - Multiple choice text questions
2. `image_identify_logo` - Logo identification with image
3. `image_identify_person` - Person identification with image
4. `true_false` - True/false questions
5. `short_answer` - Short text answers

**Key Features:**
- AI generation support with prompt tracking
- Usage statistics (usage_count, correct_count)
- Full-text search capability
- Verification system
- Tag-based categorization
- Composite indexes for performance

### 004_create_quiz_attempts_table.sql
**Quiz Session Tracking**
- Enum: `attempt_status`
- JSONB config for quiz settings
- Automatic score calculation
- Expiration support

**Key Features:**
- Question ID array for quiz structure
- Duplicate detection via quiz_hash
- Auto-update user stats on completion
- Performance metrics (accuracy, avg time)
- Expired attempt marking
- User statistics aggregation

### 005_create_quiz_responses_table.sql
**Individual Answer Storage**
- Tracks each question response
- Automatic question stats updates
- Points calculation

**Key Features:**
- Unique constraint per question per attempt
- Question position tracking
- Skip detection
- Time tracking per question
- Automatic trigger for question usage stats
- Performance analytics functions

### 006_create_user_activity_logs_table.sql
**Admin Activity Monitoring**
- Enum: `activity_type` (16 types)
- Comprehensive logging system
- IP address and user agent tracking

**Activity Types:**
- Authentication: login, logout, signup
- Profile: profile_updated, settings_changed
- Quiz: quiz_started, quiz_completed, quiz_abandoned
- Admin: account_disabled, account_enabled
- Content: question_created, media_uploaded

**Key Features:**
- Automatic triggers for key events
- JSONB metadata for flexibility
- GIN indexes for fast searches
- Success/failure tracking
- Optional cleanup function
- Country/city tracking support

### 007_create_analytics_views.sql
**Dashboard Analytics**
- Materialized views for performance
- Admin dashboard functions

**Views:**
1. `daily_quiz_stats` - Daily aggregate statistics
2. `category_performance` - Category-wise metrics

**Functions:**
- `refresh_analytics_views()` - Refresh materialized views
- `get_admin_dashboard_analytics()` - Complete dashboard data

## Installation

### Option 1: Supabase Dashboard
1. Open your Supabase project
2. Navigate to SQL Editor
3. Copy and paste each migration file in order (001, 002, 003...)
4. Execute each migration

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref hvkduszjecwrmdhyhndb

# Apply migrations
supabase db push

# Or apply individually
psql $DB_URL -f supabase/migrations/001_create_profiles_table.sql
psql $DB_URL -f supabase/migrations/002_create_media_library_table.sql
# ... continue for each file
```

### Option 3: Direct PostgreSQL
```bash
# Set your connection string
export DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"

# Run all migrations
for file in supabase/migrations/*.sql; do
    echo "Running $file..."
    psql $DB_URL -f "$file"
done
```

## Database Schema Overview

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
┌────────▼────────┐              ┌─────────▼──────────┐
│    profiles     │              │ user_activity_logs │
│  - user data    │              │   - audit trail    │
│  - preferences  │              └────────────────────┘
│  - stats        │
└────────┬────────┘
         │
         │ creates
         │
┌────────▼────────────┐
│  quiz_attempts      │
│  - session data     │◄──────┐
│  - scores           │       │
└────────┬────────────┘       │
         │                    │
         │ contains           │
         │                    │
┌────────▼────────────┐       │
│  quiz_responses     │       │
│  - answers          │───────┘ references
│  - correctness      │
└────────┬────────────┘
         │
         │ uses
         │
┌────────▼────────┐          ┌──────────────┐
│   questions     │──────────│media_library │
│  - quiz items   │  refs    │  - images    │
│  - options      │          └──────────────┘
└─────────────────┘
```

## Row Level Security (RLS)

All tables have RLS enabled with the following general patterns:

### User Access
- ✅ Users can view/edit their own data
- ❌ Users cannot view other users' private data
- ✅ Users can view public active questions

### Admin Access
- ✅ Admins can view all data
- ✅ Admins can create/update/delete questions
- ✅ Admins can manage media files
- ✅ Admins can view all user activity

### Public Access
- ✅ Active, verified questions (read-only)
- ✅ Active media files (read-only)
- ❌ No write access without authentication

## Indexes

All frequently queried columns are indexed:
- `user_id` - All user-related queries
- `category` - Question filtering
- `difficulty` - Quiz generation
- `is_active` - Active records filtering
- `created_at` - Chronological sorting
- Composite indexes for common query patterns

## Performance Optimization

### Materialized Views
Refresh materialized views periodically:
```sql
SELECT public.refresh_analytics_views();
```

Recommended: Set up a cron job to refresh hourly.

### Cleanup Functions
Remove old activity logs (keep 90 days):
```sql
SELECT public.cleanup_old_activity_logs(90);
```

### Mark Expired Attempts
Run periodically to mark expired quiz attempts:
```sql
SELECT public.mark_expired_attempts();
```

## Helper Functions

### User Management
```sql
-- Get user quiz statistics
SELECT * FROM public.get_user_quiz_stats('user-uuid-here');

-- Get recent user activity
SELECT * FROM public.get_recent_user_activity('user-uuid-here', 50);
```

### Quiz Management
```sql
-- Finalize a quiz attempt
SELECT * FROM public.finalize_quiz_attempt('attempt-uuid', 8, 480);

-- Get attempt summary
SELECT * FROM public.get_attempt_response_summary('attempt-uuid');
```

### Analytics
```sql
-- Get admin dashboard data
SELECT * FROM public.get_admin_dashboard_analytics(
    NOW() - INTERVAL '30 days',
    NOW()
);

-- Get activity statistics
SELECT * FROM public.get_activity_statistics(
    NOW() - INTERVAL '7 days',
    NOW()
);
```

## Maintenance

### Regular Tasks
1. **Refresh analytics** (hourly)
   ```sql
   SELECT public.refresh_analytics_views();
   ```

2. **Clean old logs** (weekly)
   ```sql
   SELECT public.cleanup_old_activity_logs(90);
   ```

3. **Mark expired attempts** (every 15 minutes)
   ```sql
   SELECT public.mark_expired_attempts();
   ```

### Monitoring Queries

**Check database size:**
```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

**Check table sizes:**
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Check index usage:**
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Backup and Restore

### Backup
```bash
# Full database backup
pg_dump $DB_URL > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump $DB_URL --schema-only > schema_backup.sql

# Data only
pg_dump $DB_URL --data-only > data_backup.sql
```

### Restore
```bash
psql $DB_URL < backup_20251127.sql
```

## Troubleshooting

### Common Issues

**RLS blocking queries?**
- Check if user is authenticated
- Verify user role in profiles table
- Test with RLS disabled (dev only): `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

**Slow queries?**
- Check if indexes are being used: `EXPLAIN ANALYZE SELECT ...`
- Refresh materialized views
- Consider adding new composite indexes

**Migration order errors?**
- Always run migrations in numerical order
- Check for foreign key dependencies
- Verify enum types are created before use

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review PostgreSQL documentation: https://www.postgresql.org/docs/
- Open an issue in the project repository

---

**Last Updated:** 2025-11-27  
**PostgreSQL Version:** 14+  
**Supabase Compatible:** Yes
