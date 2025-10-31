import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',
  password: 'MaNc@432',
  host: 'localhost',
  port: 5432,
  database: 'citizen_app'
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL!');
    
    // Test tables
    const users = await client.query('SELECT COUNT(*) FROM users');
    const services = await client.query('SELECT COUNT(*) FROM service_requests');
    
    console.log('Users count:', users.rows[0]);
    console.log('Services count:', services.rows[0]);
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

test();