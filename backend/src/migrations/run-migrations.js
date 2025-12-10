require('dotenv').config();
const db = require('../config/database');

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created/verified');

    // Create price_approvals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS price_approvals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        current_price DECIMAL(10, 2) NOT NULL,
        proposed_price DECIMAL(10, 2) NOT NULL,
        justification TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        approved_by INTEGER REFERENCES users(id),
        approval_date TIMESTAMP,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Price approvals table created/verified');

    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_approvals_user_id ON price_approvals(user_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON price_approvals(status);
      CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON price_approvals(created_at DESC);
    `);
    console.log('✅ Indexes created/verified');

    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
