# API Documentation

Complete REST API specification for the Multilingual Learning Assistant backend.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student",
  "language": "en",
  "institutionId": "inst-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "language": "en"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login

Authenticate a user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "language": "en"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout

Logout and invalidate token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/refresh

Refresh JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## User Management Endpoints

### GET /users

Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` (optional): Filter by role (admin, teacher, student)
- `institutionId` (optional): Filter by institution
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "language": "en",
        "institutionId": "inst-001",
        "createdAt": "2026-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### GET /users/:id

Get user details by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "language": "en",
    "institutionId": "inst-001",
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

### POST /users

Create a new user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "teacher",
  "language": "hi",
  "institutionId": "inst-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-124",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "teacher",
    "language": "hi"
  }
}
```

### PUT /users/:id

Update user details.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "language": "ta"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-124",
    "name": "Jane Smith Updated",
    "language": "ta"
  }
}
```

### DELETE /users/:id

Delete a user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Content Management Endpoints

### GET /content

Get all content.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `subject` (optional): Filter by subject
- `level` (optional): Filter by level (beginner, intermediate, advanced)
- `language` (optional): Filter by language
- `approved` (optional): Filter by approval status (true/false)
- `uploadedBy` (optional): Filter by uploader ID
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "contentId": "content-001",
        "subject": "Mathematics",
        "topic": "Algebra Basics",
        "level": "beginner",
        "language": "en",
        "text": "Content text...",
        "simplifiedText": "Simplified text...",
        "uploadedBy": "teacher-001",
        "approved": true,
        "createdAt": "2026-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### GET /content/:id

Get content by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content-001",
    "subject": "Mathematics",
    "topic": "Algebra Basics",
    "level": "beginner",
    "language": "en",
    "text": "Full content text...",
    "simplifiedText": "Simplified version...",
    "uploadedBy": "teacher-001",
    "approved": true,
    "translations": {
      "en": "English text...",
      "hi": "Hindi text...",
      "ta": "Tamil text..."
    },
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

### POST /content

Upload new content (Teacher only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subject": "Science",
  "topic": "Water Cycle",
  "level": "beginner",
  "language": "en",
  "text": "The water cycle describes...",
  "targetLanguages": ["hi", "ta", "te"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content-002",
    "subject": "Science",
    "topic": "Water Cycle",
    "approved": false,
    "message": "Content submitted for approval"
  }
}
```

### PUT /content/:id

Update content (Teacher - own content only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subject": "Science Updated",
  "text": "Updated content text..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content-002",
    "subject": "Science Updated",
    "message": "Content updated successfully"
  }
}
```

### DELETE /content/:id

Delete content (Teacher - own content, Admin - any content).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### POST /content/:id/approve

Approve content (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content-002",
    "approved": true,
    "message": "Content approved"
  }
}
```

### POST /content/:id/reject

Reject content (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Content quality does not meet standards"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content rejected"
}
```

### GET /content/:id/translations

Get all translations for content.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content-001",
    "translations": {
      "en": "English version...",
      "hi": "Hindi version...",
      "ta": "Tamil version...",
      "te": "Telugu version..."
    }
  }
}
```

---

## Progress Tracking Endpoints

### GET /progress/:studentId

Get progress for a student.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "progress-001",
      "studentId": "student-123",
      "contentId": "content-001",
      "topic": "Algebra Basics",
      "completion": 75,
      "score": 85,
      "lastAccessed": "2026-02-02T14:30:00Z"
    }
  ]
}
```

### POST /progress

Record new progress.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "studentId": "student-123",
  "contentId": "content-001",
  "completion": 50,
  "score": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "progress-002",
    "studentId": "student-123",
    "contentId": "content-001",
    "completion": 50,
    "score": 75
  }
}
```

### PUT /progress/:id

Update progress.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "completion": 100,
  "score": 95
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "progress-002",
    "completion": 100,
    "score": 95
  }
}
```

---

## AI Service Endpoints

### POST /ai/detect-language

Detect language of text.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "यह हिंदी में है"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "detectedLanguage": "hi",
    "confidence": 0.98
  }
}
```

