# 🏋️ AthlonX Gym Management — Cloud Scaling Plan

> **Stack:** Spring Boot (Java 17) + Oracle DB + React (Vite)  
> **Primary Cloud:** Oracle Cloud Infrastructure (OCI)

---

## Architecture Overview

```
Phase 1 (Now):
  Vercel (React Frontend)
        ↓ HTTPS API calls
  Oracle Cloud VM → Spring Boot JAR (port 8080)
        ↓ JDBC
  Oracle Autonomous DB (Always Free)

Phase 2+:
  Vercel → OCI VM (Paid) → Aiven PostgreSQL
```

---

## PHASE 1 — Launch (0–5 Gyms) | ₹0/month

### Cost
| Resource | Spec | Cost |
|---|---|---|
| OCI Compute ARM A1 | 4 cores, 24 GB RAM | ₹0 |
| Oracle Autonomous DB | 20 GB | ₹0 |
| Vercel | React frontend | ₹0 |
| **Total** | | **₹0/month** |

### Capacity
- Members: up to 3,000
- Concurrent Users: ~100
- Gyms: up to 5

---

### STEP 1 — Create Oracle Cloud Account

1. Go to [cloud.oracle.com](https://cloud.oracle.com) → Click **Start for Free**
2. Fill in name, email, country → Verify email
3. Enter credit card for identity verification (**no charges on Always Free**)
4. Select **Home Region** → Choose `ap-mumbai-1` (India) for best latency
5. Account is ready in 5–10 minutes

---

### STEP 2 — Create Oracle Autonomous Database

1. In OCI Console → **Oracle Database** → **Autonomous Database**
2. Click **Create Autonomous Database**
3. Fill in:
   ```
   Display Name:    gymapp-db
   DB Name:         gymappdb
   Workload Type:   Transaction Processing (OLTP)
   Deployment:      Shared Infrastructure
   Always Free:     ✅ Toggle ON
   Password:        (set a strong password, save it)
   ```
4. Click **Create Autonomous Database** → Wait 2–3 minutes
5. Once green/Available → Click **DB Connection** → **Download Wallet**
6. Save wallet ZIP as `wallet_gymappdb.zip` — you'll need it for backend config

---

### STEP 3 — Configure Backend for Oracle Autonomous DB

**1. Unzip the wallet on your local machine:**
```bash
mkdir -p ~/oracle-wallet
unzip wallet_gymappdb.zip -d ~/oracle-wallet
```

**2. Update `backend/src/main/resources/application-prod.properties`:**
```properties
# Oracle Autonomous DB connection
spring.datasource.url=jdbc:oracle:thin:@gymappdb_high?TNS_ADMIN=/home/ubuntu/wallet
spring.datasource.username=ADMIN
spring.datasource.password=YOUR_DB_PASSWORD_HERE
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Server
server.port=8080

# JWT
jwt.secret=YOUR_JWT_SECRET_KEY_MIN_32_CHARS
jwt.expiration=86400000

# CORS — update with your Vercel domain
app.cors.allowed-origins=https://athlonx.vercel.app
```

**3. Verify `pom.xml` has Oracle JDBC dependency:**
```xml
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc11</artifactId>
    <version>23.3.0.23.09</version>
</dependency>
```

**4. Build the production JAR:**
```bash
cd backend
mvn clean package -DskipTests -Pprod
# Output: target/gym-management-0.0.1-SNAPSHOT.jar
```

---

### STEP 4 — Create Oracle Cloud VM (Compute Instance)

1. In OCI Console → **Compute** → **Instances** → **Create Instance**
2. Configure:
   ```
   Name:            gymapp-backend
   Image:           Canonical Ubuntu 22.04
   Shape:           VM.Standard.A1.Flex (Always Free)
   OCPUs:           4
   Memory:          24 GB
   ```
3. **Add SSH Key:**
   - If you don't have one: `ssh-keygen -t rsa -b 4096 -f ~/.ssh/gymapp`
   - Upload `~/.ssh/gymapp.pub`
4. Click **Create** → Wait 2 minutes → Copy the **Public IP**

---

### STEP 5 — Set Up the VM (First Time Only)

**SSH into the VM:**
```bash
ssh -i ~/.ssh/gymapp ubuntu@YOUR_VM_PUBLIC_IP
```

**Install Java 17:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-17-jdk
java -version   # Should show: openjdk 17...
```

**Upload the Oracle Wallet:**
```bash
# Run this on your LOCAL machine
scp -i ~/.ssh/gymapp -r ~/oracle-wallet ubuntu@YOUR_VM_IP:/home/ubuntu/wallet
```

**Upload the JAR:**
```bash
# Run this on your LOCAL machine
scp -i ~/.ssh/gymapp backend/target/gym-management-0.0.1-SNAPSHOT.jar ubuntu@YOUR_VM_IP:/home/ubuntu/gymapp.jar
```

---

### STEP 6 — Deploy the Backend as a Service

**On the VM — create a systemd service so it auto-restarts:**
```bash
sudo nano /etc/systemd/system/gymapp.service
```

**Paste this content:**
```ini
[Unit]
Description=AthlonX Gym Management Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/java -jar /home/ubuntu/gymapp.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/home/ubuntu/logs/gymapp.log
StandardError=append:/home/ubuntu/logs/gymapp-error.log

[Install]
WantedBy=multi-user.target
```

**Enable and start the service:**
```bash
mkdir -p /home/ubuntu/logs
sudo systemctl daemon-reload
sudo systemctl enable gymapp
sudo systemctl start gymapp
sudo systemctl status gymapp   # Should show: active (running)
```

**Check logs if something goes wrong:**
```bash
tail -f /home/ubuntu/logs/gymapp.log
```

---

### STEP 7 — Open Firewall Port on OCI

1. In OCI Console → **Networking** → **Virtual Cloud Networks**
2. Click your VCN → **Security Lists** → **Default Security List**
3. Click **Add Ingress Rules** → Add:
   ```
   Source CIDR:   0.0.0.0/0
   IP Protocol:   TCP
   Dest Port:     8080
   ```
4. Also add port `443` (HTTPS) and `80` (HTTP) for later use

**Also open port on Ubuntu UFW:**
```bash
sudo ufw allow 8080
sudo ufw allow 22
sudo ufw enable
```

**Test backend is live:**
```bash
curl http://YOUR_VM_IP:8080/api/stats
# Should return JSON, not a connection error
```

---

### STEP 8 — Deploy Frontend on Vercel

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo
3. Configure:
   ```
   Root Directory:     frontend
   Framework Preset:   Vite
   Build Command:      npm run build
   Output Directory:   dist
   ```
4. Add Environment Variable:
   ```
   VITE_API_URL = http://YOUR_VM_PUBLIC_IP:8080/api
   ```
5. Click **Deploy** → Done in ~2 minutes
6. Your app is live at `https://your-project.vercel.app`

---

### STEP 9 — (Optional) Add a Free Domain + SSL

**Get free domain at:** [Freenom](https://freenom.com) or buy `.com` at Godaddy for ₹999/year

**Add free SSL using Nginx + Certbot on the VM:**
```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/gymapp
```

```nginx
server {
    listen 80;
    server_name api.yourgymdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gymapp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Free SSL Certificate
sudo certbot --nginx -d api.yourgymdomain.com
```

**Update Vercel:** `VITE_API_URL = https://api.yourgymdomain.com/api`

---

## PHASE 2 — Growth (5–15 Gyms) | ~₹6,700/month

**When to upgrade:** Revenue consistently ≥ ₹30,000/month

### Cost
| Resource | Spec | Cost |
|---|---|---|
| OCI ARM A1 Paid | 8 cores, 48 GB RAM | ~₹3,400 |
| Aiven PostgreSQL | Startup plan | ~₹1,600 |
| Vercel Pro | Better analytics + limits | ~₹1,700 |
| **Total** | | **~₹6,700/month** |

---

### STEP 1 — Upgrade OCI Compute

1. In OCI Console → **Compute** → your VM → **Edit**
2. Change shape to `VM.Standard.A1.Flex` → Set **8 OCPUs, 48 GB RAM**
3. Confirm → VM restarts in ~2 minutes, all data preserved

---

### STEP 2 — Set Up Aiven PostgreSQL

1. Go to [aiven.io](https://aiven.io) → Sign up → **Create Service**
2. Select **PostgreSQL** → **Startup plan** → Region: `ap-south` (India)
3. Copy the connection string:
   ```
   jdbc:postgresql://HOST:PORT/defaultdb?sslmode=require
   ```

**Migrate data from Oracle to PostgreSQL:**
```bash
# 1. Export from Oracle using SQL Developer or Data Pump
# 2. Convert types in the SQL dump:
#    NUMBER(10,0)  →  BIGINT
#    VARCHAR2(255) →  VARCHAR(255)
#    CLOB          →  TEXT
#    DATE          →  TIMESTAMP
# 3. Run the converted SQL on Aiven PostgreSQL
```

**Update `application-prod.properties`:**
```properties
spring.datasource.url=jdbc:postgresql://HOST:PORT/defaultdb?sslmode=require
spring.datasource.username=avnadmin
spring.datasource.password=YOUR_AIVEN_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

**Update `pom.xml`** — replace Oracle JDBC with PostgreSQL:
```xml
<!-- Remove Oracle dependency, add PostgreSQL -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Rebuild and redeploy JAR:**
```bash
mvn clean package -DskipTests
scp target/gymapp.jar ubuntu@YOUR_VM_IP:/home/ubuntu/gymapp.jar
ssh ubuntu@YOUR_VM_IP "sudo systemctl restart gymapp"
```

---

## PHASE 3 — Scale (15–50 Gyms) | ~₹20,800/month

**When to upgrade:** Revenue ≥ ₹1,50,000/month

### Cost
| Resource | Spec | Cost |
|---|---|---|
| 2× OCI ARM A1 | 16 cores total, 96 GB RAM | ~₹6,800 |
| OCI Load Balancer | Flexible | ~₹1,700 |
| Aiven PG Business | High availability, replica | ~₹10,200 |
| OCI Object Storage | Profile photos, docs, exports | ~₹425 |
| Vercel Pro | | ~₹1,700 |
| **Total** | | **~₹20,800/month** |

---

### STEP 1 — Create Second VM

Repeat Phase 1 Steps 4–6 for a second VM with the same JAR.

### STEP 2 — Set Up OCI Load Balancer

1. OCI Console → **Networking** → **Load Balancers** → **Create**
2. Configure:
   ```
   Shape:    Flexible (10 Mbps min)
   Subnet:   Public subnet
   ```
3. Add **Backend Set** → Add both VM IPs on port `8080`
4. Set **Health Check:** `GET /api/stats` → expect HTTP 200
5. Add **Listener:** HTTP + HTTPS on ports 80, 443
6. Get the Load Balancer's public IP → Update your DNS to point here

### STEP 3 — Object Storage for File Uploads

1. OCI Console → **Storage** → **Object Storage** → **Create Bucket**
2. Name: `gymapp-uploads`, Visibility: `Private`
3. Add OCI SDK to Spring Boot for photo uploads instead of local disk

---

## PHASE 4 — Enterprise (50+ Gyms) | ₹50,000+/month

**When to upgrade:** Revenue ≥ ₹5,00,000/month

### Setup
- Use OCI Container Engine for Kubernetes (OKE)
- Containerize Spring Boot with Docker
- Use Helm charts for deployment
- Set auto-scaling based on CPU/memory metrics
- Add Grafana + Prometheus for monitoring

**Dockerize the backend:**
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/gymapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
```

```bash
docker build -t gymapp-backend .
docker push your-registry/gymapp-backend:latest
```

---

## Cost Summary

```
Phase 1 (0–5 gyms):    ₹0/month       — Always Free OCI
Phase 2 (5–15 gyms):   ₹6,700/month   — Paid OCI VM + Aiven PG
Phase 3 (15–50 gyms):  ₹20,800/month  — 2 VMs + LB + Aiven HA
Phase 4 (50+ gyms):    ₹50,000+/month — Kubernetes + Enterprise DB
```

> **Rule:** Upgrade when cloud cost < 10% of monthly revenue.

---

## Environment Variables Reference

### Backend (`application-prod.properties`)
```properties
spring.datasource.url=         # DB JDBC URL
spring.datasource.username=    # DB username
spring.datasource.password=    # DB password
server.port=8080
jwt.secret=                    # Min 32-char secret key
jwt.expiration=86400000        # 24 hours in ms
app.cors.allowed-origins=      # Vercel URL
```

### Frontend (Vercel Environment Variables)
```
VITE_API_URL=https://api.yourgymdomain.com/api
```

---

## Useful Commands Cheat Sheet

```bash
# Redeploy backend after code change
mvn clean package -DskipTests
scp target/gymapp.jar ubuntu@VM_IP:/home/ubuntu/gymapp.jar
ssh ubuntu@VM_IP "sudo systemctl restart gymapp"

# View live logs
ssh ubuntu@VM_IP "tail -f /home/ubuntu/logs/gymapp.log"

# Check service status
ssh ubuntu@VM_IP "sudo systemctl status gymapp"

# Restart if crashed
ssh ubuntu@VM_IP "sudo systemctl restart gymapp"
```

---

*Last updated: March 2026 — AthlonX Gym Management System*
