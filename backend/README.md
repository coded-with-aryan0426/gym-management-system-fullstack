# AthlonX Backend

Spring Boot backend for the AthlonX Gym Management System.

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Oracle Database (or configured H2 for development)

### Running the Application

```bash
# Default profile (dev)
./mvnw spring-boot:run

# With specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=beta
./mvnw spring-boot:run -Dspring-boot.run.profiles=staging

# Or using environment variable
export SPRING_PROFILES_ACTIVE=beta
./mvnw spring-boot:run
```

## Available Profiles

| Profile   | Description                                      | JWT Expiration |
|-----------|--------------------------------------------------|----------------|
| `dev`     | Local development with debug logging             | 24 hours       |
| `beta`    | Beta testing with extended sessions              | 8 hours        |
| `staging` | Pre-production with full debug logging           | 24 hours       |

### Profile Configuration

Each profile has its own properties file in `src/main/resources/`:
- `application.properties` - Base configuration
- `application-dev.properties` - Development settings
- `application-beta.properties` - Beta testing settings
- `application-staging.properties` - Staging environment settings

## Database Migrations

This project uses **Flyway** for database migrations. Migration files are located in:
```
src/main/resources/db/migration/
```

### Migration Naming Convention
```
V{version}__{description}.sql
```

Example: `V22__add_feature_flags.sql`

### Running Migrations
Migrations run automatically on application startup. To run manually:

```bash
./mvnw flyway:migrate
```

### Current Migrations Include:
- User and gym tables (V1-V8)
- Role-based access control (V9)
- Member settings and profiles (V10-V11)
- Membership packages (V12-V14)
- Audit logging (V15-V16)
- Chat functionality (V19-V20)
- Feature flags (V22)
- Beta feedback collection

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing (min 256 bits) | Development default |
| `JWT_EXPIRATION` | JWT token expiration in seconds | 86400 (24h) |

### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:oracle:thin:@//localhost:1521/FREE` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `system` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - |

### Beta Profile Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BETA_DB_URL` | Beta database URL | - |
| `BETA_DB_USERNAME` | Beta database username | `gym_beta` |
| `BETA_DB_PASSWORD` | Beta database password | - |

### Staging Profile Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STAGING_DB_URL` | Staging database URL | - |
| `STAGING_DB_USERNAME` | Staging database username | `gym_staging` |
| `STAGING_DB_PASSWORD` | Staging database password | - |

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/public/**` - Public resources

### Feature Flags (Authenticated)
- `GET /api/features/{key}` - Get feature flag status
- `GET /api/features/all` - Get all flags for current user
- `PUT /api/features/{key}` - Update flag (ADMIN only)

### Beta Feedback
- `POST /api/beta/feedback` - Submit feedback (authenticated)
- `GET /api/beta/feedback` - List all feedback (ADMIN only)
- `PATCH /api/beta/feedback/{id}/status` - Update status (ADMIN only)
- `GET /api/beta/feedback/stats` - Get statistics (ADMIN only)
- `GET /api/beta/feedback/export` - Export to CSV (ADMIN only)

## CORS Configuration

The application supports the following origins:
- `http://localhost:*` - Local development
- `https://*.trycloudflare.com` - Cloudflare tunnels
- `https://*.vercel.app` - Vercel deployments
- `https://*.railway.app` - Railway deployments
- `https://*.up.railway.app` - Railway deployments (alternate)
- `https://*.onrender.com` - Render deployments
- `https://*.netlify.app` - Netlify deployments

## Building for Production

```bash
# Build JAR
./mvnw clean package -DskipTests

# Run JAR
java -jar target/gym-management-*.jar --spring.profiles.active=beta
```

## Docker

```bash
# Build image
docker build -t athlonx-backend .

# Run container
docker run -p 8081:8081 \
  -e SPRING_PROFILES_ACTIVE=beta \
  -e JWT_SECRET=your-production-secret \
  -e BETA_DB_URL=jdbc:oracle:thin:@//host:1521/SERVICE \
  athlonx-backend
```

## Security Notes

- Never commit secrets to version control
- Use environment variables for all sensitive configuration
- JWT secrets must be at least 256 bits for security
- All endpoints except public ones require authentication
- CORS is configured to only allow specific origins

## Troubleshooting

### Migration Conflicts
If Flyway reports checksum mismatches:
```bash
./mvnw flyway:repair
./mvnw flyway:migrate
```

### CORS Issues
Ensure your frontend origin matches one of the allowed patterns. For development tunnels, use Cloudflare Quick Tunnels which are automatically supported.

### JWT Token Expired
Beta profile uses 8-hour tokens. For longer sessions, use the dev profile or configure `JWT_EXPIRATION` environment variable.
