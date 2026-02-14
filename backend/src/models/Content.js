const { db } = require('./database');
const bcrypt = require('bcrypt');

class Content {
  // Create new content
  static async create(contentData) {
    const {
      uniqueId,
      userId,
      contentType,
      textContent,
      filePath,
      fileName,
      fileSize,
      mimeType,
      expiresAt,
      password,
      isOneTime,
      maxViews
    } = contentData;

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO content (
          unique_id, user_id, content_type, text_content,
          file_path, file_name, file_size, mime_type,
          expires_at, password_hash, is_one_time, max_views
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        uniqueId,
        userId,
        contentType,
        textContent || null,
        filePath || null,
        fileName || null,
        fileSize || null,
        mimeType || null,
        expiresAt,
        passwordHash,
        isOneTime ? 1 : 0,
        maxViews || null
      ];

      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Find content by unique ID
  static async findByUniqueId(uniqueId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.*, u.username as creator_username
        FROM content c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.unique_id = ? AND c.deleted_at IS NULL
      `;

      db.get(sql, [uniqueId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find content by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.*, u.username as creator_username
        FROM content c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ? AND c.deleted_at IS NULL
      `;

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all content for a user
  static async findByUserId(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM content
        WHERE user_id = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Increment view count
  static async incrementViewCount(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE content
        SET view_count = view_count + 1, last_accessed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Verify password
  static async verifyPassword(plainPassword, passwordHash) {
    if (!passwordHash) return true; // No password set
    return bcrypt.compare(plainPassword, passwordHash);
  }

  // Soft delete content
  static async softDelete(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE content
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Hard delete content (actually remove from database)
  static async hardDelete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM content WHERE id = ?';

      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Find expired content
  static async findExpired() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM content
        WHERE expires_at <= CURRENT_TIMESTAMP
        AND deleted_at IS NULL
      `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Find content that has reached max views
  static async findMaxViewsReached() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM content
        WHERE max_views IS NOT NULL
        AND view_count >= max_views
        AND deleted_at IS NULL
      `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Check if content should be deleted (one-time and already viewed)
  static async shouldDeleteOneTime(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT is_one_time, view_count
        FROM content
        WHERE id = ?
      `;

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row && row.is_one_time === 1 && row.view_count > 0);
        }
      });
    });
  }

  // Get content statistics for a user
  static async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          COUNT(*) as total_content,
          SUM(CASE WHEN content_type = 'text' THEN 1 ELSE 0 END) as text_count,
          SUM(CASE WHEN content_type = 'file' THEN 1 ELSE 0 END) as file_count,
          SUM(view_count) as total_views,
          SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as active_content
        FROM content
        WHERE user_id = ?
      `;

      db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = Content;