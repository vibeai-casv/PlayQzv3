# AI Quiz Application - Quick Reference

## 🗂️ Project Structure

```
playqzv3/
├── openapi.yaml                    # API specification
├── api-docs.html                   # Interactive API documentation
├── README_API.md                   # API usage guide
└── supabase/
    └── migrations/
        ├── README.md               # Migration documentation
        ├── 001_create_profiles_table.sql
        ├── 002_create_media_library_table.sql
        ├── 003_create_questions_table.sql
        ├── 004_create_quiz_attempts_table.sql
        ├── 005_create_quiz_responses_table.sql
        ├── 006_create_user_activity_logs_table.sql
        └── 007_create_analytics_views.sql
```

## 📊 Database Tables

| Table | Purpose | Key Features |
|-------|---------|-------------|
| **profiles** | User profiles | Auth extension, JSONB stats, RLS |
| **media_library** | Image storage | File validation, admin-only |
| **questions** | Quiz questions | Multiple types, AI generation |
| **quiz_attempts** | Quiz sessions | Auto-scoring, expiration |
| **quiz_responses** | Individual answers | Performance tracking |
| **user_activity_logs** | Audit trail | Auto-logging, analytics |

## 🔑 Key Enums

```sql
-- User Management
user_category: student, professional, educator, hobbyist
user_role: user, admin
theme_preference: light, dark, auto

-- Questions
question_type: text_mcq, image_identify_logo, image_identify_person, true_false, short_answer
difficulty_level: easy, medium, hard

-- Quiz
attempt_status: in_progress, completed, abandoned, expired

-- Media
media_type: logo, personality, question_image, avatar

-- Activity
activity_type: login, logout, signup, profile_updated, quiz_started, quiz_completed, etc.
```

## 🚀 Quick Start

### 1. View API Documentation
```bash
# Server is already running on port 3000
# Open: http://localhost:3000/api-docs.html
```

### 2. Apply Database Migrations
```bash
# Option A: Supabase Dashboard
# Copy each SQL file content and run in SQL Editor

# Option B: Command line
cd e:/projects/playqzv3
psql $DB_URL -f supabase/migrations/001_create_profiles_table.sql
psql $DB_URL -f supabase/migrations/002_create_media_library_table.sql
psql $DB_URL -f supabase/migrations/003_create_questions_table.sql
psql $DB_URL -f supabase/migrations/004_create_quiz_attempts_table.sql
psql $DB_URL -f supabase/migrations/005_create_quiz_responses_table.sql
psql $DB_URL -f supabase/migrations/006_create_user_activity_logs_table.sql
psql $DB_URL -f supabase/migrations/007_create_analytics_views.sql
```

## 📡 API Endpoints Summary

### Authentication
```
POST   /auth/signup          - Register user
POST   /auth/login           - Login (Google/Phone)
POST   /auth/verify-otp      - Verify OTP
GET    /auth/me              - Current user
```

### User Profile
```
GET    /profiles/{userId}              - Get profile
PATCH  /profiles/{userId}              - Update profile
GET    /profiles/{userId}/activity     - Activity logs
```

### Quiz
```
POST   /quiz/generate                  - Generate quiz
POST   /quiz/attempts                  - Create attempt
GET    /quiz/attempts/{attemptId}      - Get attempt
POST   /quiz/attempts/{attemptId}/submit - Submit answers
GET    /quiz/attempts/history          - Quiz history
```

### Questions (Admin)
```
GET    /questions              - List questions
POST   /questions              - Create question
PATCH  /questions/{id}         - Update question
DELETE /questions/{id}         - Delete question
POST   /questions/generate-ai  - AI generation
```

### Media (Admin)
```
POST   /media/upload    - Upload file
GET    /media           - List files
DELETE /media/{id}      - Delete file
```

### Admin
```
GET    /admin/users                      - List users
PATCH  /admin/users/{userId}/disable     - Toggle status
GET    /admin/analytics                  - Dashboard data
```

## 🔐 Authentication

```bash
# Include in all authenticated requests:
Authorization: Bearer <your-jwt-token>
```

## 💡 Common Use Cases

### 1. Register and Login
```bash
# Sign up
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","name":"John Doe"}'

# Login
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/auth/login \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","token":"google-oauth-token"}'
```

### 2. Generate and Take Quiz
```bash
# Generate quiz
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/quiz/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"numQuestions":10,"difficulty":"medium","categories":["science"]}'

# Create attempt
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/quiz/attempts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quizId":"quiz-uuid"}'

# Submit answers
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/quiz/attempts/{attemptId}/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q-uuid","userAnswer":"Paris"}],"timeSpent":300}'
```

### 3. Admin Operations
```bash
# Create question
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/questions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText":"What is the capital of France?",
    "questionType":"text_mcq",
    "options":["Paris","London","Berlin","Madrid"],
    "correctAnswer":"Paris",
    "difficulty":"easy",
    "category":"geography"
  }'

# Get analytics
curl -X GET https://hvkduszjecwrmdhyhndb.supabase.co/admin/analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🛠️ Database Utilities

### Refresh Analytics
```sql
SELECT public.refresh_analytics_views();
```

### User Statistics
```sql
SELECT * FROM public.get_user_quiz_stats('user-uuid');
```

### Activity Logs
```sql
SELECT * FROM public.get_recent_user_activity('user-uuid', 50);
```

### Mark Expired Quizzes
```sql
SELECT public.mark_expired_attempts();
```

## 📈 Performance Tips

1. **Refresh materialized views hourly**
   ```sql
   SELECT public.refresh_analytics_views();
   ```

2. **Clean old logs weekly**
   ```sql
   SELECT public.cleanup_old_activity_logs(90);
   ```

3. **Use indexes** - All major query paths are indexed

4. **Enable connection pooling** in Supabase settings

## 🔧 Development Tools

### Validate OpenAPI Spec
```bash
npx @redocly/cli lint openapi.yaml
```

### Generate Client SDK
```bash
# TypeScript
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml -g typescript-fetch -o ./sdk/typescript

# Python
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml -g python -o ./sdk/python
```

### Mock API Server
```bash
npx @stoplight/prism-cli mock openapi.yaml
```

## 📝 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 413 | File Too Large |

## 🎯 Next Steps

1. ✅ Review OpenAPI spec: `openapi.yaml`
2. ✅ View interactive docs: `http://localhost:3000/api-docs.html`
3. ⏳ Apply database migrations to Supabase
4. ⏳ Test API endpoints
5. ⏳ Generate client SDKs for your frontend
6. ⏳ Set up automated analytics refresh
7. ⏳ Configure storage buckets for media uploads

## 📚 Additional Resources

- **OpenAPI Specification**: `openapi.yaml`
- **API Documentation**: `README_API.md`
- **Migration Guide**: `supabase/migrations/README.md`
- **Interactive Docs**: `http://localhost:3000/api-docs.html`

---

**Project**: AI Quiz Application  
**Version**: 1.0.0  
**Base URL**: https://hvkduszjecwrmdhyhndb.supabase.co  
**Last Updated**: 2025-11-27
