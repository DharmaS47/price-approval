const db = require('../config/database');

class User {
  static async findAll() {
    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { email, password_hash, name, role } = userData;
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, created_at`,
      [email, password_hash, name, role || 'user']
    );
    return result.rows[0];
  }

  static async update(id, userData) {
    const { name, role } = userData;
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           role = COALESCE($2, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING id, email, name, role, updated_at`,
      [name, role, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;
