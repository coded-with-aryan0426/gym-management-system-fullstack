#!/bin/bash

echo "=== STEP 1: Login as member1 (MEMBER role) ==="
LOGIN_RESP=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"member1","password":"password123"}')
echo "Login response: $LOGIN_RESP"
TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
echo "Token length: ${#TOKEN}"
echo ""

echo "=== STEP 2: Test /api/attendance/me/history (MEMBER endpoint) ==="
HIST_RESP=$(curl -s "http://localhost:8081/api/attendance/me/history" \
  -H "Authorization: Bearer $TOKEN")
echo "$HIST_RESP" | python3 -m json.tool 2>/dev/null || echo "Raw: $HIST_RESP"
echo ""

echo "=== STEP 3: Test /api/attendance/me/streak (MEMBER endpoint) ==="
STREAK_RESP=$(curl -s "http://localhost:8081/api/attendance/me/streak" \
  -H "Authorization: Bearer $TOKEN")
echo "$STREAK_RESP" | python3 -m json.tool 2>/dev/null || echo "Raw: $STREAK_RESP"
echo ""

echo "=== STEP 4: Login as owner (OWNER role) ==="
OWNER_RESP=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"password123"}')
echo "Owner login: $OWNER_RESP" | head -c 200
OWNER_TOKEN=$(echo "$OWNER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
echo "Owner token length: ${#OWNER_TOKEN}"
echo ""

if [ -n "$OWNER_TOKEN" ]; then
  echo "=== STEP 5: Test /api/attendance/stats (OWNER endpoint) ==="
  curl -s "http://localhost:8081/api/attendance/stats" \
    -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool 2>/dev/null || echo "Raw fail"
fi
