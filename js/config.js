/**
 * HoyJob Frontend Configuration
 * This file handles environment-specific variables for the static frontend.
 */

const CONFIG = {
  development: {
    API_BASE: 'http://localhost:5000/api',
    SOCKET_URL: 'http://localhost:5000'
  },
  production: {
    // Replace this with your actual production backend URL after deployment
    API_BASE: 'https://hoyjob-api.onrender.com/api', 
    SOCKET_URL: 'https://hoyjob-api.onrender.com'
  }
};

// Auto-detect environment based on hostname
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const ENV = isLocal ? CONFIG.development : CONFIG.production;

// Export as global variable for use in other scripts
window.HJ_CONFIG = ENV;
