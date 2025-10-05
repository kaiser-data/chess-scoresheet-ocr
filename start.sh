#!/bin/bash

# Chess Scoresheet OCR - Startup Script
# This script checks prerequisites and starts both servers

echo "♟️  Chess Scoresheet OCR - Starting..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if server credentials exist
if [ ! -f "server/google-cloud-key.json" ]; then
    echo ""
    echo "⚠️  Google Cloud credentials not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://console.cloud.google.com"
    echo "2. Create a new project and enable Cloud Vision API"
    echo "3. Create a service account and download JSON key"
    echo "4. Save the key as: server/google-cloud-key.json"
    echo ""
    echo "See SETUP.md for detailed instructions."
    exit 1
fi

echo "✅ Google Cloud credentials found"

# Check if server .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env"
fi

# Check if client .env exists
if [ ! -f "client/.env" ]; then
    echo "⚠️  Creating client/.env from template..."
    cp client/.env.example client/.env
    echo "✅ Created client/.env"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm run install:all
    echo "✅ Dependencies installed"
fi

echo ""
echo "🚀 Starting servers..."
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev
