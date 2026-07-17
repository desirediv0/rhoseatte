module.exports = {
  apps: [
    {
      name: 'rhoseatte-client',
      cwd: '/root/rhoseatte/client',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3007,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/rhoseatte-client-error.log",
      out_file: "/root/.pm2/logs/rhoseatte-client-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      name: 'rhoseatte-admin',
      cwd: '/root/rhoseatte/front',
      script: 'npm',
      args: 'run preview',
      env: {
        PORT: 4178,
        NODE_ENV: 'production',
        HOST: '0.0.0.0'
      },
      error_file: "/root/.pm2/logs/rhoseatte-admin-error.log",
      out_file: "/root/.pm2/logs/rhoseatte-admin-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      name: 'rhoseatte-server',
      cwd: '/root/rhoseatte/server',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 4008,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/rhoseatte-server-error.log",
      out_file: "/root/.pm2/logs/rhoseatte-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
  ]
};