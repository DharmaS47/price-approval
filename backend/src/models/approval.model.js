const db = require('../config/database');

class Approval {
  static async findAll(filters = {}) {
    let query = `
      SELECT a.*, u.name as requester_name, u.email as requester_email
      FROM price_approvals a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.user_id) {
      query += ` AND a.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT a.*, 
              u.name as requester_name, 
              u.email as requester_email,
              approver.name as approver_name,
              approver.email as approver_email
       FROM price_approvals a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN users approver ON a.approved_by = approver.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(approvalData) {
    const { 
      user_id, 
      product_name, 
      current_price, 
      proposed_price, 
      justification 
    } = approvalData;

    const result = await db.query(
      `INSERT INTO price_approvals 
       (user_id, product_name, current_price, proposed_price, justification, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') 
       RETURNING *`,
      [user_id, product_name, current_price, proposed_price, justification]
    );
    return result.rows[0];
  }

  static async update(id, approvalData) {
    const { product_name, current_price, proposed_price, justification } = approvalData;
    
    const result = await db.query(
      `UPDATE price_approvals 
       SET product_name = COALESCE($1, product_name),
           current_price = COALESCE($2, current_price),
           proposed_price = COALESCE($3, proposed_price),
           justification = COALESCE($4, justification),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND status = 'pending'
       RETURNING *`,
      [product_name, current_price, proposed_price, justification, id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, approver_id, comments) {
    const result = await db.query(
      `UPDATE price_approvals 
       SET status = $1,
           approved_by = $2,
           approval_date = CURRENT_TIMESTAMP,
           comments = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND status = 'pending'
       RETURNING *`,
      [status, approver_id, comments, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM price_approvals WHERE id = $1 AND status = $2 RETURNING id',
      [id, 'pending']
    );
    return result.rows[0];
  }
}

module.exports = Approval;
