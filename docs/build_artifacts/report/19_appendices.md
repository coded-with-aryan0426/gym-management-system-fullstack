# Appendices

## Appendix A: System Installation Guide {.unnumbered}

### A.1 Prerequisites

The following tools must be installed before setting up the Gym Management System locally:

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Node.js | 18.x | Frontend runtime |
| npm | 9.x | Package manager |
| Java JDK | 17+ | Backend runtime |
| Maven | 3.8+ | Java build tool |
| Oracle Database | 19c+ | Primary data store |
| Git | 2.x | Version control |

### A.2 Frontend Setup

```bash
# Clone repository
git clone https://github.com/coded-with-aryan0426/gym-management-system-fullstack.git
cd gym-management-system-fullstack/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API base URL

# Start development server
npm run dev
```

The frontend development server starts on `http://localhost:5173` by default.

### A.3 Backend Setup

```bash
# Navigate to backend directory
cd gym-management-system-fullstack/backend

# Configure database connection in application.properties
# spring.datasource.url=jdbc:oracle:thin:@localhost:1521:orcl
# spring.datasource.username=YOUR_DB_USERNAME
# spring.datasource.password=YOUR_DB_PASSWORD

# Build and run
./mvnw spring-boot:run
```

The backend API server starts on `http://localhost:8080` by default.

### A.4 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080/api` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:8080/ws` |
| `spring.datasource.url` | JDBC connection string | `jdbc:oracle:thin:@...` |
| `jwt.secret` | JWT signing secret (min 256-bit) | `[secure-random-string]` |
| `spring.mail.host` | SMTP host for email OTP | `smtp.gmail.com` |

---

## Appendix B: Database Schema Reference {.unnumbered}

### B.1 Core Tables Summary

| Table Name | Primary Key | Description |
|------------|-------------|-------------|
| `users` | `user_id` | All user accounts across roles |
| `roles` | `role_id` | Role definitions (MEMBER, TRAINER, OWNER, ADMIN) |
| `gyms` | `gym_id` | Gym tenant records |
| `memberships` | `membership_id` | Active and historical memberships |
| `membership_packages` | `package_id` | Configured membership packages |
| `pt_sessions` | `session_id` | Personal training session bookings |
| `trainer_details` | `trainer_id` | Trainer profile extensions |
| `conversations` | `conversation_id` | Chat conversation threads |
| `messages` | `message_id` | Individual chat messages |
| `notifications` | `notification_id` | System notifications |

### B.2 Key Relationships

- Each `users` record is associated with one or more `roles` via a join table.
- Each `gym` has exactly one `owner` (foreign key to `users`).
- Each `membership` references one `membership_package` and one `user`.
- Each `pt_session` references one trainer `user`, one member `user`, and belongs to one `gym`.
- Each `conversation` contains zero or more `messages`, and involves two or more `users`.

---

## Appendix C: API Endpoints Reference {.unnumbered}

### C.1 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| POST | `/api/auth/refresh` | Refresh expired JWT |
| POST | `/api/auth/logout` | Invalidate session |
| POST | `/api/auth/verify-otp` | Verify 2FA OTP |

### C.2 Membership Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memberships/packages` | List available packages |
| POST | `/api/memberships/request` | Submit membership purchase request |
| PUT | `/api/memberships/{id}/approve` | Owner approves membership |
| PUT | `/api/memberships/{id}/reject` | Owner rejects membership |
| GET | `/api/memberships/my` | Get current member's membership |

### C.3 PT Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions/trainers` | Browse available trainers |
| POST | `/api/sessions/book` | Book a PT session |
| PUT | `/api/sessions/{id}/complete` | Mark session as complete |
| PUT | `/api/sessions/{id}/cancel` | Cancel a booked session |
| POST | `/api/sessions/{id}/rate` | Submit session rating |

---

## Appendix D: Technology Dependencies {.unnumbered}

### D.1 Frontend Dependencies (Selected)

| Package | Version | Licence |
|---------|---------|---------|
| react | 18.x | MIT |
| react-dom | 18.x | MIT |
| react-router-dom | 6.x | MIT |
| axios | 1.x | MIT |
| socket.io-client | 4.x | MIT |
| framer-motion | 10.x | MIT |
| recharts | 2.x | MIT |
| lucide-react | latest | ISC |
| typescript | 5.x | Apache-2.0 |
| vite | 5.x | MIT |

### D.2 Backend Dependencies (Selected)

| Package | Version | Licence |
|---------|---------|---------|
| spring-boot-starter-web | 3.x | Apache-2.0 |
| spring-boot-starter-security | 3.x | Apache-2.0 |
| spring-boot-starter-data-jpa | 3.x | Apache-2.0 |
| spring-boot-starter-websocket | 3.x | Apache-2.0 |
| jjwt-api | 0.11.x | Apache-2.0 |
| lombok | 1.18.x | MIT |
| ojdbc8 | 21.x | Oracle |
| spring-boot-starter-mail | 3.x | Apache-2.0 |
