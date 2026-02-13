const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// Routes
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Database
const { db } = require('./models/database');

// Background jobs
const { startCleanupJob } = require('./jobs/cleanup');

const app = express();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for getting real IP addresses)
app.set('trust proxy', true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: {
      authentication: true,
      password_protection: true,
      one_time_links: true,
      view_limits: true,
      manual_delete: true,
      background_cleanup: true
    }
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start cleanup job
startCleanupJob();

// Start server
const server = app.listen(config.PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  LinkVault Server Started                 ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${config.PORT}                                       ║
║  Environment: ${config.NODE_ENV}                          ║
║  Features:    ALL (Core + Bonus)                          ║
╠═══════════════════════════════════════════════════════════╣
║  ✅ Authentication & User Accounts                        ║
║  ✅ Password-Protected Links                              ║
║  ✅ One-Time View Links                                   ║
║  ✅ View/Download Limits                                  ║
║  ✅ Manual Delete                                         ║
║  ✅ Background Cleanup Job                                ║
║  ✅ File Type Validation                                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});