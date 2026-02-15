# Deployment & Go-Live Plan
## From Local Oracle to Cloud — Free/Low-Cost Options

---

## Current State

| Component | Current | Problem |
|-----------|---------|---------|
| **Backend** | Spring Boot 3.x, Java 17 | Runs on `localhost:8081` |
| **Database** | Oracle XE on `localhost:1521/FREE` | Oracle is expensive, heavy, not cloud-friendly |
| **Frontend** | Vite + React + TypeScript | No production build config, no Dockerfile |
| **Storage** | Local filesystem `/Users/aryan/Intership/backend/uploads` | Hardcoded absolute path, no cloud storage |
| **Email** | `user@example.com` placeholder | Non-functional |
| **Containerization** | Backend Dockerfile exists | No docker-compose, no frontend Dockerfile |
| **CI/CD** | None | No GitHub Actions, no automated testing/deployment |
| **Monitoring** | None | No health checks, no error tracking, no logging service |
| **SSL/HTTPS** | None | Required for production |
| **Domain** | None | Need custom domain or subdomain |

---

## Free/Low-Cost Cloud Platforms Comparison

### Option 1: Railway.app (RECOMMENDED for MVP)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Backend** | ✅ $5/month credit | Spring Boot JAR deployment, auto-scale |
| **Database** | ✅ PostgreSQL included | 1GB free, auto-managed, backups |
| **Frontend** | ✅ Static site hosting | Vite build served via CDN |
| **Redis** | ✅ Available as plugin | For caching, WebSocket pub/sub |
| **Storage** | ❌ Use Cloudinary free | 25GB/month free for file uploads |

**Total estimated cost:** $0-5/month for small scale, ~$20/month for 500 gyms

### Option 2: Render.com

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Backend** | ✅ Free web service | Cold starts (spins down after 15min idle) |
| **Database** | ✅ PostgreSQL 256MB free | Limited but good for start |
| **Frontend** | ✅ Static site free | CDN-backed |
| **Redis** | ✅ 25MB free | Limited |

**Total estimated cost:** $0/month for start, $7/month per service to remove cold starts

### Option 3: Vercel (Frontend) + Railway (Backend)

| Service | Platform | Free Tier |
|---------|----------|-----------|
| **Frontend** | Vercel | ✅ Unlimited static/SSR, 100GB bandwidth |
| **Backend** | Railway | ✅ $5/month credit |
| **Database** | Railway PostgreSQL | ✅ 1GB free |
| **Storage** | Cloudinary | ✅ 25GB/month |

### Option 4: Oracle Cloud Free Tier (Keep Oracle DB)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Backend** | ✅ 2 ARM VMs (4 OCPU, 24GB RAM) ALWAYS FREE | Very generous |
| **Database** | ✅ 2 Oracle Autonomous DBs (20GB each) ALWAYS FREE | Keep Oracle, no migration needed |
| **Storage** | ✅ 10GB Object Storage ALWAYS FREE | Good for file uploads |
| **Load Balancer** | ✅ 1 ALWAYS FREE | HTTPS termination |

**Best if you want to keep Oracle DB and have powerful servers for free.**

---

## Recommended Architecture: Option 1 (Railway) for Quick Launch

```
                    ┌──────────────┐
                    │   Cloudflare │  ← DNS + CDN + SSL
                    │   (Free)     │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐    ┌──────────▼──────────┐
     │  Vercel/Railway  │    │  Railway Backend     │
     │  Frontend (React)│    │  Spring Boot JAR     │
     │  Static Build    │    │  port 8081           │
     └─────────────────┘    └──────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
          ┌─────────▼─────┐  ┌────────▼─────┐  ┌───────▼──────┐
          │  PostgreSQL    │  │   Redis      │  │  Cloudinary  │
          │  (Railway)     │  │   (Railway)  │  │  (File Store)│
          │  Primary DB    │  │   Cache +    │  │  25GB free   │
          └───────────────┘  │   WebSocket  │  └──────────────┘
                              └─────────────┘
```

---

## Step-by-Step Go-Live Checklist

### Phase 1: Database Migration (Oracle → PostgreSQL)
See `DATABASE_MIGRATION_AND_SCALING.md` for detailed migration plan.

