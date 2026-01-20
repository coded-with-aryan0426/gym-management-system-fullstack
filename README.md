# AthlonX V2 — The Future of Gym Management 🚀

> **A Premium, High-Performance, Full-Stack Gym Management System.**
> Built for the modern fitness industry with a focus on **Visual Excellence**, **Operational Efficiency**, and **Data-Driven Insights**.

---

## 🌟 What's New in V2?

V2 represents a complete reimagining of the user experience and codebase stability.

### 🎨 Premium UI/UX Overhaul
- **Dark Mode First**: sleek, "midnight" aesthetic using minimal grays (`#121212`, `#1A1A1A`) and high-contrast accents.
- **Glassmorphism**: Subtle layout layers, blurs, and translucent containers for a futuristic feel.
- **Fluid Animations**: Page transitions, hover effects, and micro-interactions powered by CSS and Framer Motion.
- **Responsive Design**: optimized for desktop, tablet, and mobile interfaces.

### 🛠 Advanced Equipment Management
The **Equipment Module** has been completely re-engineered:
- **3D Interactive Icons**: Visual inventory management with high-fidelity assets.
- **Smart Maintenance Panel**: 
    - **Analysis Tab**: Real-time TCO (Total Cost of Ownership), Health Scores (visualized with SVG rings), and MTBF (Mean Time Between Failures) metrics.
    - **Interactive Schedule**: A premium `BigCalendar` implementation for drag-and-drop maintenance scheduling.
    - **History Tracking**: Detailed logs with cost breakdown and technician assignments.

### 🔐 Robust Role-Based Security
- **Secure Authentication**: JWT-based stateless authentication.
- **Granular Permissions**: Distinct portals for **Gym Owners**, **Trainers**, and **Members**.
- **Data Isolation**: Multi-tenant architecture ensuring data privacy across different gym branches (future-ready).

---

## 🏗 Tech Stack

### Frontend (Client)
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (Custom "Premium" Config)
- **Charts/Data**: Recharts (Customized for Dark Mode)
- **Calendar**: React-Big-Calendar
- **Icons**: Lucide React + Custom SVG Assets
- **State Management**: React Context + Hooks

### Backend (Server)
- **Core**: Java Spring Boot 3+
- **Database**: PostgreSQL (Relational Data Integrity)
- **Security**: Spring Security + JWT
- **Migration**: Flyway (Database Version Control)
- **Build Tool**: Maven

---

## 🚀 Getting Started

Follow these instructions to get the V2 ecosystem running locally.

### Prerequisites
- Node.js (v18+)
- Java JDK 17+
- PostgreSQL (Running locally on port 5432)
- Maven

### 1. Database Setup
Ensure your PostgreSQL instance is running and create the database:
```sql
CREATE DATABASE gym_management;
```
*Note: Flyway will automatically handle table creation and data seeding on first run.*

### 2. Backend Startup
Navigate to the backend directory and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```
*The server will start on `http://localhost:8080`.*

### 3. Frontend Startup
Open a new terminal, navigate to the frontend directory, and start the development server:
```bash
cd frontend
npm install  # Install dependencies (only first time)
npm run dev
```
*The client will launch on `http://localhost:5173`.*

---

## 📂 Project Structure

```bash
/
├── backend/                 # Spring Boot Server
│   ├── src/main/java/       # Controllers, Services, Models
│   └── src/main/resources/  # Config & Migrations (V1...V17)
├── frontend/                # React Client
│   ├── src/components/      # Reusable UI Components
│   ├── src/pages/           # core Feature Pages (Equipment, Members, etc.)
│   └── src/services/        # API Integration Layers
├── documentation/           # Architectural Docs & Plans
└── README.md                # This file
```

---

## 🎯 Key Workflows & Features

### For Owners
- **Financial Dashboard**: Income/Expense tracking with trend analysis.
- **Equipment Oversight**: Monitor fleet health, schedule repairs, and track ROI.
- **Staff Management**: Assign trainers, monitor performance, and manage payroll.

### For Trainers
- **Client Roster**: Track assigned members and their progress.
- **Schedule Management**: Manage personal agenda and class bookings.
- **Performance**: View retention stats and member feedback.

### For Members
- **Class Booking**: Seamlessly book spots in available classes.
- **Workout Tracking**: Log progress and view trainer assignments.
- **Profile**: Manage subscription and personal details.

---

## 🤝 Contribution & Versioning

This project follows **Semantic Versioning**. 
- **Current Branch**: `v2` (Stable / Production Ready candidate)
- **Main**: Legacy / Stable V1

### Latest Update: 
**Feature**: Equipment Maintenance Overhaul
**Commit Type**: `feat`
**Description**: Added Analysis tab with Health Ring visualizations, Cost/Reliability metrics, and fixed scheduling UI.

---

> Built with ❤️ by **CodeWithAryan** & **Antigravity**
