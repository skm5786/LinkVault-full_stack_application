const { db_helpers } = require('./database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `;
    
    const result = await db_helpers.run(sql, [username, email, hashedPassword]);
    return result.id;
  }

  static async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    return await db_helpers.get(sql, [username]);
  }

  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    return await db_helpers.get(sql, [email]);
  }

  static async findById(id) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    return await db_helpers.get(sql, [id]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId) {
    const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
    await db_helpers.run(sql, [userId]);
  }
}

module.exports = User;