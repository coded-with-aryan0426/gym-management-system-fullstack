# Beta Feedback System API Documentation

## Overview
The Beta Feedback System provides a comprehensive REST API for collecting, managing, and analyzing user feedback during beta testing. The system captures page context, user information, screenshots, and detailed feedback with intelligent categorization and prioritization.

## Base URL
```
http://localhost:8090/api/beta
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### 1. Submit Feedback
**POST** `/api/beta/feedback`

Submit new feedback from any authenticated user.

**Authorization**: Any authenticated user

**Request Body**:
```json
{
  "userId": 1,
  "testerName": "John Doe",
  "testerEmail": "john@example.com",
  "testerRole": "TRAINER",
  "pageRoute": "/trainer/members",
  "pageTitle": "Trainer Members Page",
  "section": "Member List View",
  "browser": "Chrome 120.0",
  "screenSize": "1440x900",
  "severity": "UI_ISSUE",
  "category": "UI",
  "subject": "Button text not visible",
  "description": "The 'View Profile' button text appears to be white on white background",
  "stepsToReproduce": "1. Go to /trainer/members\n2. Look at any member row\n3. Notice the button text is not visible",
  "screenshotUrl": "https://example.com/screenshot.png",
  "sessionId": "sess_12345",
  "betaVersion": "1.0"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "userId": 1,
  "testerName": "John Doe",
  "testerEmail": "john@example.com",
  "testerRole": "TRAINER",
  "pageRoute": "/trainer/members",
  "pageTitle": "Trainer Members Page",
  "section": "Member List View",
  "browser": "Chrome 120.0",
  "screenSize": "1440x900",
  "severity": "UI_ISSUE",
  "category": "UI",
  "subject": "Button text not visible",
  "description": "The 'View Profile' button text appears to be white on white background",
  "stepsToReproduce": "1. Go to /trainer/members\n2. Look at any member row\n3. Notice the button text is not visible",
  "screenshotUrl": "https://example.com/screenshot.png",
  "status": "NEW",
  "adminNotes": null,
  "priorityScore": 0,
  "submittedAt": "2024-03-24T14:30:00Z",
  "resolvedAt": null,
  "sessionId": "sess_12345",
  "betaVersion": "1.0"
}
```

### 2. List All Feedback
**GET** `/api/beta/feedback?page=0&size=20&sort=submittedAt,desc`

Retrieve all feedback with pagination (admin only).

**Authorization**: Admin role required

**Query Parameters**:
- `page` (optional, default: 0) - Page number for pagination
- `size` (optional, default: 20) - Number of items per page
- `sort` (optional) - Sort criteria (e.g., `submittedAt,desc`)

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "testerName": "John Doe",
      "testerEmail": "john@example.com",
      "status": "NEW",
      "severity": "UI_ISSUE",
      "category": "UI",
      "subject": "Button text not visible",
      "pageRoute": "/trainer/members",
      "priorityScore": 0,
      "submittedAt": "2024-03-24T14:30:00Z",
      "resolvedAt": null
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "currentPage": 0,
  "hasNext": true,
  "hasPrevious": false
}
```

### 3. Get Feedback by ID
**GET** `/api/beta/feedback/{id}`

Retrieve a specific feedback item by ID (admin only).

**Authorization**: Admin role required

**Path Parameters**:
- `id` (required) - Feedback ID

**Response** (200 OK):
```json
{
  "id": 1,
  "userId": 1,
  "testerName": "John Doe",
  "testerEmail": "john@example.com",
  "testerRole": "TRAINER",
  "pageRoute": "/trainer/members",
  "pageTitle": "Trainer Members Page",
  "section": "Member List View",
  "browser": "Chrome 120.0",
  "screenSize": "1440x900",
  "severity": "UI_ISSUE",
  "category": "UI",
  "subject": "Button text not visible",
  "description": "The 'View Profile' button text appears to be white on white background",
  "stepsToReproduce": "1. Go to /trainer/members\n2. Look at any member row\n3. Notice the button text is not visible",
  "screenshotUrl": "https://example.com/screenshot.png",
  "status": "NEW",
  "adminNotes": null,
  "priorityScore": 0,
  "submittedAt": "2024-03-24T14:30:00Z",
  "resolvedAt": null,
  "sessionId": "sess_12345",
  "betaVersion": "1.0"
}
```

### 4. Update Feedback Status
**PATCH** `/api/beta/feedback/{id}/status`

Update feedback status, admin notes, and priority score (admin only).

**Authorization**: Admin role required

