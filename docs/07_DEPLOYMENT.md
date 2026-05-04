# Deployment Automation — Contabo VPS (PronosBox)

This guide explains how to set up automated deployment on your Contabo VPS. After this setup, deploying a new version is a single command.

---

## Why This is Necessary

When you push new code, the browser caches old JavaScript/CSS files. The only way to clear this is to:
1. Rebuild the Vite frontend (`npm run build` → new hash filenames).
2. Restart the PM2 process (Express backend picks up new code).

The `deploy.sh` script does all of this atomically.

---

## Step-by-Step Setup

### 1. Connect to your Contabo VPS

```bash
ssh root@<YOUR_CONTABO_IP>
```

### 2. Create the Deployment Script

Assuming the project is cloned to `/var/www/pronosbox`:

```bash
cd /var/www/pronosbox
nano deploy.sh
```

### 3. Paste the Script Content

```bash
#!/bin/bash
set -e  # Stop on first error
echo "🚀 Starting PronosBox deployment..."

# Go to project directory
cd /var/www/pronosbox

# 1. Pull latest code
echo "📦 Pulling latest code from git..."
git pull origin main

# 2. Install any new npm dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# 3. Build the Vite frontend (generates dist/ with cache-busted filenames)
echo "🎨 Building frontend..."
npm run build

# 4. Restart the Express backend via PM2
echo "🔄 Restarting backend (PM2)..."
pm2 restart pronosbox-api

echo "✅ PronosBox deployment complete!"
```

*Save and exit nano: `Ctrl+O`, `Enter`, then `Ctrl+X`.*

### 4. Make the Script Executable

```bash
chmod +x deploy.sh
```

---

## How to Deploy

From your Contabo VPS terminal, simply run:

```bash
./deploy.sh
```

### What Happens:
1. Latest code is pulled from `git`.
2. New npm packages are installed if `package.json` changed.
3. Vite rebuilds `dist/` with new content-hashed filenames → users get fresh JS/CSS.
4. PM2 restarts `server.js` → the Express API picks up any backend changes.

---

## Initial VPS Setup (First Time Only)

```bash
# 1. Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install MongoDB
# (Follow official MongoDB docs for your Ubuntu version)

# 3. Install PM2 globally
npm install -g pm2

# 4. Clone the project
git clone https://github.com/YOUR_USERNAME/pronobox.git /var/www/pronosbox
cd /var/www/pronosbox

# 5. Create .env file (copy from local and fill in production values)
nano .env

# 6. Install dependencies & build
npm install
npm run build

# 7. Start the backend with PM2
pm2 start src/server.js --name pronosbox-api
pm2 startup
pm2 save

# 8. Install & configure Nginx (see 06_INFRASTRUCTURE.md)
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

*(Advanced: For fully automated `git push` → auto-deploy, configure a Git Bare Repository with a `post-receive` hook on the VPS. The `./deploy.sh` approach is sufficient for solo/small-team development.)*
