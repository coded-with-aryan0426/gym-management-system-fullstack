#!/bin/bash
# Cloudflare Tunnel Setup Script
# Usage: ./start-tunnels.sh

echo "🚀 Starting Cloudflare Tunnels for Gym Management App"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any existing tunnel/backend/frontend processes
pkill -f "cloudflared tunnel" 2>/dev/null
pkill -f "spring-boot" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

echo -e "${YELLOW}Starting Backend Tunnel (port 8081)...${NC}"
cloudflared tunnel --url http://localhost:8081 > /tmp/backend_tunnel.log 2>&1 &
BACKEND_PID=$!

sleep 6

BACKEND_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/backend_tunnel.log | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Failed to start backend tunnel${NC}"
    cat /tmp/backend_tunnel.log
    exit 1
fi

echo -e "${GREEN}✅ Backend tunnel: $BACKEND_URL${NC}"

# Create .env file for frontend with the backend URL
echo "VITE_API_URL=$BACKEND_URL" > /Users/aryan/Sem\ 8/Intership/frontend/.env

echo -e "${YELLOW}Starting Frontend Dev Server...${NC}"
cd /Users/aryan/Sem\ 8/Intership/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend dev server starting...${NC}"

sleep 5

echo -e "${YELLOW}Starting Frontend Tunnel (port 5173)...${NC}"
cloudflared tunnel --url http://localhost:5173 > /tmp/frontend_tunnel.log 2>&1 &
FRONTEND_TUNNEL_PID=$!

sleep 6

FRONTEND_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' /tmp/frontend_tunnel.log | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Failed to start frontend tunnel${NC}"
    cat /tmp/frontend_tunnel.log
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 All tunnels started successfully!${NC}"
echo ""
echo -e "${YELLOW}Your Public URLs:${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}Share this URL with your users:${NC}"
echo -e "  ${GREEN}$FRONTEND_URL${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all tunnels${NC}"

echo $BACKEND_PID > /tmp/backend_pid
echo $FRONTEND_PID > /tmp/frontend_pid
echo $FRONTEND_TUNNEL_PID > /tmp/frontend_tunnel_pid

wait