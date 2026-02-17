#!/bin/bash

# Base URL
API_URL="http://127.0.0.1:8081/api/pt-sessions"

# Function to create a class
create_class() {
  local name="$1"
  local type="$2"
  local room="$3"
  local date="$4"
  local time="$5"
  local duration="$6"
  local capacity="$7"

  # JSON escape metadata
  local notes="{\"name\":\"$name\",\"type\":\"$type\",\"room\":\"$room\",\"capacity\":$capacity,\"enrolled\":0}"
  # Escape quotes for JSON string inside JSON
  local escaped_notes=$(echo $notes | sed 's/"/\\"/g')

  curl -X POST "$API_URL" \
       -H "Content-Type: application/json" \
       -d "{
         \"trainerId\": 2,
         \"memberId\": 1,
         \"sessionDate\": \"${date}T${time}:00\",
         \"durationMinutes\": $duration,
         \"status\": \"SCHEDULED\",
         \"progressNotes\": \"$escaped_notes\"
       }"
}

# Get current date
today=$(date +%Y-%m-%d)
tomorrow=$(date -v+1d +%Y-%m-%d || date -d "+1 day" +%Y-%m-%d)
day_after=$(date -v+2d +%Y-%m-%d || date -d "+2 days" +%Y-%m-%d)

echo "Creating sample classes..."

# Today's Classes
create_class "Morning Yoga Flow" "Yoga" "Studio A" "$today" "07:00" 60 20
create_class "HIIT Blast" "HIIT" "Gym Floor" "$today" "12:00" 45 15
create_class "Evening Pilates" "Pilates" "Studio B" "$today" "18:00" 60 12

# Tomorrow's Classes
create_class "Strength & Power" "Strength" "Main Hall" "$tomorrow" "08:00" 60 25
create_class "Cardio Burn" "Cardio" "Gym Floor" "$tomorrow" "17:30" 45 30

# Day After
create_class "CrossFit Advanced" "CrossFit" "Main Hall" "$day_after" "10:00" 90 15

echo "Done!"
