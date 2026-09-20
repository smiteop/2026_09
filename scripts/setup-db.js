require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'doctor_booking_db';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASS || 'postgres';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;

  console.log(`Connecting to PostgreSQL at ${host}:${port} as user '${user}'...`);

  // Connect to default 'postgres' database first
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server.');

    // Check if database exists
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating now...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`🎉 Database '${dbName}' created successfully!`);
    } else {
      console.log(`ℹ️ Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
