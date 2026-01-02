#!/bin/bash

# ==========================================
# TITAN PROTOCOL: AUTO-SYNC SYSTEM v1.0
# ==========================================
# Description: Automatically commits and pushes changes every 60 seconds
# Target: origin/fullstack-beta

BRANCH="fullstack-beta"
REMOTE="origin"
INTERVAL=60

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Auto-Sync System for branch: $BRANCH${NC}"
echo -e "${YELLOW}🔄 Checking for changes every $INTERVAL seconds...${NC}"
echo "---------------------------------------------------"

while true; do
  # Check for any changes (staged, unstaged, or untracked)
  if [[ -n $(git status -s) ]]; then
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    echo -e "\n${YELLOW}📦 Changes detected at $TIMESTAMP. Initiating sync...${NC}"
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    git commit -m "Auto-sync: $TIMESTAMP"
    
    # Push to remote
    echo -e "⬆️  Pushing to $REMOTE/$BRANCH..."
    if git push $REMOTE $BRANCH; then
      echo -e "${GREEN}✅ Successfully synced to GitHub at $TIMESTAMP${NC}"
    else
      echo -e "${RED}❌ Push failed. Will retry in next cycle.${NC}"
    fi
  else
    # Optional: Print a "heartbeat" dot to show it's alive, or silence it.
    # echo -n "."
    : # No-op
  fi
  
  sleep $INTERVAL
done
