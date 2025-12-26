#!/bin/bash

# Start ngrok to expose local server to internet
# Make sure your Next.js server is running on port 3000 first!

echo "Starting ngrok tunnel to localhost:3000..."
echo ""
echo "If this is your first time, you may need to:"
echo "1. Sign up at https://dashboard.ngrok.com/signup (free)"
echo "2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken"
echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
echo ""
echo "Starting ngrok..."
echo "Once started, visit http://localhost:4040 to see your public URL"
echo ""

ngrok http 3000

