"use strict";

require('dotenv').config();
const development = {
  db: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'e_Learning_dev',
  },
};

const pro = {
  db: {
    host: process.env.PRO_DB_HOST || 'localhost',
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || 'e_Learning_prod',
  },
};

const config = { development, pro };
const env = process.env.NODE_ENV || "development";
module.exports = config[env];