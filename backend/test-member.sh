#!/bin/bash
echo "Logging in as member AryanFit3@gmail.com..."
RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "AryanFit3@gmail.com", "password": "Aryan@194"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Login failed. Response:"
  echo $RESPONSE
  exit 1
fi

echo -e "\nFetching /api/users/members..."
curl -i -s -X GET http://localhost:8081/api/users/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\nFetching /api/users..."
curl -i -s -X GET "http://localhost:8081/api/users?roles=TRAINER" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
