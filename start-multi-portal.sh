#!/bin/bash
# Multi-Portal Tunnel Setup - Each portal has its own tunnel URL
# Beta testers can test simultaneously without session conflicts

echo "🚀 Gym Management - Multi-Portal Beta Testing"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Kill existing
pkill -f "cloudflared tunnel" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Array of portals: name port credentials
declare -A PORTALS=(
  ["5173"]="Owner Portal|owner|pass2233"
  ["5174"]="Trainer A|john.smith|password12"
  ["5175"]="Trainer B|sarah.jones|Sarah@fit123"
  ["5176"]="Member A|member1|password123"
  ["5177"]="Member B|jane.doe|password123"
)

echo -e "${YELLOW}Starting Backend (port 8081)...${NC}"
cd /Users/aryan/Sem\ 8/Intership/backend
mvn spring-boot:run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 8

echo -e "${GREEN}✅ Backend running${NC}"
echo ""

# Start each portal on its own port with its own tunnel
for PORT in "${!PORTALS[@]}"; do
  IFS='|' read -r NAME USER PASS <<< "${PORTALS[$PORT]}"

  echo -e "${YELLOW}Starting $NAME (port $PORT)...${NC}"

  # Start frontend on this port
  cd /Users/aryan/Sem\ 8/Intership/frontend
  PORT=$PORT npm run dev > /tmp/frontend_${PORT}.log 2>&1 &
  sleep 3

  # Start tunnel for this port
  cloudflared tunnel --url http://localhost:${PORT} > /tmp/tunnel_${PORT}.log 2>&1 &
  sleep 5

  TUNNEL_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/tunnel_${PORT}.log | head -1)
  echo -e "${GREEN}  $NAME: $TUNNEL_URL${NC}"
  echo -e "  Login: $USER / $PASS"
  echo ""
done

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 All Portals Running!${NC}"
echo ""
echo -e "${YELLOW}Share each tester their OWN portal URL:${NC}"
echo ""

for PORT in "${!PORTALS[@]}"; do
  IFS='|' read -r NAME USER PASS <<< "${PORTALS[$PORT]}"
  TUNNEL_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/tunnel_${PORT}.log 2>/dev/null | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    echo -e "${GREEN}$NAME:${NC} $TUNNEL_URL"
    echo -e "  Login: $USER / $PASS"
    echo ""
  fi
done

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all${NC}"

wait