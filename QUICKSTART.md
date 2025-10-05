# Chess Scoresheet OCR - Quick Start

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

## Step 1: Google Cloud Setup (5 minutes)

1. Go to https://console.cloud.google.com
2. Create new project → Enable "Cloud Vision API"
3. Create Service Account → Download JSON key
4. Save as `server/google-cloud-key.json`

## Step 2: Server Setup

```bash
cd server

# Configure environment
cp .env.example .env
# Edit .env to verify GOOGLE_APPLICATION_CREDENTIALS path

# Dependencies already installed, start server
npm start
```

Expected: "Chess OCR server running on port 3001" ✅

## Step 3: Client Setup

```bash
cd ../client

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Expected: "Local: http://localhost:5173/" ✅

## Step 4: Test the App

1. Open http://localhost:5173
2. Click "Upload Image" or "Use Camera"
3. Select/capture a chess scoresheet
4. Click "Process Image"
5. Review and correct moves
6. Export PGN file

## Troubleshooting

### Server won't start
- Check `server/google-cloud-key.json` exists
- Verify Google Vision API is enabled
- Check port 3001 is available

### Client errors
- Ensure server is running on port 3001
- Check browser console for specific errors
- Verify VITE_API_URL in client/.env

### OCR not working
- Verify Google Cloud credentials
- Check API quota/billing in Google Cloud Console
- Ensure good image quality

## Next Steps

- Read SETUP.md for detailed configuration
- Add your game metadata in export step
- Try different scoresheet formats
- Deploy to production (see SETUP.md Part 6)

## Architecture Overview

```
┌─────────────────┐
│   React App     │  ← User Interface
│  (Port 5173)    │
└────────┬────────┘
         │
         ↓ HTTP Requests
┌─────────────────┐
│  Express Server │  ← OCR Proxy
│  (Port 3001)    │
└────────┬────────┘
         │
         ↓ API Calls
┌─────────────────┐
│ Google Cloud    │  ← Handwriting Recognition
│   Vision API    │
└─────────────────┘
```

**Cost**: Free for first 1,000 images/month, then $1.50/1,000 images

Happy scanning! ♟️
