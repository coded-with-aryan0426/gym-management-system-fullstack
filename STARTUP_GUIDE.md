# 🚀 Gym Management System — Startup Command Center

> **System Status**: Ready
> **Database**: Oracle SQL
> **Backend**: Spring Boot (Port 8081)
> **Frontend**: React (Ports 5173-5175)

---

## ⚡️ Quick Start Sequence

### 1. Database Initialization
Ensure your Oracle container is running via Colima/Docker.
```bash
colima start
docker start oracle-db
```

### 2. Backend Server (Port 8081)
Start the Spring Boot API.
```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend Client (Multi-Role)
Start the development server for all portals.
```bash
cd frontend
npm run dev:all
```
- **👑 Owner Portal**: [http://localhost:5173](http://localhost:5173)
- **🏋️ Trainer Portal**: [http://localhost:5174](http://localhost:5174)
- **🧑 Member Portal**: [http://localhost:5175](http://localhost:5175)

---

## 🔑 Access Credentials

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin` | `Aryan@194` | `AryanFit3@gmail.com` |
| 🔑 **Owner** | `owner` | `pass2233` | `owner@fitpro.com` |
| 🏋️ **Trainer** | `john.smith` | `password12` | `john.smith@fitpro.com` |
| 🏋️ **Trainer** | `sarah.jones` | `password123` | `sarah.jones@fitpro.com` |
| 🧑 **Member** | `member1` | `password123` | `member1@email.com` |
| 🧑 **Member** | `jane.doe` | `password123` | `jane.doe@email.com` |

## 📂 Project Organization Map

We have reorganized the project for better discoverability.

### 🧠 Documentation (`/documentation`)
- **Plans**: Feature PRDs, implementation plans (`/documentation/plans`)
- **Architecture**: Database schemas, system diagrams (`/documentation/architecture`)
- **Guides**: Setup guides, audit reports (`/documentation/guides`)
- **Career**: Interview preparation materials (`/documentation/career`)

### ⚙️ Operations (`/ops`)
- **Scripts**: Utility shell scripts (`/ops/scripts`)
- **Logs**: System and error logs (`/ops/logs`)

### 💻 Source Code
- **`/backend`**: Java Spring Boot Application
- **`/frontend`**: React + TypeScript Application
- **`/database`**: SQL Migrations & Seeds

---

## 🛑 Troubleshooting

**Ports Blocked?**
If you see "Address already in use", run this command to clear the ports:
```bash
lsof -ti :8081,5173,5174,5175 | xargs kill -9
```

**Database Connection Failed?**
- Check if `colima` is running (`colima status`).
- Verify connection string in `backend/src/main/resources/application.properties`.
