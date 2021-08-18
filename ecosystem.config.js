module.exports = {
  apps: [{
    name: 'ddns',
    script: 'index.js',
  
    max_memory_restart: '1G',

    out_file: './logs/out.log',
    error_file: './logs/error.log',
  }]
};
