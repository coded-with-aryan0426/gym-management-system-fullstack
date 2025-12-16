# Gym Management System - Startup Guide

## Quick Start (After System Shutdown)

Run these commands in order:

### Step 1: Start Docker Engine (Colima)
```bash
colima start
```
Wait for "done" message (~30 seconds).

---

### Step 2: Start Oracle Database
```bash
docker start oracle-db
```
Wait ~30 seconds for the database to initialize.

**Verify database is ready (optional):**
```bash
docker logs oracle-db 2>&1 | grep "DATABASE IS READY"
```

---

### Step 3: Start Backend (Spring Boot)
```bash
cd /Users/aryan/Intership/backend
mvn spring-boot:run
```
Wait for: `Started GymManagementApplication in X seconds`

Backend runs on: **http://localhost:8080**

---

### Step 4: Start Frontend (Vite/React)
```bash
cd /Users/aryan/Intership/frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## Shutdown Commands

| Service | Stop Command |
|---------|--------------|
| Frontend | `Ctrl+C` in terminal |
| Backend | `Ctrl+C` in terminal |
| Database | `docker stop oracle-db` |
| Docker/Colima | `colima stop` |

---

## Troubleshooting

### Database won't start
```bash
# Check if Colima is running
colima status

# If not running, start it
colima start
```

### Backend shows "Connection refused"
```bash
# Wait for database to be ready
docker logs oracle-db 2>&1 | tail -5

# Should show: DATABASE IS READY TO USE!
```

### Port already in use (8080 or 5173)
```bash
# Find and kill process using port 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Same for port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```
