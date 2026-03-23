#!/bin/bash
RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "Aryan23@gmail.com", "password": "Aryan@123"}')

echo "Login Response: $RESPONSE"
