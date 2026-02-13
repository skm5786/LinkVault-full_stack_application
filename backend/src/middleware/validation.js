const config = require('../config/config');

/**
 * Validate upload request
 */
function validateUpload(req, res, next) {
  const { content_type, text_content, expiry_minutes, max_views } = req.body;

  // Check content type
  if (!content_type || !['text', 'file'].includes(content_type)) {
    return res.status(400).json({
      error: 'Invalid content_type',
      message: 'Must be "text" or "file"'
    });
  }

  // Validate text upload
  if (content_type === 'text') {
    if (!text_content || text_content.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing text_content',
        message: 'Text content cannot be empty'
      });
    }
    if (text_content.length > 1000000) { // 1MB text limit
      return res.status(400).json({
        error: 'Text too large',
        message: 'Maximum text size is 1MB'
      });
    }
  }

  // Validate file upload
  if (content_type === 'file' && !req.file) {
    return res.status(400).json({
      error: 'Missing file',
      message: 'No file was uploaded'
    });
  }

  // Validate expiry
  if (expiry_minutes !== undefined && expiry_minutes !== null && expiry_minutes !== '') {
    const minutes = parseInt(expiry_minutes);
    if (isNaN(minutes) || minutes < config.MIN_EXPIRY_MINUTES) {
      return res.status(400).json({
        error: 'Invalid expiry_minutes',
        message: `Must be at least ${config.MIN_EXPIRY_MINUTES} minute(s)`
      });
    }
    const maxMinutes = config.MAX_EXPIRY_DAYS * 24 * 60;
    if (minutes > maxMinutes) {
      return res.status(400).json({
        error: 'Expiry too long',
        message: `Maximum expiry is ${config.MAX_EXPIRY_DAYS} days`
      });
    }
  }

  // Validate max_views if provided
  if (max_views !== undefined && max_views !== null && max_views !== '') {
    const views = parseInt(max_views);
    if (isNaN(views) || views < 1) {
      return res.status(400).json({
        error: 'Invalid max_views',
        message: 'Max views must be a positive integer'
      });
    }
  }

  next();
}

module.exports = { validateUpload };