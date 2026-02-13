const { db, db_helpers } = require('..backend/models/database');
const { generateLinkId } = require('..backend/utils/linkGenerator');
const { calculateExpiryDate, isExpired } = require('..backend/utils/dateHelpers');
const { hashPassword, verifyPassword } = require('..backend/utils/passwordHelper');
const config = require('../config/config');
const fs = require('fs').promises;

/**
 * Upload content with ALL bonus features
 */
async function uploadContent(req, res, next) {
  try {
    const {
      content_type,
      text_content,
      expiry_minutes,
      password,           // BONUS: Password protection
      is_one_time,        // BONUS: One-time view
      max_views           // BONUS: View limit
    } = req.body;

    const linkId = generateLinkId();
    const userId = req.user ? req.user.id : null; // Optional auth

    // Calculate expiry
    const expiryMinutes = expiry_minutes 
      ? parseInt(expiry_minutes) 
      : config.DEFAULT_EXPIRY_MINUTES;
    const expiryDate = calculateExpiryDate(expiryMinutes);

    // Prepare data
    let data = {
      link_id: linkId,
      user_id: userId,
      content_type,
      expiry_date: expiryDate.toISOString(),
      is_one_time: is_one_time === 'true' || is_one_time === true ? 1 : 0,
      max_views: max_views ? parseInt(max_views) : null,
      password_hash: password ? await hashPassword(password) : null
    };

    if (content_type === 'text') {
      data.text_content = text_content;
    } else if (content_type === 'file') {
      data.file_name = req.file.originalname;
      data.file_path = req.file.path;
      data.file_size = req.file.size;
      data.file_mime_type = req.file.mimetype;
    }

    // Insert into database
    const sql = `
      INSERT INTO content (
        link_id, user_id, content_type, text_content, 
        file_name, file_path, file_size, file_mime_type, 
        expiry_date, is_one_time, max_views, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db_helpers.run(sql, [
      data.link_id,
      data.user_id,
      data.content_type,
      data.text_content || null,
      data.file_name || null,
      data.file_path || null,
      data.file_size || null,
      data.file_mime_type || null,
      data.expiry_date,
      data.is_one_time,
      data.max_views,
      data.password_hash
    ]);

    // Build share URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/view/${linkId}`;

    res.status(201).json({
      success: true,
      data: {
        link_id: linkId,
        share_url: shareUrl,
        content_type,
        expiry_date: expiryDate,
        expires_in_minutes: expiryMinutes,
        has_password: !!password,
        is_one_time: data.is_one_time === 1,
        max_views: data.max_views
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file after error:', unlinkError);
      }
    }
    next(error);
  }
}

/**
 * Get content with password and view limit checks
 */
async function getContent(req, res, next) {
  try {
    const { linkId } = req.params;
    const { password } = req.body; // Password sent in body

    // Query database
    const sql = `
      SELECT * FROM content 
      WHERE link_id = ? AND is_deleted = 0
    `;

    const row = await db_helpers.get(sql, [linkId]);

    if (!row) {
      return res.status(404).json({
        error: 'Content not found',
        message: 'The link is invalid or the content has been deleted'
      });
    }

    // Check expiry
    if (isExpired(row.expiry_date)) {
      await markAsDeleted(row.id, row.file_path);
      return res.status(410).json({
        error: 'Content expired',
        message: 'This link has expired'
      });
    }

    // BONUS: Check view limit
    if (row.max_views !== null && row.view_count >= row.max_views) {
      await markAsDeleted(row.id, row.file_path);
      return res.status(410).json({
        error: 'View limit reached',
        message: 'This content has reached its maximum view limit'
      });
    }

    // BONUS: Check password
    if (row.password_hash) {
      if (!password) {
        return res.status(401).json({
          error: 'Password required',
          message: 'This content is password protected',
          requires_password: true
        });
      }

      const isValidPassword = await verifyPassword(password, row.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Incorrect password',
          message: 'The password you entered is incorrect',
          requires_password: true
        });
      }
    }

    // Increment view count
    await db_helpers.run(
      'UPDATE content SET view_count = view_count + 1 WHERE id = ?',
      [row.id]
    );

    // Log access (for analytics)
    await logAccess(row.id, req);

    // BONUS: One-time link - delete after viewing
    if (row.is_one_time) {
      await markAsDeleted(row.id, row.file_path);
    }

    // Return content
    const response = {
      success: true,
      data: {
        content_type: row.content_type,
        created_at: row.created_at,
        expires_at: row.expiry_date,
        view_count: row.view_count + 1,
        max_views: row.max_views,
        is_one_time: row.is_one_time === 1
      }
    };

    if (row.content_type === 'text') {
      response.data.text_content = row.text_content;
    } else {
      response.data.file_name = row.file_name;
      response.data.file_size = row.file_size;
      response.data.file_mime_type = row.file_mime_type;
      response.data.download_url = `/api/download/${linkId}`;
    }

    if (row.is_one_time) {
      response.data.message = 'This was a one-time link and has been deleted';
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Download file with same checks as getContent
 */
async function downloadFile(req, res, next) {
  try {
    const { linkId } = req.params;
    const { password } = req.query; // Password can be in query for download links

    const sql = `
      SELECT * FROM content 
      WHERE link_id = ? AND content_type = 'file' AND is_deleted = 0
    `;

    const row = await db_helpers.get(sql, [linkId]);

    if (!row) {
      return res.status(404).json({
        error: 'File not found'
      });
    }

    // Check expiry
    if (isExpired(row.expiry_date)) {
      await markAsDeleted(row.id, row.file_path);
      return res.status(410).json({
        error: 'File expired'
      });
    }

    // Check view limit
    if (row.max_views !== null && row.view_count >= row.max_views) {
      await markAsDeleted(row.id, row.file_path);
      return res.status(410).json({
        error: 'Download limit reached'
      });
    }

    // Check password
    if (row.password_hash) {
      if (!password) {
        return res.status(401).json({
          error: 'Password required',
          requires_password: true
        });
      }

      const isValidPassword = await verifyPassword(password, row.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Incorrect password'
        });
      }
    }

    // Check file exists
    try {
      await fs.access(row.file_path);
    } catch {
      return res.status(404).json({
        error: 'File not found on server'
      });
    }

    // Send file
    res.download(row.file_path, row.file_name);
  } catch (error) {
    next(error);
  }
}

