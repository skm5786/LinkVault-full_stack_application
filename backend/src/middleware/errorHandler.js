function errorHandler(err, req, res, next) {
    console.error('Error:', err);
  
    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 50MB'
      });
    }
  
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Invalid file field',
        message: 'Expected field name: "file"'
      });
    }
  
    // File filter errors (from multer)
    if (err.message && err.message.includes('not allowed')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: err.message
      });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Authentication token has expired'
      });
    }
  
    // Database errors
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({
        error: 'Database constraint violation',
        message: 'A unique constraint was violated'
      });
    }
  
    // Default error response
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }