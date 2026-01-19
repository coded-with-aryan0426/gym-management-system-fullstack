# 🚀 Gym Management System - Startup Command Center

## ⚡️ Quick Start Sequence (Copy & Paste these blocks)

### 1. Start Database (Wait 30s)
```bash
colima start
docker start oracle-db
```

### 2. Start Backend (Runs on 8081)
```bash
cd /Users/aryan/Intership/backend
mvn spring-boot:run
```

### 3. Start Frontend (Multi-Port Mode)
```bash
cd /Users/aryan/Intership/frontend
npm run dev:all
```
- **Owner**: http://localhost:5173
- **Trainer**: http://localhost:5174
- **Member**: http://localhost:5175

---

## 🔑 Login Credentials (Double-click to copy)

### 👑 Owner (Port 5173)
```text
aryansuthar5038@gmail.com
Aryan@5038
```

### 🏋️ Trainer (Port 5174)
```text
darshon11@gmail.com
Darshon@11
```

### 🧑 Member (Port 5175)
```text
rishi97@gmial.com
rishi9700
```

### 🧪 Test Owner (Alternative)
```text
new.owner@gym.com
password123
```

---

## 🛑 Emergency Stop & Fix Ports
**If ports are blocked, run this to kill everything:**
```bash
# Kill processes on 8081 (Backend) and 5173-5175 (Frontend)
lsof -ti :8081,5173,5174,5175 | xargs kill -9
```

## 📝 Shutdown
- **Frontend/Backend**: `Ctrl+C` in their terminals
- **Database/Colima**: `docker stop oracle-db && colima stop`

