const path = require('path');
const config = require('../config/config');

// Multer file filter for security

function fileFilter(req, file, cb) {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (config.BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File type ${ext} is not allowed for security reasons`), false);
  }

  // Check MIME type
  if (!config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }

  // All checks passed
  cb(null, true);
}

module.exports = fileFilter;