module.exports = {
  apps: [
    {
      name: 'pronobox-backend',
      script: './src/server.js',
      instances: 1, // Safe & conservative memory usage for standard VPS
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    }
  ]
};
