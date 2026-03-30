# 🚀 Gym Management System — Startup Command Center

> **System Status**: Ready
> **Database**: Oracle SQL
> **Backend**: Spring Boot (Port 8081)
> **Frontend**: React (Ports 5173-5175)

---

setting page erro solver : copilot --resume=ec6f12e7-0cb0-44ad-97f2-7e9d2b748e71

dashbord page creater : copilot --resume=9e11587f-967c-46e8-8b39-e47f49cd3d66

ui ux - copilot --resume=83ecae34-a70f-4e46-a436-f0bd8366d089

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

## 🌐 Public URL Setup (Cloudflare Tunnels)

# Terminal 1 - Backend

cd backend && mvn spring-boot:run

# Terminal 2 - Frontend (single instance)

cd frontend && npm run dev

# Terminal 3 - Frontend tunnel (for public access)

cloudflared tunnel --url http://localhost:5173

```
Use THIS URL to access your app publicly.

---

That's it! Any random Cloudflare tunnel URL will work automatically.

## 🔑 Access Credentials

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin` | `Aryan@194` | `AryanFit3@gmail.com` |
| 🔑 **Owner** | `owner` | `pass2233` | `owner@fitpro.com` |
| 🏋️ **Trainer** | `john.smith` | `password12` | `john.smith@fitpro.com` |
| 🏋️ **Trainer** | `sarah.jones` | `Sarah@fit123` | `sarah.jones@fitpro.com` |
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
```
