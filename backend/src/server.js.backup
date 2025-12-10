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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
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
    await db.query();
    console.log('✅ Users table created/verified');

    // Create price_approvals table
    await db.query();
    console.log('✅ Price approvals table created/verified');

    // Create indexes
    await db.query();
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
        ,
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
      console.log();
      console.log();
      console.log();
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
