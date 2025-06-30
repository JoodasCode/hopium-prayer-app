#!/bin/bash

# Script to run the data population for Jamaal's account

# Check if user ID is provided
if [ -z "$1" ]; then
  echo "Error: Please provide Jamaal's user ID as an argument"
  echo "Usage: ./run-populate-data.sh USER_ID"
  exit 1
fi

# Replace the placeholder in the script with the actual user ID
sed -i '' "s/REPLACE_WITH_JAMAAL_USER_ID/$1/g" ./scripts/populate-jamaal-data.js

# Install dependencies if needed
npm install @supabase/supabase-js

# Run the script with Node.js
node -r dotenv/config ./scripts/populate-jamaal-data.js

# Restore the placeholder for future runs
sed -i '' "s/$1/REPLACE_WITH_JAMAAL_USER_ID/g" ./scripts/populate-jamaal-data.js

echo "Data population complete!"
