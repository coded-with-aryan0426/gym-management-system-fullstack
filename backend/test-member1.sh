#!/bin/bash
RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "member1@email.com", "password": "password123"}')

echo "Login Response: $RESPONSE"
