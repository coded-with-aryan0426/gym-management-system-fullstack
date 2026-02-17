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

# Step 4: Rename WAR with timestamp (12-hour format)
echo -e "\n${YELLOW}📦 Step 4: Adding timestamp to WAR file...${NC}"
TIMESTAMP=$(date +"%Y-%m-%d_%I-%M-%S%p")
ORIGINAL_WAR="target/management-0.0.1-SNAPSHOT.war"
TIMESTAMPED_WAR="target/gym-management_${TIMESTAMP}.war"

if [ -f "$ORIGINAL_WAR" ]; then
    cp "$ORIGINAL_WAR" "$TIMESTAMPED_WAR"
    echo -e "${GREEN}✅ Created: $TIMESTAMPED_WAR${NC}"
fi

# Step 5: Display result
echo -e "\n${GREEN}🎉 DEPLOYMENT READY!${NC}"
echo "=============================================="
echo -e "WAR files in target folder:"
ls -la target/*.war 2>/dev/null | awk '{print "  " $NF " (" $5 " bytes)"}'
echo ""
echo -e "${YELLOW}Latest timestamped WAR:${NC}"
echo "  $TIMESTAMPED_WAR"
echo ""
echo "To deploy to Tomcat:"
echo "  cp $TIMESTAMPED_WAR /Applications/apache-tomcat-10.1.50/webapps/"
echo ""
echo "Access at: http://localhost:8080/gym-management_${TIMESTAMP}/"

