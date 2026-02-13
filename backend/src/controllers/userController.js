const { db_helpers } = require('../models/database');

/**
 * Get user's upload history
 */
async function getUserContent(req, res, next) {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        id,
        link_id,
        content_type,
        file_name,
        file_size,
        expiry_date,
        created_at,
        view_count,
        max_views,
        is_one_time,
        is_deleted,
        password_hash IS NOT NULL as has_password
      FROM content
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const contents = await db_helpers.all(sql, [userId]);

    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get statistics for user
 */
async function getUserStats(req, res, next) {
  try {
    const userId = req.user.id;

    const stats = {
      total_uploads: 0,
      active_uploads: 0,
      expired_uploads: 0,
      total_views: 0
    };

    // Total uploads
    const totalSql = `SELECT COUNT(*) as count FROM content WHERE user_id = ?`;
    const totalResult = await db_helpers.get(totalSql, [userId]);
    stats.total_uploads = totalResult.count;

    // Active uploads (not deleted, not expired)
    const activeSql = `
      SELECT COUNT(*) as count 
      FROM content 
      WHERE user_id = ? AND is_deleted = 0 AND expiry_date > CURRENT_TIMESTAMP
    `;
    const activeResult = await db_helpers.get(activeSql, [userId]);
    stats.active_uploads = activeResult.count;

    // Expired/deleted
    stats.expired_uploads = stats.total_uploads - stats.active_uploads;

    // Total views
    const viewsSql = `
      SELECT SUM(view_count) as total 
      FROM content 
      WHERE user_id = ?
    `;
    const viewsResult = await db_helpers.get(viewsSql, [userId]);
    stats.total_views = viewsResult.total || 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserContent,
  getUserStats
};