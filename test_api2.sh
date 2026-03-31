#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"member1","password":"password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")

echo "Token obtained: ${#TOKEN} chars"

echo ""
echo "=== /me/history raw response ==="
curl -s -w "\nHTTP_CODE:%{http_code}" "http://localhost:8081/api/attendance/me/history" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "=== /me/streak raw response ==="
curl -s -w "\nHTTP_CODE:%{http_code}" "http://localhost:8081/api/attendance/me/streak" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "=== Checking activeGymId from token ==="
echo "$TOKEN" | python3 -c "import sys,json,base64; payload=sys.stdin.read().split('.')[1]+'=='; import base64; d=base64.urlsafe_b64decode(payload); print(json.dumps(json.loads(d), indent=2))"
