#!/bin/bash

# ==========================================
# TITAN PROTOCOL: ONE-CLICK SYNC v1.1
# ==========================================
# Description: Checks for changes and pushes them immediately (Single Run)
# Target: origin/fullstack-beta

BRANCH="fullstack-beta"
REMOTE="origin"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Sync for branch: $BRANCH${NC}"

# Check for any changes (staged, unstaged, or untracked)
if [[ -n $(git status -s) ]]; then
  TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
  echo -e "${YELLOW}📦 Changes detected. Initiating sync...${NC}"
  
  # Add all changes
  git add .
  
  # Commit with timestamp
  git commit -m "Manual-sync: $TIMESTAMP"
  
  # Push to remote
  echo -e "⬆️  Pushing to $REMOTE/$BRANCH..."
  if git push $REMOTE $BRANCH; then
    echo -e "${GREEN}✅ Successfully synced to GitHub at $TIMESTAMP${NC}"
  else
    echo -e "${RED}❌ Push failed.${NC}"
  fi
else
  echo -e "${GREEN}✨ No changes detected. Repository is up to date.${NC}"
fi
