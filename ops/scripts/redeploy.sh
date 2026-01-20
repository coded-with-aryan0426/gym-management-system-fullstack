#!/bin/bash
#===============================================================================
# REDEPLOY SCRIPT - Gym Management System
# Usage: ./redeploy.sh
#===============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CATALINA_HOME="/Applications/apache-tomcat-10.1.50"
BACKEND_DIR="/Users/aryan/Intership/backend"
WAR_FILE="$BACKEND_DIR/target/management-0.0.1-SNAPSHOT.war"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   GYM MANAGEMENT SYSTEM - REDEPLOY    ${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 1: Build new WAR
echo -e "\n${GREEN}[1/3]${NC} Building WAR file..."
cd "$BACKEND_DIR"
mvn clean package -DskipTests -q

if [ -f "$WAR_FILE" ]; then
    echo -e "      ${GREEN}✓${NC} WAR built: $(ls -lh $WAR_FILE | awk '{print $5}')"
else
    echo -e "      ${RED}✗${NC} WAR build failed!"
    exit 1
fi

# Step 2: Stop Tomcat
echo -e "\n${GREEN}[2/3]${NC} Stopping Tomcat..."
export CATALINA_HOME
export CATALINA_BASE="$CATALINA_HOME"
$CATALINA_HOME/bin/shutdown.sh 2>/dev/null || true
sleep 3
echo -e "      ${GREEN}✓${NC} Tomcat stopped"

# Step 3: Start Tomcat
echo -e "\n${GREEN}[3/3]${NC} Starting Tomcat..."
$CATALINA_HOME/bin/startup.sh

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETE!                ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Access:${NC} http://localhost:8080/gym-management/"
echo -e "${YELLOW}Logs:${NC}   tail -f $CATALINA_HOME/logs/catalina.out"
