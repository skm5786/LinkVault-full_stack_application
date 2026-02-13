const Content = require('../models/Content');
const { generateUniqueId } = require('../utils/idGenerator');
const { calculateExpiryDate } = require('../utils/dateHelper');
const config = require('../config/config');
const path = require('path');
const fs = require('fs').promises;

// Upload text content
async function uploadText(req, res, next) {
  try {
    const { text, expiryMinutes, password, isOneTime, maxViews } = req.body;
    const userId = req.user.id;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Text content is required'
      });
    }

    if (text.length > config.MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: `Text must be less than ${config.MAX_TEXT_LENGTH} characters`
      });
    }

    // Validate expiry time
    const expiryTime = parseInt(expiryMinutes) || config.DEFAULT_EXPIRY_MINUTES;
    if (expiryTime < config.MIN_EXPIRY_MINUTES || expiryTime > config.MAX_EXPIRY_MINUTES) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expiry time',
        message: `Expiry time must be between ${config.MIN_EXPIRY_MINUTES} and ${config.MAX_EXPIRY_MINUTES} minutes`
      });
    }

    // Validate max views if provided
    if (maxViews !== undefined && maxViews !== null) {
      const views = parseInt(maxViews);
      if (views < 1 || views > config.MAX_VIEW_LIMIT) {
        return res.status(400).json({
          success: false,
          error: 'Invalid view limit',
          message: `Maximum views must be between 1 and ${config.MAX_VIEW_LIMIT}`
        });
      }
    }

    // Generate unique ID and calculate expiry
    const uniqueId = generateUniqueId();
    const expiresAt = calculateExpiryDate(expiryTime);

    // Create content record
    const contentId = await Content.create({
      uniqueId,
      userId,
      contentType: 'text',
      textContent: text,
      expiresAt,
      password: password || null,
      isOneTime: isOneTime || false,
      maxViews: maxViews || null
    });

    // Generate shareable URL
    const shareUrl = `${req.protocol}://${req.get('host')}/share/${uniqueId}`;

    res.status(201).json({
      success: true,
      message: 'Text content created successfully',
      data: {
        id: contentId,
        unique_id: uniqueId,
        share_url: shareUrl,
        content_type: 'text',
        expires_in_minutes: expiryTime,
        expires_at: expiresAt,
        has_password: !!password,
        is_one_time: isOneTime || false,
        max_views: maxViews || null
      }
    });
  } catch (error) {
    console.error('Text upload error:', error);
    next(error);
  }
}

// Upload file content
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    const { expiryMinutes, password, isOneTime, maxViews } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Validate expiry time
    const expiryTime = parseInt(expiryMinutes) || config.DEFAULT_EXPIRY_MINUTES;
    if (expiryTime < config.MIN_EXPIRY_MINUTES || expiryTime > config.MAX_EXPIRY_MINUTES) {
      // Delete uploaded file
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid expiry time',
        message: `Expiry time must be between ${config.MIN_EXPIRY_MINUTES} and ${config.MAX_EXPIRY_MINUTES} minutes`
      });
    }

    // Validate max views if provided
    if (maxViews !== undefined && maxViews !== null) {
      const views = parseInt(maxViews);
      if (views < 1 || views > config.MAX_VIEW_LIMIT) {
        await fs.unlink(file.path);
        return res.status(400).json({
          success: false,
          error: 'Invalid view limit',
          message: `Maximum views must be between 1 and ${config.MAX_VIEW_LIMIT}`
        });
      }
    }

    // Generate unique ID and calculate expiry
    const uniqueId = generateUniqueId();
    const expiresAt = calculateExpiryDate(expiryTime);

    // Create content record
    const contentId = await Content.create({
      uniqueId,
      userId,
      contentType: 'file',
      filePath: file.path,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      expiresAt,
      password: password || null,
      isOneTime: isOneTime === 'true' || isOneTime === true,
      maxViews: maxViews ? parseInt(maxViews) : null
    });

    // Generate shareable URL
    const shareUrl = `${req.protocol}://${req.get('host')}/share/${uniqueId}`;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: contentId,
        unique_id: uniqueId,
        share_url: shareUrl,
        content_type: 'file',
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        expires_in_minutes: expiryTime,
        expires_at: expiresAt,
        has_password: !!password,
        is_one_time: isOneTime === 'true' || isOneTime === true,
        max_views: maxViews ? parseInt(maxViews) : null
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => 
        console.error('Error deleting file:', err)
      );
    }
    next(error);
  }
}

module.exports = {
  uploadText,
  uploadFile
};