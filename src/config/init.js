import { pool } from '../config/database.js'
const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create service_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        exact_location TEXT,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_service_requests_user_id 
      ON service_requests(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_service_requests_status 
      ON service_requests(status)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users(email)
    `);

    console.log('✅ Database tables created successfully');

    // Check current data
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const requestCount = await pool.query('SELECT COUNT(*) FROM service_requests');
    
    console.log(`📊 Current stats: ${userCount.rows[0].count} users, ${requestCount.rows[0].count} service requests`);

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Run initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('✅ Database initialization complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database initialization failed');
      process.exit(1);
    });
}

export { initDatabase };