**Path Parameters**:
- `id` (required) - Feedback ID

**Request Body**:
```json
{
  "status": "IN_PROGRESS",
  "adminNotes": "Investigating button styling issue",
  "priorityScore": 8
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "status": "IN_PROGRESS",
  "adminNotes": "Investigating button styling issue",
  "priorityScore": 8,
  "submittedAt": "2024-03-24T14:30:00Z",
  "resolvedAt": null
}
```

### 5. Get Feedback Statistics
**GET** `/api/beta/feedback/stats`

Get comprehensive statistics about all feedback (admin only).

**Authorization**: Admin role required

**Response** (200 OK):
```json
{
  "totalCount": 42,
  "bugCount": 12,
  "uiIssueCount": 15,
  "suggestionCount": 8,
  "improvementCount": 5,
  "questionCount": 2,
  "openCount": 25,
  "resolvedCount": 17,
  "byPage": {
    "/trainer/members": 18,
    "/trainer/dashboard": 12,
    "/trainer/classes": 8,
    "/trainer/schedule": 4
  },
  "byCategory": {
    "UI": 20,
    "PERFORMANCE": 8,
    "LOGIC": 7,
    "FEATURE": 5,
    "SECURITY": 2,
    "DATA": 0
  },
  "bySeverity": {
    "BUG": 12,
    "UI_ISSUE": 15,
    "SUGGESTION": 8,
    "IMPROVEMENT": 5,
    "QUESTION": 2
  },
  "byStatus": {
    "NEW": 15,
    "ACKNOWLEDGED": 8,
    "IN_PROGRESS": 2,
    "RESOLVED": 16,
    "WONT_FIX": 1
  }
}
```

### 6. Export Feedback to CSV
**GET** `/api/beta/feedback/export`

Export all feedback to CSV format (admin only).

**Authorization**: Admin role required

**Response** (200 OK, text/csv):
```csv
ID,Submitted At,Tester Name,Tester Role,Page Route,Section,Severity,Category,Subject,Description,Steps to Reproduce,Status,Priority Score,Admin Notes,Resolved At
1,"2024-03-24T14:30:00","John Doe","TRAINER","/trainer/members","Member List View","UI_ISSUE","UI","Button text not visible","The 'View Profile' button text appears to be white on white background","1. Go to /trainer/members\n2. Look at any member row\n3. Notice the button text is not visible","NEW",0,"","
```

### 7. Filter Feedback
**POST** `/api/beta/feedback/filter?page=0&size=20`

Advanced filtering of feedback by multiple criteria (admin only).

**Authorization**: Admin role required

**Query Parameters**:
- `page` (optional, default: 0) - Page number for pagination
- `size` (optional, default: 20) - Number of items per page

**Request Body**:
```json
{
  "page_route": "/trainer/members",
  "severity": "UI_ISSUE",
  "status": "NEW",
  "category": "UI",
  "tester_email": "john@example.com"
}
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "testerName": "John Doe",
      "testerEmail": "john@example.com",
      "status": "NEW",
      "severity": "UI_ISSUE",
      "category": "UI",
      "subject": "Button text not visible",
      "pageRoute": "/trainer/members",
      "priorityScore": 0,
      "submittedAt": "2024-03-24T14:30:00Z",
      "resolvedAt": null
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "currentPage": 0,
  "hasNext": false,
  "hasPrevious": false
}
```

## Data Models

### BetaFeedback Entity

| Field | Type | Max Length | Required | Description |
|-------|------|-----------|----------|-------------|
| id | Long | - | Yes (auto-generated) | Unique feedback identifier |
| userId | Long | - | Yes | ID of the user submitting feedback |
| testerName | String | 255 | No | Name of the tester |
| testerEmail | String | 255 | Yes | Email of the tester |
| testerRole | String | 50 | No | Role of tester (OWNER, TRAINER, MEMBER) |
| pageRoute | String | 500 | Yes | URL path of the page (e.g., "/trainer/members") |
| pageTitle | String | 255 | No | Human-readable page title |
| section | String | 255 | No | Specific section within the page |
| browser | String | 255 | No | Browser user agent string |
| screenSize | String | 50 | No | Screen resolution (e.g., "1440x900") |
| severity | String | 50 | Yes | Severity level: BUG, UI_ISSUE, SUGGESTION, IMPROVEMENT, QUESTION |
| category | String | 50 | No | Category: UI, PERFORMANCE, LOGIC, FEATURE, SECURITY, DATA |
| subject | String | 500 | Yes | Brief subject of the feedback |
| description | Text | Unlimited | No | Detailed description |
| stepsToReproduce | Text | Unlimited | No | Steps to reproduce the issue |
| screenshotUrl | String | 1000 | No | URL to screenshot attachment |
| status | String | 50 | No (default: NEW) | Status: NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, WONT_FIX |
| adminNotes | Text | Unlimited | No | Internal admin notes |
| priorityScore | Integer | - | No (default: 0) | Priority score 0-10 |
| submittedAt | DateTime | - | Yes (auto-set) | Timestamp when feedback was submitted |
| resolvedAt | DateTime | - | No | Timestamp when feedback was resolved |
| sessionId | String | 100 | No | Beta testing session ID |
| betaVersion | String | 50 | No (default: 1.0) | Beta version number |

