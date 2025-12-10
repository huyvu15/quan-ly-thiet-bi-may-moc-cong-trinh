const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

const isCloudDatabase = !!(process.env.PG_HOST || process.env.DB_HOST);
const isLocalhost = (process.env.PG_HOST || process.env.DB_HOST || '').includes('localhost');

const pool = new Pool({
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
  database: process.env.PG_DATABASE || process.env.DB_NAME || 'construction_machines',
  user: process.env.PG_USER || process.env.DB_USER || 'postgres',
  password: process.env.PG_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  ssl: isCloudDatabase && !isLocalhost 
    ? { rejectUnauthorized: false } 
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

console.log('Database Configuration:', {
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
  database: process.env.PG_DATABASE || process.env.DB_NAME || 'construction_machines',
  user: process.env.PG_USER || process.env.DB_USER || 'postgres',
  ssl: isCloudDatabase && !isLocalhost ? 'enabled' : 'disabled',
  isCloudDatabase,
  isLocalhost
});

module.exports = pool;

