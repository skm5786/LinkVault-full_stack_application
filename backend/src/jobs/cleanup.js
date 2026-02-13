const cron = require('node-cron');
const { db_helpers } = require('../models/database');
const fs = require('fs').promises;
const config = require('../config/config');

/**
 * Cleanup expired content
 * Runs on schedule defined in config
 */
function startCleanupJob() {
  console.log(`Starting cleanup job with schedule: ${config.CLEANUP_CRON_SCHEDULE}`);
  
  cron.schedule(config.CLEANUP_CRON_SCHEDULE, async () => {
    try {
      console.log('[Cleanup] Running cleanup job...');
      
      // Find expired content that hasn't been deleted
      const sql = `
        SELECT id, link_id, file_path, content_type
        FROM content
        WHERE is_deleted = 0 
        AND expiry_date < CURRENT_TIMESTAMP
      `;

      const expiredContent = await db_helpers.all(sql, []);

      if (expiredContent.length === 0) {
        console.log('[Cleanup] No expired content found');
        return;
      }

      console.log(`[Cleanup] Found ${expiredContent.length} expired items`);

      let deletedCount = 0;
      let failedCount = 0;

      for (const item of expiredContent) {
        try {
          // Mark as deleted in database
          await db_helpers.run(
            'UPDATE content SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
            [item.id]
          );

          // Delete file if it exists
          if (item.file_path) {
            try {
              await fs.access(item.file_path);
              await fs.unlink(item.file_path);
              console.log(`[Cleanup] Deleted file: ${item.file_path}`);
            } catch (fileErr) {
              console.log(`[Cleanup] File not found or already deleted: ${item.file_path}`);
            }
          }

          deletedCount++;
        } catch (err) {
          console.error(`[Cleanup] Failed to delete content ${item.link_id}:`, err);
          failedCount++;
        }
      }

      console.log(`[Cleanup] Completed: ${deletedCount} deleted, ${failedCount} failed`);

      // Optional: Clean up old access logs (keep last 30 days)
      await cleanupOldLogs();

    } catch (error) {
      console.error('[Cleanup] Error running cleanup job:', error);
    }
  });
}

/**
 * Clean up old access logs to keep database size manageable
 */
async function cleanupOldLogs() {
  try {
    const sql = `
      DELETE FROM access_logs 
      WHERE accessed_at < datetime('now', '-30 days')
    `;
    
    const result = await db_helpers.run(sql, []);
    
    if (result.changes > 0) {
      console.log(`[Cleanup] Removed ${result.changes} old access logs`);
    }
  } catch (error) {
    console.error('[Cleanup] Error cleaning up logs:', error);
  }
}

/**
 * Manual cleanup function (can be called via API endpoint if needed)
 */
async function runManualCleanup() {
  console.log('[Cleanup] Running manual cleanup...');
  
  const sql = `
    SELECT id, link_id, file_path
    FROM content
    WHERE is_deleted = 0 
    AND expiry_date < CURRENT_TIMESTAMP
  `;

  const expiredContent = await db_helpers.all(sql, []);

  for (const item of expiredContent) {
    await db_helpers.run(
      'UPDATE content SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [item.id]
    );

    if (item.file_path) {
      try {
        await fs.unlink(item.file_path);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }
  }

  return expiredContent.length;
}

module.exports = { startCleanupJob, runManualCleanup };