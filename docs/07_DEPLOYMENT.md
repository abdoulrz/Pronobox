# Production Deployment Guide & VPS Blueprint — Contabo VPS (PronosBox)

This guide provides the ultimate plug-and-play production blueprint to deploy PronosBox to a Contabo Ubuntu Linux VPS. 

It covers network mapping, domain name system (DNS) routing, backend clustering, frontend static hosting, local binary storage mapping, and automated Let's Encrypt SSL security.

---

## 🌐 1. The DNS Factor (Domain Routing & Mapping)

Before performing any installations on the VPS, your domain name must point to your Contabo VPS public IP address. DNS propagation can take anywhere from **5 minutes to 24 hours** to complete worldwide.

### Recommended DNS Configurations
Login to your Domain Registrar dashboard (e.g., Namecheap, GoDaddy, Hostinger, Cloudflare) and configure the following DNS zone records:

| Record Type | Host / Name | Value / Destination | TTL (Time to Live) | Purpose |
| :---: | :---: | :---: | :---: | :--- |
| **A Record** | `@` *(or blank)* | `YOUR_VPS_PUBLIC_IP` | `3600` (1 hour) | Points your root domain `pronosbox.com` to the VPS. |
| **A Record** | `www` | `YOUR_VPS_PUBLIC_IP` | `3600` (1 hour) | Points the www subdomain `www.pronosbox.com` to the VPS. |
| **A Record** | `api` | `YOUR_VPS_PUBLIC_IP` | `3600` (1 hour) | Points the API backend sub-domain `api.pronosbox.com` to the VPS. |

### How to Verify DNS Propagation
You can check if your domain has successfully propagated to your VPS IP from your local console:
```bash
# Windows / Mac / Linux Ping check
ping pronosbox.com
ping api.pronosbox.com
```
*Verify that the returned IP matches your exact Contabo VPS public IP address.*

---

## 💾 2. Cloud Database Architecture (MongoDB Atlas)

> [!NOTE]
> **No Local MongoDB Needed:** PronosBox's backend is pre-configured to use **MongoDB Atlas** (cloud-hosted database).
> You do **not** need to install, configure, or run MongoDB local processes on your VPS. This saves significant server RAM/CPU and secures your user databases with automatic cloud replication and zero dataloss risks.

Ensure your MongoDB Atlas network access whitelist allows connections from **anywhere (`0.0.0.0/0`)** or specifically lists your **Contabo VPS Public IP Address** to prevent connection timeouts during startup.

---

## 🛠️ 3. Step-by-Step VPS Provisioning

Connect to your Contabo VPS as the root user:
```bash
ssh root@YOUR_VPS_PUBLIC_IP
```

### Step A: Update Packages & Runtime Dependencies
Install the latest Node.js v20 LTS, Git, and Nginx web server:
```bash
# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Add NodeSource repository and install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Verify installations
node -v  # Expected: v20.x.x
npm -v   # Expected: v10.x.x

# 4. Install Git, Nginx, and UFW firewall utilities
sudo apt-get install -y nginx git ufw
```

### Step B: Configure Firewall Security
Secure your server by allowing only web traffic and SSH connections:
```bash
# Allow critical services
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
sudo ufw status
```

### Step C: Install PM2 Globally
PM2 keeps your backend node process alive forever, automatically restarting it if the server crashes or restarts.
```bash
sudo npm install -g pm2
```

---

## 📂 4. Project Setup & Build

We will host the production application under `/var/www/pronosbox`.

```bash
# Create directory and take ownership
sudo mkdir -p /var/www/pronosbox
sudo chown -R $USER:$USER /var/www/pronosbox

# Clone the repository
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/pronosbox
cd /var/www/pronosbox

# Install production dependencies
npm install --production=false

# Compile the React production bundle
npm run build
```
*This compiles the optimized single-page frontend into the `/var/www/pronosbox/dist` directory.*

### Configure Server Environment variables
```bash
nano src/.env
```
*Paste your production variables into `src/.env`:*
```env
MONGODB_URI=mongodb://abdoulrazackzemane_db_user:UgHQGMF7ujQzYbNM@ac-eheckov-shard-00-00.e97s2zy.mongodb.net:27017,ac-eheckov-shard-00-01.e97s2zy.mongodb.net:27017,ac-eheckov-shard-00-02.e97s2zy.mongodb.net:27017/pronobox?ssl=true&replicaSet=atlas-l04agw-shard-0&authSource=admin&appName=PronoboxCluster0
JWT_SECRET=pronosbox_secret_key_for_authentication
PORT=5001
```

