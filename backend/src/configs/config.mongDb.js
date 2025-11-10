"use strict";

require('dotenv').config();

const development = {
  db: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'e_Learning_dev',
  },
};

const production = {  
  db: {
    host: process.env.PRO_DB_HOST || 'localhost',
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || 'e_Learning_prod',
  },
};

const config = { development, production }; 
const env = process.env.NODE_ENV || "development";

console.log(`🔧 Config loaded for environment: ${env}`);

module.exports = config[env];