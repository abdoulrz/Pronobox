#!/bin/bash

echo "🚀 Starting deployment for PronosBox..."
cd /var/www/pronosbox || exit

echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo "📦 Installing backend and frontend dependencies..."
npm install

echo "🏗️ Building production React frontend..."
npm run build

echo "🔄 Restarting backend server via PM2..."
pm2 reload ecosystem.config.cjs --update-env

echo "✅ Deployment complete! The live site has been updated."