---

## ⚙️ 5. Run the Backend with PM2

We use the pre-configured [ecosystem.config.cjs](file:///c:/Users/Usuario/Documents/Pronobox/pronobox_codebase/ecosystem.config.cjs) to handle auto-restarts, memory limits, and single-instance clustering:

```bash
# Launch server process
pm2 start ecosystem.config.cjs

# Verify the app is running successfully
pm2 list
pm2 logs pronobox-backend
```

### Configure Startup Persistence
To ensure your PM2 backend launches automatically if the Contabo VPS undergoes a maintenance reboot:
```bash
pm2 startup
```
*Copy the command printed in your terminal (starting with `sudo env PATH=...`) and run it. Then save the active list:*
```bash
pm2 save
```

---

## 🕸️ 6. High-Performance Nginx Web Server Setup

Now we will configure Nginx to act as our high-speed static content server and reverse proxy.

```bash
# Create site configuration file
sudo nano /etc/nginx/sites-available/pronobox
```
*Paste the following high-performance config block, replacing `pronosbox.com` with your actual domain:*
```nginx
server {
    listen 80;
    server_name pronosbox.com www.pronosbox.com api.pronosbox.com;

    # Static frontend compiled output directory
    root /var/www/pronobox/dist;
    index index.html;

    # Support clean React router links (fallback to index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API REST requests securely to local Express process on port 5001
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Security & Timeout controls
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        client_max_body_size 50M; # Permits large binary/PDF uploads
    }

    # Serve user file uploads statically from the local root folder
    location /uploads {
        alias /var/www/pronobox/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
```
*Save and close nano (`Ctrl+O`, `Enter`, `Ctrl+X`).*

### Activate the Configuration
```bash
# Enable the configuration
sudo ln -s /etc/nginx/sites-available/pronobox /etc/nginx/sites-enabled/

# Remove Nginx default test page configuration
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax configuration
sudo nginx -t

# Reload Nginx server
sudo systemctl reload nginx
```

---

## 🔒 7. SSL Security Automation (Certbot & HTTPS)

To encrypt all credentials, wallet transactions, and admin controls, configure **SSL Certificates** via Let's Encrypt. Certbot automates SSL generation and auto-renewals.

```bash
# Install Certbot via Snap
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Request certificates and let Certbot configure Nginx redirection automatically
sudo certbot --nginx -d pronosbox.com -d www.pronosbox.com -d api.pronosbox.com
```
*Certbot will ask for an email address and prompt you to agree to terms. It will automatically re-write Nginx configurations to redirect all standard HTTP traffic to secure HTTPS (`https://`).*

### Verify SSL Auto-Renewal Status
Let's Encrypt certificates last 90 days. Certbot configures a cron job to automatically renew them. You can test it with:
```bash
sudo certbot renew --dry-run
```
*If this prints "Congratulations, all simulated renewals succeeded", your site is fully automated and secure forever.*

---

## 🔄 8. Quick Deployments script (`deploy.sh`)

Whenever you make future updates to the code, you can pull the changes, install dependencies, compile the production bundles, and restart the backend in a **single command**.

Create a deployment script in the project root:
```bash
nano /var/www/pronobox/deploy.sh
```
*Paste this shell script:*
```bash
#!/bin/bash
set -e  # Stop on first error

echo "🚀 Starting PronosBox automated deployment..."

# Go to project directory
cd /var/www/pronosbox

# 1. Pull latest code
echo "📦 Pulling latest code from GitHub..."
git pull origin main

# 2. Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production=false

# 3. Compile the Vite frontend React bundle
echo "🎨 Building optimized frontend..."
npm run build

# 4. Restart backend processes cleanly under PM2
echo "🔄 Reloading PM2 backend application..."
pm2 reload pronobox-backend

echo "✅ PronosBox deployment complete and live!"
```
*Make the script executable:*
```bash
chmod +x /var/www/pronosbox/deploy.sh
```
Now, whenever you release updates, simply SSH to your server and run:
```bash
./deploy.sh
```