### Phase 2: Backend Production Readiness
```
[ ] Create application-prod.properties
    ├── Database URL from environment variable
    ├── JWT secret from environment variable
    ├── CORS allowed origins = production domain
    ├── spring.jpa.show-sql=false
    ├── spring.jpa.hibernate.ddl-auto=validate (NOT update!)
    ├── Proper email config (SendGrid/Mailgun free tier)
    ├── Upload directory = cloud storage path
    └── Logging level = WARN for production

[ ] Environment Variables Setup
    ├── DATABASE_URL
    ├── JWT_SECRET (generate strong 256-bit key)
    ├── SMTP_HOST, SMTP_USER, SMTP_PASS
    ├── CLOUDINARY_URL (or S3 equivalent)
    ├── REDIS_URL
    ├── CORS_ORIGINS
    ├── SPRING_PROFILES_ACTIVE=prod
    └── APP_BASE_URL

[ ] Fix hardcoded values
    ├── Upload dir: /Users/aryan/... → env variable
    ├── CORS: localhost:5173 → production domain
    ├── Email: user@example.com → real SMTP
    └── Password seeds: 'pass123' → bcrypt hashed

[ ] Security hardening
    ├── Remove all seed data from production
    ├── Disable actuator endpoints or secure them
    ├── Enable HTTPS-only cookies
    ├── Set strict CORS policy
    ├── Rate limiting per IP AND per user
    └── Helmet-equivalent security headers
```

### Phase 3: Frontend Production Build
```
[ ] Create frontend Dockerfile
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    
    FROM nginx:alpine
    COPY --from=builder /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf

[ ] Create nginx.conf for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

[ ] Environment-based API URL
    ├── Create .env.production with VITE_API_URL=https://api.yourdomain.com
    └── Ensure all API calls use this variable

[ ] Build optimization
    ├── Enable code splitting
    ├── Compress images
    ├── Tree shake unused imports
    ├── Enable gzip/brotli compression
    └── Set appropriate cache headers
```

### Phase 4: Docker Compose for Full Stack
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8081:8081"
    environment:
      - DATABASE_URL=jdbc:postgresql://db:5432/gymdb
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=gymdb
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Phase 5: CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Backend Tests
        run: cd backend && mvn test
      - name: Frontend Tests
        run: cd frontend && npm ci && npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Backend
        uses: railwayapp/deploy-action@v1
        with:
          service: backend
      - name: Deploy Frontend
        uses: railwayapp/deploy-action@v1
        with:
          service: frontend
```

### Phase 6: Monitoring & Observability
```
Free tools:
├── Sentry.io (free tier)      — Error tracking for backend + frontend
├── UptimeRobot (free)         — Uptime monitoring, alerts
├── Railway built-in logs      — Application logs
├── Cloudflare Analytics (free)— Traffic analytics
└── Spring Boot Actuator       — Health checks (secure them!)
```

---

## DNS & Domain Setup

```
1. Buy domain: yourgymapp.com (~$10/year)
2. Set up Cloudflare (free):
   ├── A record: api.yourgymapp.com → Railway backend IP
   ├── CNAME: yourgymapp.com → Vercel/Railway frontend
   └── Enable: SSL (Full), Auto HTTPS, CDN caching

Alternative (free subdomain):
   ├── yourapp.railway.app (auto-generated)
   └── yourapp.vercel.app (auto-generated)
```

---

## Cost Summary for Go-Live

| Service | Cost | Notes |
|---------|------|-------|
| Railway (backend + DB) | $5-20/month | Depends on traffic |
| Vercel (frontend) | $0/month | Free tier generous |
| Cloudflare (DNS + CDN) | $0/month | Always free |
| Cloudinary (file storage) | $0/month | 25GB/month free |
| SendGrid (email) | $0/month | 100 emails/day free |
| Sentry (error tracking) | $0/month | 5K events/month free |
| UptimeRobot (monitoring) | $0/month | 50 monitors free |
| Domain name | $10/year | Optional |
| **TOTAL** | **$5-30/month** | **Enterprise-grade for near-free** |

---

## Alternative: Oracle Cloud Always Free (₹0/month permanently)

If keeping Oracle DB is preferred:
- 2 ARM VMs with 24GB RAM — plenty for backend
- 2 Autonomous Oracle DBs with 20GB each — no migration needed
- 10GB Object Storage — for file uploads
- 1 Load Balancer with SSL — HTTPS termination
- **Total cost: ₹0 forever** (Oracle's Always Free tier is permanent)

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Database migration (Oracle → PostgreSQL), application-prod.properties |
| **Phase 2** | Frontend Dockerfile, nginx.conf, environment variables |
| **Phase 3** | Docker-compose, test locally with production config |
| **Phase 4** | Deploy to Railway/Render, set up domain + SSL |
| **Phase 5** | CI/CD pipeline, monitoring, error tracking |
| **Phase 6** | Load testing, performance optimization, CDN caching |
