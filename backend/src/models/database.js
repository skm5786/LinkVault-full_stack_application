const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeSchema();
  }
});

function initializeSchema() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // Content table (enhanced with all features)
    db.run(`
      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        content_type TEXT NOT NULL CHECK(content_type IN ('text', 'file')),
        
        -- Content data
        text_content TEXT,
        file_name TEXT,
        file_path TEXT,
        file_size INTEGER,
        file_mime_type TEXT,
        
        -- Expiry and timing
        expiry_date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Access controls (BONUS FEATURES)
        password_hash TEXT DEFAULT NULL,
        is_one_time BOOLEAN DEFAULT 0,
        max_views INTEGER DEFAULT NULL,
        view_count INTEGER DEFAULT 0,
        
        -- Status
        is_deleted BOOLEAN DEFAULT 0,
        deleted_at DATETIME DEFAULT NULL,
        
        -- Foreign key
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Access logs table (track who accessed what)
    db.run(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_id INTEGER NOT NULL,
        accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
      )
    `);

    // Indexes for performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_link_id ON content(link_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON content(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_expiry ON content(expiry_date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_deleted ON content(is_deleted)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_username ON users(username)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_email ON users(email)`);

    console.log('Database schema initialized with all features');
  });
}

// Helper functions for database operations
const db_helpers = {
  // Promisify db.run
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  // Promisify db.get
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Promisify db.all
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = { db, db_helpers };