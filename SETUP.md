# Chess Scoresheet OCR - Setup Guide

Complete setup instructions for the chess scoresheet OCR application.

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform account
- A device with a camera (for capture feature)

---

## Part 1: Google Cloud Vision API Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter project name: `chess-ocr` (or your choice)
4. Click "Create"

### 1.2 Enable Cloud Vision API

1. In the search bar, type "Cloud Vision API"
2. Click on "Cloud Vision API"
3. Click "Enable"
4. Wait for the API to be enabled (~1 minute)

### 1.3 Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `chess-ocr-service`
4. Click "Create and Continue"
5. Role: Select "Cloud Vision AI Service Agent"
6. Click "Continue" → "Done"

### 1.4 Download Credentials

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. Save the downloaded file as `google-cloud-key.json`
7. **Important**: Keep this file secure and never commit to git

---

## Part 2: Backend Server Setup

### 2.1 Navigate to Server Directory

```bash
cd server
```

### 2.2 Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `multer` - File upload handling
- `@google-cloud/vision` - Google Cloud Vision client
- `nodemon` - Development server (dev dependency)

### 2.3 Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

Update `.env`:
```
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
```

### 2.4 Place Credentials File

```bash
# Move your downloaded credentials to server directory
mv ~/Downloads/google-cloud-key.json ./google-cloud-key.json

# Verify it exists
ls -la google-cloud-key.json
```

### 2.5 Test Server

```bash
# Start server
npm start

# Or use development mode with auto-reload
npm run dev
```

Expected output:
```
Chess OCR server running on port 3001
Health check: http://localhost:3001/api/health
```

Test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","service":"chess-ocr"}
```

---

## Part 3: Frontend Client Setup

### 3.1 Navigate to Client Directory

```bash
cd ../client
```

### 3.2 Dependencies Already Installed

If not already installed:
```bash
npm install
```

This installs:
- `react` & `react-dom` - React framework
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - Styling
- `chess.js` - Chess logic
- `react-webcam` - Camera access
- `lucide-react` - Icons

### 3.3 Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

The `.env` file should contain:
```
VITE_API_URL=http://localhost:3001
```

For production, update to your deployed backend URL.

### 3.4 Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Part 4: Running the Application

### 4.1 Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4.2 Access the Application

Open browser and navigate to:
```
http://localhost:5173
```

### 4.3 Test the Workflow

1. **Capture**: Click "Use Camera" or "Upload Image"
2. **Preview**: Review the captured image
3. **Process**: Click "Process Image" (AI processing happens)
4. **Review**: Correct any misrecognized moves
5. **Export**: Add metadata and download PGN file

---

## Part 5: Troubleshooting

### Issue: CORS Errors

**Symptom**: Network errors in browser console

**Solution**: Ensure backend server is running and CORS is enabled:
```javascript
// server/src/server.js should have:
app.use(cors());
```

### Issue: Google Vision API Errors

**Symptom**: "OCR processing failed" error

**Solutions**:
1. Verify API is enabled in Google Cloud Console
2. Check credentials file path in `.env`
3. Ensure service account has correct permissions
4. Check API quota limits (Vision API has free tier limits)

### Issue: OpenCV.js Not Loading

**Symptom**: Image preprocessing fails

**Solution**: Ensure internet connection (OpenCV.js loads from CDN):
```html
https://docs.opencv.org/4.8.0/opencv.js
```

### Issue: Camera Not Working

**Symptom**: "Permission denied" or camera not detected

**Solutions**:
1. Grant camera permissions in browser
2. Use HTTPS in production (required for camera access)
3. Try "Upload Image" instead
4. Check browser console for specific errors

### Issue: Build Errors

**Symptom**: TypeScript or build errors

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

---

## Part 6: Production Deployment

### 6.1 Backend Deployment (Railway/Render/Heroku)

1. **Build**: No build step needed (Node.js runs directly)

2. **Environment Variables**:
   ```
   PORT=3001
   GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
   ```

3. **Add Credentials**:
   - Upload `google-cloud-key.json` as a secret file
   - Or use base64 encoding:
     ```bash
     cat google-cloud-key.json | base64
     ```
     Store as env var and decode at runtime

4. **Start Command**:
   ```json
   {
     "scripts": {
       "start": "node src/server.js"
     }
   }
   ```

### 6.2 Frontend Deployment (Netlify/Vercel)

1. **Build**:
   ```bash
   npm run build
   ```

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

3. **Deploy `dist/` folder**

4. **Configure Redirects** (for SPA routing):

   **Netlify** (`netlify.toml`):
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

   **Vercel** (`vercel.json`):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

---

## Part 7: Cost Estimation

### Google Cloud Vision API Pricing

- **First 1,000 images/month**: FREE
- **1,001 - 5,000,000 images**: $1.50 per 1,000 images

**Personal Use Cost**: Effectively $0 (free tier covers typical usage)

**Example**:
- 100 scoresheets/month = $0
- 2,000 scoresheets/month = ~$1.50
- 10,000 scoresheets/month = ~$13.50

### Infrastructure Costs

- **Backend Hosting**: $0-5/month (Railway/Render free tier)
- **Frontend Hosting**: $0 (Netlify/Vercel free tier)

**Total Monthly Cost**: $0-5 for typical personal use

---

## Part 8: Development Tips

### Running Tests

The application doesn't have tests yet, but you can add:

```bash
# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting (if configured)
npm run lint
```

### Performance Optimization

1. **Image Size**: Resize images before upload to reduce API costs
2. **Caching**: Implement result caching for repeated scoresheets
3. **Batch Processing**: Process multiple scoresheets in parallel

---

## Part 9: Security Considerations

### Never Commit Secrets

Ensure `.gitignore` includes:
```
*.json
!package.json
!tsconfig.json
.env
.env.local
```

### Rate Limiting

Consider adding rate limiting to backend:
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### HTTPS Required

Always use HTTPS in production for:
- Camera access (browser requirement)
- Secure API communication
- Credential protection

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for backend issues
3. Review Google Cloud logs for Vision API errors
4. Ensure all environment variables are set correctly

Happy chess OCR processing! ♟️
