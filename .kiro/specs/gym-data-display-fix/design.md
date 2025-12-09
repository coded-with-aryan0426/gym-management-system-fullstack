# Design Document - Gym Management Data Display Fix

## Overview

This design addresses the data flow issue where the frontend cannot display data from the backend despite the database containing valid records. The solution involves verifying and fixing three critical components: backend connectivity, database queries, and frontend API integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  Dashboard.jsx → api.js → HTTP Requests                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/CORS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Spring Boot on :8080)                 │
│  StatsController, UserController → UserService              │
└────────────────────────┬────────────────────────────────────┘
                         │ JDBC
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Oracle Database (localhost:1521:xe)                 │
│  users, roles, user_role_map, trainer_customer_map          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

1. **StatsController** (`/api/stats`)
   - Endpoint: `GET /api/stats`
   - Returns: `{ owners: int, trainers: int, staff: int, customers: int }`
   - Uses: `UserRepository.findByRoleName()`

2. **UserController** (`/api/users`)
   - Endpoint: `GET /api/users?role=ROLE_NAME`
   - Returns: `List<User>` with userId, username, fullName, email
   - Uses: `UserService.getUsersByRole()`

3. **UserService**
   - Method: `getUsersByRole(String roleName)`
   - Calls: `UserRepository.findByRoleName(roleName)`

4. **UserRepository**
   - Query: `SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName`
   - Returns: List of User objects with matching roles

### Frontend Components

1. **Dashboard.jsx**
   - Loads stats on mount via `loadStats()`
   - Displays stat cards for each role
   - Fetches user lists when stat cards are clicked
   - Displays user details when users are selected

2. **api.js**
   - `fetchStats()`: GET `/api/stats`
   - `fetchUsersByRole(role)`: GET `/api/users?role={role}`
   - `fetchUserCustomers(userId)`: GET `/api/users/{userId}/customers`

## Data Models

### User Entity
```
{
  userId: Long,
  username: String,
  password: String,
  fullName: String,
  email: String,
  createdAt: LocalDateTime,
  roles: Set<Role>,
  customers: Set<User>,
  trainers: Set<User>
}
```

### Role Entity
```
{
  roleId: Long,
  roleName: String (OWNER, TRAINER, STAFF, CUSTOMER)
}
```

### Stats Response
```
{
  owners: Integer,
  trainers: Integer,
  staff: Integer,
  customers: Integer
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Stats Endpoint Returns Valid Counts
*For any* valid database state, the `/api/stats` endpoint should return a JSON object with non-negative integer counts for all four roles (owners, trainers, staff, customers).

**Validates: Requirements 1.2**

### Property 2: User List Filtering by Role
*For any* role name (OWNER, TRAINER, STAFF, CUSTOMER), the `/api/users?role={role}` endpoint should return only users that have that specific role assigned in the database.

**Validates: Requirements 1.3, 2.3**

### Property 3: User Data Completeness
*For any* user returned from the API, the response should include all required fields: userId, username, fullName, and email.

**Validates: Requirements 2.4**

### Property 4: Database Connection Persistence
*For any* backend startup, the application should successfully establish and maintain a connection to the Oracle database throughout its runtime.

**Validates: Requirements 3.1**

### Property 5: Role Mapping Consistency
*For any* user in the database, querying by their assigned role should return that user in the results.

**Validates: Requirements 3.2, 3.4**

## Error Handling

1. **Database Connection Failures**
   - Log connection errors with details
   - Provide clear error messages in application startup
   - Verify Oracle JDBC driver is available

2. **Query Failures**
   - Handle null results gracefully
   - Return empty lists instead of null
   - Log SQL errors for debugging

3. **API Response Errors**
   - Return appropriate HTTP status codes (200, 400, 500)
   - Include error messages in response body
   - Handle CORS preflight requests

4. **Frontend API Errors**
   - Catch fetch errors and log to console
   - Display user-friendly error messages
   - Provide fallback UI states

## Testing Strategy

### Unit Testing
- Test `UserRepository.findByRoleName()` with various role names
- Test `StatsController.getStats()` returns correct counts
- Test `UserService.getUsersByRole()` filters correctly
- Test API endpoints return proper JSON structure

### Property-Based Testing
- **Property 1**: Generate random database states and verify stats endpoint returns valid counts
- **Property 2**: Generate random role assignments and verify filtering works correctly
- **Property 3**: Verify all returned users have complete data
- **Property 4**: Verify database connection remains stable across multiple requests
- **Property 5**: Generate random user-role mappings and verify consistency

### Integration Testing
- Test full flow: Frontend → Backend → Database → Response
- Verify CORS headers are present in responses
- Test with actual Oracle database connection

