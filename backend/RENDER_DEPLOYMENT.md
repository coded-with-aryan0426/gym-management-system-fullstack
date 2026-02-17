# Render Deployment Guide for AthlonX Backend

This guide outlines the steps to deploy the AthlonX Gym Management System backend to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A PostgreSQL database (Neon, Render PostgreSQL, or another provider)
3. This repository pushed to GitHub/GitLab

## Database Setup

### Option 1: Neon PostgreSQL (Recommended for Serverless)

1. Create a free account at https://neon.tech
2. Create a new project and database
3. Copy the connection string (it will look like: `postgresql://user:password@host:5432/neondb`)
4. Note down the connection details

### Option 2: Render PostgreSQL

1. In your Render dashboard, create a new PostgreSQL database
2. Note down the connection details from the database dashboard

## Backend Deployment on Render

### Step 1: Create a New Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub/GitLab repository
4. Configure the service:
   - **Name**: `athlonx-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/management-0.0.1-SNAPSHOT.war`

### Step 2: Configure Environment Variables

In the Render dashboard, go to your service → Environment tab and add:

#### Database Configuration
```
DATABASE_URL=jdbc:postgresql://your-db-host:5432/your-db-name?sslmode=require
DATABASE_USERNAME=your-db-username
DATABASE_PASSWORD=your-db-password
```

#### JWT Secret (IMPORTANT: Generate a secure 64-character string)
```
JWT_SECRET=your-secure-64-character-random-string-here-keep-it-secret
```

**⚠️ Security Note**: Never use the default JWT secret in production! Generate a secure random 64-character string using:
```bash
openssl rand -hex 32
```

#### Optional: OAuth Configuration (if using social login)
```
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

#### Optional: Twilio Configuration (if using SMS/WhatsApp OTP)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

### Step 3: Configure Health Check

In the Render dashboard:
1. Go to Settings → Health Check
2. Set Health Check Path: `/api/public/health` (or your health endpoint)

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the logs for any errors
4. Once deployed, note your service URL (e.g., `https://your-app.onrender.com`)

## Frontend CORS Configuration

The backend is already configured to allow CORS from:
- Local development ports (5173, 5174, 5175, 3000)
- Production Vercel frontend: `https://trae8sbvnyxu.vercel.app`

If you deploy to a different frontend URL, update the CORS configuration in:
`src/main/java/com/gym/management/security/SecurityConfig.java`

## Database Schema Initialization

The application uses Hibernate with `ddl-auto=update` to automatically create/update the database schema on startup.

### Manual Schema Setup (Optional)

If you prefer to use Flyway migrations:
1. Set `spring.flyway.enabled=true` in `application.properties`
2. Create migration files in `src/main/resources/db/migration/`
3. Redeploy the application

## Monitoring and Logs

1. **View Logs**: Go to your service in Render → Logs tab
2. **Metrics**: Monitor CPU, memory, and response times in the Metrics tab
3. **Events**: Check deployment history and events in the Events tab

## Troubleshooting

### Build Fails
- Ensure Maven is properly configured
- Check that all dependencies are available
- Review build logs for specific errors

### Connection Timeout
- Verify database connection string includes `?sslmode=require` for SSL connections
- Check database credentials
- Ensure database allows connections from Render's IP ranges

### JWT Token Errors
- Verify JWT_SECRET is exactly 64 characters
- Check that JWT_SECRET environment variable is set

### CORS Errors
- Verify frontend URL is added to allowed origins in SecurityConfig.java
- Ensure HTTPS is used for production frontend

## Production Checklist

Before going live:
- [ ] Set a secure JWT_SECRET (64 characters, random)
- [ ] Configure production database with backups
- [ ] Set up proper OAuth credentials (if using)
- [ ] Configure email SMTP settings for production
- [ ] Set up monitoring and alerts
- [ ] Review and update CORS allowed origins
- [ ] Enable HTTPS (Render provides this automatically)
- [ ] Configure custom domain (optional)
- [ ] Set up database backups
- [ ] Review security settings and rate limiting

## Scaling

Render automatically scales your application based on traffic. To configure:
1. Go to Settings → Scaling
2. Adjust instance type and auto-scaling rules as needed

## Support

For issues specific to:
- **Render Platform**: https://render.com/docs
- **PostgreSQL/Neon**: Check respective documentation
- **Application Issues**: Review application logs and error messages
