# Infrastructure Specification — Contabo VPS (PronosBox)

This document outlines the planned and current infrastructure for PronosBox hosted on Contabo VPS.

---

## 1. Private Networking (Security & Isolation) 🔒

**Status:** Critical for production.

### The Problem

The MongoDB instance (port `27017`) must never be exposed to the public internet, even with a password. Public exposure invites brute-force attacks.

### The Solution

Bind MongoDB exclusively to localhost:

```bash
# /etc/mongod.conf
net:
  bindIp: 127.0.0.1
  port: 27017
```

Configure `ufw` to block external access to MongoDB:

```bash
sudo ufw deny 27017
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

The Express backend (`server.js`) communicates with MongoDB via `MONGODB_URI=mongodb://127.0.0.1:27017/pronosbox` in the `.env` file — internal only.

**Action Items:**
- [ ] Verify `mongod.conf` binds to `127.0.0.1` only.
- [ ] Verify `ufw` blocks port `27017` from public.
- [ ] Verify `ufw` allows ports `80`, `443`, and `22`.

---

## 2. Process Management — PM2

**Status:** Required for production.

Node.js processes (`server.js`) need a process manager to:
- Auto-restart on crash.
- Start on server reboot.
- Provide logs and monitoring.

```bash
npm install -g pm2

# Start the backend
pm2 start src/server.js --name pronosbox-api

# Start on system reboot
pm2 startup
pm2 save
```

For the frontend, build the Vite bundle and serve with Nginx:

```bash
npm run build
# Output: dist/ folder → serve via Nginx
```

**Action Items:**
- [ ] Install PM2 on Contabo VPS.
- [ ] Configure `pm2 startup` to persist across reboots.
- [ ] Run `npm run build` and point Nginx to `dist/`.

---

## 3. Nginx Configuration

**Status:** Required for production.

Nginx serves as the reverse proxy:
- Frontend static files (`dist/`) on port `80`/`443`.
- Proxies `/api/*` requests to the Express backend on port `5000`.

```nginx
server {
    listen 80;
    server_name pronosbox.com www.pronosbox.com;

    # Frontend (Vite build)
    root /var/www/pronosbox/dist;
    index index.html;
    try_files $uri $uri/ /index.html; # React Router SPA fallback

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Action Items:**
- [ ] Install Nginx on Contabo VPS.
- [ ] Configure the server block above.
- [ ] Obtain SSL certificate with Certbot: `sudo certbot --nginx -d pronosbox.com`.

---

## 4. Custom Image Storage — Disaster Recovery 💾

**Status:** Planned after production stability.

Once the application is fully stable and configured (Nginx + PM2 + MongoDB + SSL), create a **Contabo Custom Image** snapshot of the VPS.

This allows instant recovery or staging environment creation in minutes.

**Action Items:**
- [ ] Reach stable production state (Phase 3 complete).
- [ ] Create snapshot via the Contabo Cloud Control Panel.
- [ ] Store and document the snapshot ID.

---

## TL;DR Priority Order

1. 🔒 **Secure MongoDB** (bind localhost + ufw) — Do this before going live.
2. ⚙️ **PM2** — Ensures the server survives crashes and reboots.
3. 🌐 **Nginx + SSL** — Makes the site accessible on `https://pronosbox.com`.
4. 💾 **Custom Image** — Insurance policy once everything is stable.