### Status Lifecycle

```
NEW
  ↓
ACKNOWLEDGED
  ↓
IN_PROGRESS
  ↓
RESOLVED (or WONT_FIX)
  ↓
[resolvedAt timestamp set]
```

### Severity Levels
- **BUG**: Critical issue preventing functionality
- **UI_ISSUE**: Visual or interface problem
- **SUGGESTION**: Suggestion for improvement
- **IMPROVEMENT**: Proposed enhancement
- **QUESTION**: General question or clarification needed

### Categories
- **UI**: User interface related
- **PERFORMANCE**: Performance or speed issues
- **LOGIC**: Business logic problems
- **FEATURE**: Feature request or missing functionality
- **SECURITY**: Security-related concern
- **DATA**: Data accuracy or consistency issue

## Error Responses

### 400 Bad Request
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "testerEmail",
      "message": "Email format is invalid"
    },
    {
      "field": "severity",
      "message": "Severity must be one of: BUG, UI_ISSUE, SUGGESTION, IMPROVEMENT, QUESTION"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "message": "Access denied. Admin role required for this operation.",
  "timestamp": "2024-03-24T14:30:00Z"
}
```

### 404 Not Found
```json
{
  "status": 404,
  "message": "Feedback not found with id: 999",
  "timestamp": "2024-03-24T14:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Failed to submit feedback: Database connection error",
  "timestamp": "2024-03-24T14:30:00Z"
}
```

## Example Use Cases

### Case 1: User Submitting UI Feedback
```bash
curl -X POST http://localhost:8090/api/beta/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "userId": 5,
    "testerName": "Sarah Smith",
    "testerEmail": "sarah@example.com",
    "testerRole": "TRAINER",
    "pageRoute": "/trainer/members",
    "pageTitle": "Trainer Members",
    "section": "Member Card",
    "browser": "Safari 17.0",
    "screenSize": "1920x1080",
    "severity": "UI_ISSUE",
    "category": "UI",
    "subject": "Member status badge colors not clear",
    "description": "The status badges for member health status are hard to distinguish from each other"
  }'
```

### Case 2: Admin Reviewing and Triaging Feedback
```bash
# Get all NEW feedback
curl "http://localhost:8090/api/beta/feedback/filter?page=0&size=10" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"status": "NEW"}'

# Update feedback to IN_PROGRESS with priority score
curl -X PATCH http://localhost:8090/api/beta/feedback/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "status": "IN_PROGRESS",
    "adminNotes": "Assigned to frontend team",
    "priorityScore": 8
  }'

# Get statistics dashboard
curl "http://localhost:8090/api/beta/feedback/stats" \
  -H "Authorization: Bearer {admin_token}"
```

### Case 3: Exporting Feedback for Analysis
```bash
curl "http://localhost:8090/api/beta/feedback/export" \
  -H "Authorization: Bearer {admin_token}" \
  -o feedback_export.csv
```

## Testing with Postman

1. Import the API endpoints into Postman collection
2. Set up environment variables:
   - `base_url`: http://localhost:8090/api/beta
   - `token`: Your JWT token
   - `admin_token`: Admin JWT token

3. Test workflow:
   - POST new feedback as regular user
   - GET stats as admin
   - PATCH feedback status as admin
   - Filter feedback by criteria as admin
   - Export feedback to CSV as admin

## Rate Limiting
Currently no rate limiting is implemented. Consider adding rate limiting for production deployment:
- Feedback submission: 10 requests per hour per user
- Admin operations: 100 requests per hour per admin

## Future Enhancements
- Webhook notifications when feedback is submitted
- Email notifications to admins for high-priority feedback
- Automatic categorization using ML models
- Sentiment analysis on feedback descriptions
- Timeline visualization for tracking resolution progress
- Feedback duplicate detection
- User feedback voting/trending system
