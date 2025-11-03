import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Database configuration (Neon compatible)
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};


// Create connection pool
const pool = new Pool(dbConfig);

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL database connected successfully');

    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📊 Database time:', result.rows[0].current_time);

    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

pool.on('connect', () => {
  console.log('🔗 New database connection established');
});

pool.on('error', (err) => {
  console.error('💥 Database pool error:', err);
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed from pool');
});

// Initialize connection
testConnection();

export const query = (text, params) => {
  console.log('📝 Executing query:', text.substring(0, 100) + '...');
  return pool.query(text, params);
};

export { pool };
