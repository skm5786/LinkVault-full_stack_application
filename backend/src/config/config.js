require('dotenv').config();

module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: '7d', // 7 days
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // File uploads
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  UPLOAD_DIR: 'uploads/',
  
  // Allowed file types (security)
  ALLOWED_MIME_TYPES: [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
    // Archives
    'application/zip', 'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Code
    'application/json', 'application/xml',
  ],
  
  // Blocked file extensions (security)
  BLOCKED_EXTENSIONS: ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'],
  
  // Content settings
  DEFAULT_EXPIRY_MINUTES: 10,
  MAX_EXPIRY_DAYS: 30,
  MIN_EXPIRY_MINUTES: 1,
  
  // Cleanup job
  CLEANUP_CRON_SCHEDULE: '*/5 * * * *', // Every 5 minutes
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
};