### POST /ai/translate

Translate text to target language.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "sourceLang": "en",
  "targetLang": "hi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "translatedText": "नमस्ते, आप कैसे हैं?",
    "sourceLang": "en",
    "targetLang": "hi"
  }
}
```

### POST /ai/simplify

Simplify text based on level.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Photosynthesis is the process...",
  "level": "beginner"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simplifiedText": "Plants make their own food using sunlight...",
    "level": "beginner"
  }
}
```

### POST /ai/answer-question

Generate answer to student question.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "question": "What is algebra?",
  "context": "Algebra is a branch of mathematics...",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Algebra is a type of math that uses letters and symbols to represent numbers...",
    "confidence": 0.92
  }
}
```

---

## Institution Endpoints

### GET /institutions

Get all institutions (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inst-001",
      "name": "Demo Institution",
      "supportedLanguages": ["en", "hi", "ta"],
      "adminId": "admin-001",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### POST /institutions

Create new institution (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New School",
  "supportedLanguages": ["en", "hi", "ta", "te"],
  "adminId": "admin-002"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inst-002",
    "name": "New School",
    "supportedLanguages": ["en", "hi", "ta", "te"]
  }
}
```

### PUT /institutions/:id

Update institution settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "supportedLanguages": ["en", "hi", "ta", "te", "kn"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inst-001",
    "supportedLanguages": ["en", "hi", "ta", "te", "kn"]
  }
}
```

---

## Analytics Endpoints

### GET /analytics/overview

Get system-wide analytics (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 250,
    "totalStudents": 200,
    "totalTeachers": 45,
    "totalAdmins": 5,
    "totalContent": 120,
    "approvedContent": 100,
    "pendingContent": 20,
    "languageUsage": {
      "en": 150,
      "hi": 50,
      "ta": 30,
      "te": 20
    }
  }
}
```

### GET /analytics/student/:id

Get student performance analytics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "student-123",
    "totalLessonsAccessed": 25,
    "completedLessons": 18,
    "averageScore": 87,
    "learningStreak": 7,
    "topSubjects": ["Mathematics", "Science"]
  }
}
```

### GET /analytics/teacher/:id

Get teacher engagement analytics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "teacherId": "teacher-001",
    "contentUploaded": 15,
    "approvedContent": 12,
    "pendingContent": 3,
    "studentEngagement": 85,
    "totalViews": 450
  }
}
```

---

## File Upload Endpoints

### POST /upload/content

Upload content file (PDF, audio, video).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
- `file`: File to upload
- `subject`: Subject name
- `topic`: Topic name
- `level`: Difficulty level

**Response:**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.example.com/content/file-123.pdf",
    "contentId": "content-003",
    "message": "File uploaded successfully"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `DUPLICATE_EMAIL` | Email already registered |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `SERVER_ERROR` | Internal server error |
| `AI_SERVICE_ERROR` | AI service unavailable |

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Content endpoints**: 100 requests per minute
- **AI endpoints**: 20 requests per minute
- **Other endpoints**: 60 requests per minute

---

## Webhooks

### Content Approval Webhook

Triggered when content is approved/rejected.

**Payload:**
```json
{
  "event": "content.approved",
  "timestamp": "2026-02-02T10:00:00Z",
  "data": {
    "contentId": "content-001",
    "uploadedBy": "teacher-001",
    "approved": true
  }
}
```

### Progress Update Webhook

Triggered when student completes a lesson.

**Payload:**
```json
{
  "event": "progress.completed",
  "timestamp": "2026-02-02T10:00:00Z",
  "data": {
    "studentId": "student-123",
    "contentId": "content-001",
    "score": 95
  }
}
```

---

## Testing

Use the provided Postman collection for API testing:
- Import `postman_collection.json`
- Set environment variables
- Run test scenarios

---

**API Version**: 1.0  
**Last Updated**: February 2, 2026  
**Contact**: api-support@mlassistant.com
