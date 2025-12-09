# Gym Management Frontend

React + TypeScript frontend for the Gym Management System.

## Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:8080`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (optional):
Edit `.env` file to change the backend URL:
```
VITE_API_URL=http://localhost:8080/api
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

## Testing

Run tests:
```bash
npm run test
```

## Features

- **Dashboard**: View summary of Owners, Trainers, Staff, and Customers
- **Staff Page**: Manage staff members with search and add functionality
- **Members Page**: Manage gym members with search and add functionality
- **Settings Page**: Configure gym settings, profile, notifications, and billing

## Backend Integration

The frontend connects to the Spring Boot backend at `/api/users` endpoint.

### API Endpoints Used:
- `GET /api/users?role=OWNER` - Get owners
- `GET /api/users?role=TRAINER` - Get trainers
- `GET /api/users?role=STAFF` - Get staff
- `GET /api/users?role=CUSTOMER` - Get customers
- `POST /api/users` - Create new user

### User Data Structure:
```typescript
{
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roles: [{ roleId: number; roleName: string }];
}
```

## Mock Data

If the backend is not available, the app will automatically use mock data for demonstration purposes.

## Tech Stack

- React 19
- TypeScript
- React Router 7
- Axios
- Vite
- Vitest + React Testing Library
