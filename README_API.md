# AI Quiz Application API Documentation

## 📋 Overview

This is the official OpenAPI 3.1 specification for the AI Quiz Application. The API provides comprehensive endpoints for managing quizzes, users, questions, and analytics.

**Base URL:** `https://hvkduszjecwrmdhyhndb.supabase.co`

## 🚀 Quick Start

### View Interactive Documentation

1. **Local Viewing:**
   ```bash
   # Serve the documentation locally
   npx serve .
   ```
   Then open `http://localhost:3000/api-docs.html` in your browser.

2. **Online Validators:**
   - [Swagger Editor](https://editor.swagger.io/) - Import `openapi.yaml`
   - [Redoc](https://redocly.github.io/redoc/) - Beautiful API documentation

### Authentication

All authenticated endpoints require a JWT bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

Get your token by:
1. Signing up: `POST /auth/signup`
2. Logging in: `POST /auth/login`

## 📚 API Sections

### 🔐 Authentication
- **POST** `/auth/signup` - Register new user
- **POST** `/auth/login` - Login (Google OAuth or Phone OTP)
- **POST** `/auth/verify-otp` - Verify phone OTP
- **GET** `/auth/me` - Get current user

### 👤 User Profile
- **GET** `/profiles/{userId}` - Get user profile
- **PATCH** `/profiles/{userId}` - Update profile
- **GET** `/profiles/{userId}/activity` - Get activity logs

### 🎯 Quiz Management
- **POST** `/quiz/generate` - Generate AI quiz
- **POST** `/quiz/attempts` - Start new attempt
- **GET** `/quiz/attempts/{attemptId}` - Get attempt details
- **POST** `/quiz/attempts/{attemptId}/submit` - Submit answers
- **GET** `/quiz/attempts/history` - Get quiz history

### ❓ Questions (Admin)
- **GET** `/questions` - List all questions
- **POST** `/questions` - Create question
- **PATCH** `/questions/{id}` - Update question
- **DELETE** `/questions/{id}` - Delete question
- **POST** `/questions/generate-ai` - Auto-generate questions

### 🖼️ Media (Admin)
- **POST** `/media/upload` - Upload image file
- **GET** `/media` - List media files
- **DELETE** `/media/{id}` - Delete media file

### 👑 Admin
- **GET** `/admin/users` - List all users
- **PATCH** `/admin/users/{userId}/disable` - Toggle user status
- **GET** `/admin/analytics` - Get analytics dashboard

## 🔑 Key Features

### Quiz Generation
Generate customized quizzes with AI:

```json
{
  "numQuestions": 10,
  "difficulty": "medium",
  "categories": ["science", "history"],
  "timeLimit": 60,
  "includeExplanations": true
}
```

### Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource created |
| 204 | Success (no content) |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 413 | File too large |

## 💡 Examples

### Register a New User

```bash
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Generate a Quiz

```bash
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/quiz/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numQuestions": 10,
    "difficulty": "medium",
    "categories": ["science"]
  }'
```

### Submit Quiz Answers

```bash
curl -X POST https://hvkduszjecwrmdhyhndb.supabase.co/quiz/attempts/{attemptId}/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "uuid-here",
        "userAnswer": "Paris"
      }
    ],
    "timeSpent": 300
  }'
```

## 🛠️ Development Tools

### Validate the OpenAPI Spec

```bash
# Using npx
npx @redocly/cli lint openapi.yaml

# Using Docker
docker run --rm -v ${PWD}:/spec redocly/cli lint /spec/openapi.yaml
```

### Generate Client SDKs

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./sdk/typescript

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./sdk/python
```

### Mock Server for Testing

```bash
# Using Prism
npx @stoplight/prism-cli mock openapi.yaml
```

## 📊 Data Models

### User Profile Structure
```typescript
{
  id: string (uuid)
  email: string
  name: string
  institution?: string
  category: 'student' | 'professional' | 'educator' | 'hobbyist'
  role: 'user' | 'admin'
  stats: {
    totalAttempts: number
    averageScore: number
    bestScore: number
  }
}
```

### Question Structure
```typescript
{
  id: string (uuid)
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  points: number
}
```

### Quiz Attempt Structure
```typescript
{
  id: string (uuid)
  userId: string
  quizId: string
  status: 'in_progress' | 'completed' | 'abandoned'
  score: number (0-100)
  correctAnswers: number
  totalQuestions: number
  responses: QuizResponse[]
  startedAt: datetime
  completedAt?: datetime
  timeSpent: number (seconds)
}
```

## 🔒 Security

### Authentication Flow

1. **Sign Up / Login** → Receive JWT token
2. **Include Token** in all subsequent requests
3. **Token Refresh** using refresh token when expired

### Admin Endpoints

Admin-only endpoints require:
- Valid JWT token
- User role: `admin`

Attempting to access admin endpoints without proper permissions returns `403 Forbidden`.

## 📝 Notes

- All timestamps are in ISO 8601 format
- All IDs are UUIDs (v4)
- Pagination uses `limit` and `offset` parameters
- Maximum file upload size: Check API response for details
- Rate limiting may apply (check response headers)

## 🤝 Support

For API support or questions:
- Email: support@aiquiz.com
- Documentation: View `api-docs.html` for interactive testing

## 📄 License

This API specification is part of the AI Quiz Application project.

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-27  
**Specification:** OpenAPI 3.1.0
