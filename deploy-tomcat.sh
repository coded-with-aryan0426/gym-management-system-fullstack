#!/bin/bash

# ==========================================
# GYM MANAGEMENT SYSTEM - TOMCAT DEPLOYMENT
# ==========================================
# This script builds the WAR file for Tomcat deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Building Gym Management System for Tomcat Deployment${NC}"
echo "=============================================="

# Step 1: Build Frontend
echo -e "\n${YELLOW}📦 Step 1: Building Frontend...${NC}"
cd frontend
npm run build
echo -e "${GREEN}✅ Frontend build complete (dist/ created)${NC}"

# Step 2: Copy frontend to backend static resources
echo -e "\n${YELLOW}📦 Step 2: Copying frontend to backend...${NC}"
mkdir -p ../backend/src/main/resources/static
cp -r dist/* ../backend/src/main/resources/static/
echo -e "${GREEN}✅ Frontend copied to backend/src/main/resources/static/${NC}"

# Step 3: Build WAR file
echo -e "\n${YELLOW}📦 Step 3: Building WAR file...${NC}"
cd ../backend
mvn clean package -DskipTests
echo -e "${GREEN}✅ WAR file created${NC}"

# Step 4: Display result
WAR_FILE=$(ls target/*.war 2>/dev/null | head -1)
if [ -n "$WAR_FILE" ]; then
    echo -e "\n${GREEN}🎉 DEPLOYMENT READY!${NC}"
    echo "=============================================="
    echo -e "WAR file: ${YELLOW}$WAR_FILE${NC}"
    echo ""
    echo "To deploy to Tomcat:"
    echo "  1. Copy the WAR file to your Tomcat webapps folder:"
    echo "     cp $WAR_FILE \$CATALINA_HOME/webapps/"
    echo ""
    echo "  2. Start Tomcat:"
    echo "     \$CATALINA_HOME/bin/startup.sh"
    echo ""
    echo "  3. Access the application at:"
    echo "     http://localhost:8080/management-0.0.1-SNAPSHOT/"
else
    echo -e "${RED}❌ WAR file not found!${NC}"
    exit 1
fi
