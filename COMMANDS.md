# Available Commands

Quick reference for all npm scripts and utilities.

## 🚀 Quick Start

```bash
# One-command startup (recommended)
./start.sh

# Or use npm
npm run dev
```

## 📦 Installation Commands

```bash
# Install all dependencies (root, server, client)
npm run install:all

# Install server dependencies only
cd server && npm install

# Install client dependencies only
cd client && npm install
```

## 🏃 Development Commands

```bash
# Run both servers concurrently (RECOMMENDED)
npm run dev

# Run server only
npm run dev:server
# or
cd server && npm run dev

# Run client only
npm run dev:client
# or
cd client && npm run dev
```

## 🏗️ Production Commands

```bash
# Start server (production mode)
npm run start:server
# or
cd server && npm start

# Build client for production
npm run build
# or
cd client && npm run build

# Preview production build
cd client && npm run preview
```

## 🔧 Server Commands

```bash
cd server

# Start server (production)
npm start

# Start server with auto-reload (development)
npm run dev
```

**Environment Variables** (server/.env):
- `PORT` - Server port (default: 3001)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud key

## 🎨 Client Commands

```bash
cd client

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck  # if configured

# Linting
npm run lint  # if configured
```

**Environment Variables** (client/.env):
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## 🧪 Testing Commands

```bash
# Currently no tests configured
# To add tests:
cd client
npm install -D vitest @testing-library/react
npm run test
```

## 🛠️ Utility Scripts

### Start Script (Recommended)
```bash
./start.sh
```

**Features**:
- Checks Node.js version (requires 18+)
- Verifies Google Cloud credentials exist
- Creates .env files from templates
- Installs dependencies if missing
- Starts both servers concurrently

### Manual Setup Steps

```bash
# 1. Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 2. Place Google Cloud credentials
# Download from Google Cloud Console
# Save as: server/google-cloud-key.json

# 3. Install dependencies
npm run install:all

# 4. Start development servers
npm run dev
```

## 📊 Verification Commands

```bash
# Check if server is running
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","service":"chess-ocr"}

# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version

# List all dependencies
npm list
cd server && npm list
cd client && npm list

# Check for outdated packages
npm outdated
cd server && npm outdated
cd client && npm outdated
```

## 🔍 Debugging Commands

```bash
# View server logs
cd server && npm run dev
# Server logs appear in terminal

# View client build errors
cd client && npm run build
# Build errors appear in terminal

# Check TypeScript errors
cd client && npx tsc --noEmit

# Check for missing dependencies
npm install --package-lock-only
npm audit
```

## 📁 Project Structure Commands

```bash
# View project tree (excluding node_modules)
tree -I 'node_modules'

# Count lines of code
find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' | \
  grep -v node_modules | xargs wc -l

# List all source files
find client/src -type f
find server/src -type f
```

## 🧹 Cleanup Commands

```bash
# Remove all node_modules and package-lock files
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf client/node_modules client/package-lock.json

# Remove build artifacts
rm -rf client/dist
rm -rf client/.vite

# Full cleanup and reinstall
rm -rf node_modules package-lock.json \
       server/node_modules server/package-lock.json \
       client/node_modules client/package-lock.json \
       client/dist client/.vite
npm run install:all
```

## 🚀 Deployment Commands

### Backend (Railway/Render/Heroku)

```bash
# Build command: (none needed, Node.js runs directly)

# Start command:
npm start

# Environment variables to set:
# - PORT
# - GOOGLE_APPLICATION_CREDENTIALS
```

### Frontend (Netlify/Vercel)

```bash
# Build command:
npm run build

# Output directory:
client/dist

# Environment variables to set:
# - VITE_API_URL=https://your-backend-url.com
```

## 💡 Helpful Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Chess OCR aliases
alias chess-dev='cd /path/to/chess-scoresheet-ocr && ./start.sh'
alias chess-server='cd /path/to/chess-scoresheet-ocr/server && npm run dev'
alias chess-client='cd /path/to/chess-scoresheet-ocr/client && npm run dev'
alias chess-build='cd /path/to/chess-scoresheet-ocr/client && npm run build'
```

## 📚 Documentation Commands

```bash
# View documentation in terminal
cat README.md
cat QUICKSTART.md
cat SETUP.md
cat PROJECT_SUMMARY.md

# Open documentation in browser (if installed)
# macOS
open README.md

# Linux
xdg-open README.md

# Windows
start README.md
```

## 🔐 Security Commands

```bash
# Check for vulnerabilities
npm audit
cd server && npm audit
cd client && npm audit

# Fix vulnerabilities (if possible)
npm audit fix
cd server && npm audit fix
cd client && npm audit fix

# Update dependencies
npm update
cd server && npm update
cd client && npm update
```

## 📦 Package Management

```bash
# Add dependency to server
cd server && npm install <package-name>

# Add dependency to client
cd client && npm install <package-name>

# Add dev dependency
cd client && npm install -D <package-name>

# Remove dependency
cd client && npm uninstall <package-name>

# Check package info
npm info <package-name>

# Search npm registry
npm search <keyword>
```

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `./start.sh` | Start both servers (recommended) |
| `npm run dev` | Run both servers concurrently |
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build client for production |
| `curl localhost:3001/api/health` | Test server health |
| `tree -I node_modules` | View project structure |

## 🆘 Troubleshooting

```bash
# Server won't start
cd server
npm install
node src/server.js

# Client won't start
cd client
npm install
npm run dev

# Port already in use
# Kill process on port 3001 (server)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (client)
lsof -ti:5173 | xargs kill -9

# Permission errors
chmod +x start.sh
sudo chown -R $USER:$USER .
```

---

For more help, see:
- **QUICKSTART.md** - Getting started guide
- **SETUP.md** - Detailed setup instructions
- **PROJECT_SUMMARY.md** - Technical documentation