/**
 * BONUS: Manual delete (user must own the content)
 */
async function deleteContent(req, res, next) {
  try {
    const { linkId } = req.params;
    const userId = req.user.id;

    // Find content
    const sql = `
      SELECT * FROM content 
      WHERE link_id = ? AND user_id = ? AND is_deleted = 0
    `;

    const row = await db_helpers.get(sql, [linkId, userId]);

    if (!row) {
      return res.status(404).json({
        error: 'Content not found',
        message: 'Content not found or you do not have permission to delete it'
      });
    }

    // Mark as deleted
    await markAsDeleted(row.id, row.file_path);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

// Helper functions
async function markAsDeleted(contentId, filePath) {
  // Mark in database
  await db_helpers.run(
    'UPDATE content SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
    [contentId]
  );

  // Delete file if exists
  if (filePath) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
}

async function logAccess(contentId, req) {
  try {
    const sql = `
      INSERT INTO access_logs (content_id, ip_address, user_agent)
      VALUES (?, ?, ?)
    `;
    
    await db_helpers.run(sql, [
      contentId,
      req.ip || req.connection.remoteAddress,
      req.get('user-agent') || 'Unknown'
    ]);
  } catch (err) {
    console.error('Error logging access:', err);
  }
}

module.exports = {
  uploadContent,
  getContent,
  downloadFile,
  deleteContent
};