const fs = require('fs');
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

// --- FIX 1: Ensure Uploads Directory Exists (CRITICAL) ---
// This prevents 500 errors when Multer tries to access the folder
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created missing upload directory: ${uploadDir}`);
  } catch (err) {
    console.error(`❌ Failed to create upload directory: ${err.message}`);
  }
}

// --- FIX 2: Request Logger (Helps Debugging) ---
// Logs every request so you can see if it's a 404, 500, or CORS issue
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN || 'http://localhost:5173', // Fallback to Vite default
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy
app.set('trust proxy', true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start cleanup job
startCleanupJob();

// --- FIX 3: Explicit Port Logging ---
const PORT = config.PORT || 5001; // Ensure 5001 is used if config is missing

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  LinkVault Server Started                 ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                       ║
║  URL:         http://localhost:${PORT}                      ║
║  Upload Dir:  ${uploadDir}                        ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});