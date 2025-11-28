# 🚀 AI Quiz Application - Deployment Checklist

## ✅ Completed Tasks

- [x] Created OpenAPI 3.1 specification (`openapi.yaml`)
- [x] Created interactive API documentation (`api-docs.html`)
- [x] Created API usage guide (`README_API.md`)
- [x] Created 7 database migration files
- [x] Created migration documentation
- [x] Created quick reference guide
- [x] Set up local documentation server (running on port 3000)

## 📋 Next Steps

### 1. Database Setup

#### Option A: Supabase Dashboard (Recommended)
- [ ] Open [Supabase Dashboard](https://app.supabase.com)
- [ ] Navigate to your project: `hvkduszjecwrmdhyhndb`
- [ ] Go to SQL Editor
- [ ] Run migrations in order:
  - [ ] `001_create_profiles_table.sql`
  - [ ] `002_create_media_library_table.sql`
  - [ ] `003_create_questions_table.sql`
  - [ ] `004_create_quiz_attempts_table.sql`
  - [ ] `005_create_quiz_responses_table.sql`
  - [ ] `006_create_user_activity_logs_table.sql`
  - [ ] `007_create_analytics_views.sql`

#### Option B: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref hvkduszjecwrmdhyhndb

# Apply all migrations
supabase db push
```

#### Option C: Direct PostgreSQL
```bash
# Set connection string
export DB_URL="postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"

# Run migrations
cd e:/projects/playqzv3
for file in supabase/migrations/*.sql; do
    echo "Running $file..."
    psql $DB_URL -f "$file"
done
```

### 2. Storage Buckets

#### Option A: Automated Setup (Recommended)
```bash
# For Linux/Mac
cd supabase
chmod +x setup-storage.sh
export DB_URL="postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"
./setup-storage.sh

# For Windows PowerShell
cd supabase
$env:DB_URL = "postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"
.\setup-storage.ps1
```

#### Option B: Manual Setup
- [ ] Run storage migrations
  - [ ] `008_create_storage_bucket.sql` - Create quiz-media bucket
  - [ ] `009_enhance_media_storage.sql` - Enhance media library

- [ ] Verify bucket configuration
  ```sql
  SELECT * FROM storage.buckets WHERE id = 'quiz-media';
  ```

- [ ] Test file upload (see `STORAGE_GUIDE.md`)

**Bucket Configuration:**
- Bucket name: `quiz-media`
- Public: ✅ Yes
- File size limit: 5MB
- Folders: `/logos` and `/personalities`
- Allowed types: JPG, JPEG, PNG, WebP, GIF

### 3. Authentication Setup

- [ ] Configure Google OAuth
  1. Go to Supabase Dashboard -> Authentication -> Providers
  2. Enable Google provider
  3. Add Google OAuth credentials
  4. Set redirect URLs

- [ ] Configure Phone OTP (Optional)
  1. Enable Phone provider in Supabase
  2. Configure SMS provider (Twilio/MessageBird)
  3. Add phone number verification

### 4. Environment Variables

Create `.env` file with:
```env
SUPABASE_URL=https://hvkduszjecwrmdhyhndb.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# For AI question generation
OPENAI_API_KEY=your-openai-key
# OR
OPENROUTER_API_KEY=your-openrouter-key
```

### 5. Create Admin User

- [ ] Sign up a user via the API or dashboard
- [ ] Run SQL to promote to admin:
  ```sql
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = 'admin@example.com';
  ```

### 6. Seed Initial Data (Optional)

- [ ] Add initial question categories
- [ ] Upload logo/personality images
- [ ] Create sample questions

Example:
```sql
-- Add sample questions
INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by
) VALUES (
    'What is the capital of France?',
    'text_mcq',
    '["Paris", "London", "Berlin", "Madrid"]'::jsonb,
    'Paris',
    'easy',
    'geography',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);
```

### 7. Set Up Scheduled Tasks

Using Supabase Edge Functions or external cron:

- [ ] Refresh analytics views (hourly)
  ```sql
  SELECT public.refresh_analytics_views();
  ```

- [ ] Mark expired quiz attempts (every 15 min)
  ```sql
  SELECT public.mark_expired_attempts();
  ```

- [ ] Clean old activity logs (weekly)
  ```sql
  SELECT public.cleanup_old_activity_logs(90);
  ```

### 8. API Client Generation

- [ ] Generate TypeScript client
  ```bash
  npx @openapitools/openapi-generator-cli generate \
    -i openapi.yaml \
    -g typescript-fetch \
    -o ./sdk/typescript
  ```

- [ ] Generate Python client (if needed)
  ```bash
  npx @openapitools/openapi-generator-cli generate \
    -i openapi.yaml \
    -g python \
    -o ./sdk/python
  ```

### 9. Testing

- [ ] Test user registration
- [ ] Test login (Google OAuth and Phone OTP)
- [ ] Test quiz generation
- [ ] Test quiz attempt flow
- [ ] Test admin endpoints
- [ ] Test media upload
- [ ] Test analytics endpoints

### 10. Monitoring Setup

- [ ] Enable Supabase monitoring
- [ ] Set up error tracking (Sentry/etc.)
- [ ] Configure logging
- [ ] Set up alerts for:
  - High error rates
  - Slow query performance
  - Storage limits
  - Database connection limits

### 11. Performance Optimization

- [ ] Enable connection pooling
- [ ] Configure appropriate pool size
- [ ] Set up CDN for static assets
- [ ] Optimize image delivery
- [ ] Enable compression

### 12. Security Review

- [ ] Review all RLS policies
- [ ] Check API authentication
- [ ] Validate input sanitization
- [ ] Test rate limiting
- [ ] Review CORS settings
- [ ] Enable HTTPS only
- [ ] Set security headers

### 13. Documentation

- [ ] Update API base URL in docs (if different)
- [ ] Document deployment process
- [ ] Create user guide
- [ ] Create admin guide
- [ ] Document troubleshooting steps

### 14. Production Checklist

- [ ] Backup database before deployment
- [ ] Test all migrations on staging
- [ ] Update API documentation with production URL
- [ ] Configure production environment variables
- [ ] Set up monitoring and alerts
- [ ] Test all critical user flows
- [ ] Prepare rollback plan

## 🔍 Verification Commands

### Check Database Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### Check Indexes
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Verify Functions
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### Test Analytics
```sql
-- Get dashboard data
SELECT public.get_admin_dashboard_analytics();

-- Refresh views
SELECT public.refresh_analytics_views();
```

## 📊 Health Check Endpoints

Create these for monitoring:

```
GET /health           - API health status
GET /health/db        - Database connectivity
GET /health/storage   - Storage accessibility
```

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ All migrations run without errors
- ✅ Users can sign up and log in
- ✅ Quizzes can be generated and completed
- ✅ Admin panel shows analytics
- ✅ Media uploads work correctly
- ✅ RLS policies prevent unauthorized access
- ✅ Performance is acceptable (<500ms for most queries)
- ✅ All tests pass

## 🆘 Rollback Plan

If deployment fails:

1. **Database**: Restore from backup
   ```bash
   psql $DB_URL < backup_before_migration.sql
   ```

2. **API**: Revert to previous version

3. **Storage**: Clear new buckets if needed

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **OpenAPI Spec**: https://spec.openapis.org/oas/v3.1.0
- **Project Docs**: 
  - `README_API.md` - API documentation
  - `QUICK_REFERENCE.md` - Quick reference
  - `supabase/migrations/README.md` - Migration guide

---

**Status**: Ready for deployment  
**Last Updated**: 2025-11-27  
**Version**: 1.0.0
