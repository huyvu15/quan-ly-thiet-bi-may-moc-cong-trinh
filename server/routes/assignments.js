const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { project_id, machine_id } = req.query;
    let query = `
      SELECT ma.*, m.code, m.name as machine_name, m.category, m.status as machine_status,
             p.name as project_name
      FROM machine_assignments ma
      JOIN machines m ON ma.machine_id = m.id
      LEFT JOIN projects p ON ma.project_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (project_id) {
      query += ` AND ma.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }
    
    if (machine_id) {
      query += ` AND ma.machine_id = $${paramIndex}`;
      params.push(machine_id);
      paramIndex++;
    }
    
    query += ' ORDER BY ma.assign_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ma.*, m.code, m.name as machine_name, m.category, m.status as machine_status,
             p.name as project_name
      FROM machine_assignments ma
      JOIN machines m ON ma.machine_id = m.id
      LEFT JOIN projects p ON ma.project_id = p.id
      WHERE ma.return_date IS NULL
      ORDER BY ma.assign_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { machine_id, project_id, assign_date, assigned_by, notes } = req.body;
    
    // Tạo phân công
    const result = await client.query(
      `INSERT INTO machine_assignments (machine_id, project_id, assign_date, assigned_by, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [machine_id, project_id, assign_date || new Date().toISOString().split('T')[0], assigned_by || 'admin', notes]
    );
    
    // Cập nhật trạng thái máy móc thành "in_use"
    await client.query(
      `UPDATE machines SET status = 'in_use', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [machine_id]
    );
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.put('/:id/return', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { return_date, notes } = req.body;
    
    // Lấy thông tin phân công
    const assignmentResult = await client.query(
      'SELECT * FROM machine_assignments WHERE id = $1',
      [req.params.id]
    );
    
    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    const assignment = assignmentResult.rows[0];
    
    // Cập nhật ngày trả
    const result = await client.query(
      `UPDATE machine_assignments 
       SET return_date = $1, notes = COALESCE($2, notes)
       WHERE id = $3 RETURNING *`,
      [return_date || new Date().toISOString().split('T')[0], notes, req.params.id]
    );
    
    // Cập nhật trạng thái máy móc thành "available"
    await client.query(
      `UPDATE machines SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [assignment.machine_id]
    );
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM machine_assignments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

