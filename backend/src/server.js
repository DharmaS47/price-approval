require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const approvalRoutes = require('./routes/approval.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());

// CORS configuration - MUST be before other middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/approvals', approvalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Function to run database migrations
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
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Function to create default admin user
async function createDefaultAdmin() {
  console.log('👤 Checking for default admin user...');
  
  try {
    // Check if admin user exists
    const result = await db.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@priceapproval.com']
    );

    if (result.rows.length === 0) {
      // Create admin user
      const password = 'Admin@123456';
      const passwordHash = await bcrypt.hash(password, 10);
      
      await db.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        ['admin@priceapproval.com', passwordHash, 'System Admin', 'admin']
      );
      
      console.log('✅ Default admin user created!');
      console.log('📧 Email: admin@priceapproval.com');
      console.log('🔑 Password: Admin@123456');
      console.log('⚠️  Please change this password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    // Don't throw - this is not critical for server startup
  }
}

// Initialize database and start server
async function startServer() {
  try {
    // Run migrations first
    await runMigrations();
    
    // Create default admin user
    await createDefaultAdmin();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:4200'}`);
      console.log(`🗄️  Database: Connected and migrated`);
      console.log('');
      console.log('========================================');
      console.log('🎉 Price Approval System Ready!');
      console.log('========================================');
      console.log('');
      console.log('📧 Default Admin Login:');
      console.log('   Email: admin@priceapproval.com');
      console.log('   Password: Admin@123456');
      console.log('');
      console.log('========================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.end();
  process.exit(0);
});
