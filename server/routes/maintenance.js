const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mr.*, m.code, m.name as machine_name, m.category,
             p.name as project_name, s.name as supplier_name
      FROM maintenance_records mr
      JOIN machines m ON mr.machine_id = m.id
      LEFT JOIN projects p ON mr.project_id = p.id
      LEFT JOIN suppliers s ON mr.supplier_id = s.id
      ORDER BY mr.maintenance_date DESC, mr.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mr.*, m.code, m.name as machine_name, m.category,
             p.name as project_name, s.name as supplier_name
      FROM maintenance_records mr
      JOIN machines m ON mr.machine_id = m.id
      LEFT JOIN projects p ON mr.project_id = p.id
      LEFT JOIN suppliers s ON mr.supplier_id = s.id
      WHERE mr.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { record_number, machine_id, project_id, supplier_id, maintenance_date, 
            maintenance_type, cost, description, next_maintenance_date, performed_by, created_by } = req.body;
    
    // Tạo bản ghi bảo trì
    const result = await client.query(
      `INSERT INTO maintenance_records (record_number, machine_id, project_id, supplier_id, 
        maintenance_date, maintenance_type, cost, description, next_maintenance_date, performed_by, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [record_number, machine_id, project_id, supplier_id, maintenance_date || new Date().toISOString().split('T')[0],
       maintenance_type, cost || 0, description, next_maintenance_date, performed_by, created_by || 'admin']
    );
    
    // Cập nhật trạng thái máy móc nếu là bảo trì định kỳ
    if (maintenance_type === 'preventive' || maintenance_type === 'repair') {
      await client.query(
        `UPDATE machines SET status = 'maintenance', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [machine_id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Maintenance record number already exists' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { record_number, machine_id, project_id, supplier_id, maintenance_date, 
            maintenance_type, cost, description, next_maintenance_date, performed_by } = req.body;
    const result = await pool.query(
      `UPDATE maintenance_records SET record_number = $1, machine_id = $2, project_id = $3, 
       supplier_id = $4, maintenance_date = $5, maintenance_type = $6, cost = $7, 
       description = $8, next_maintenance_date = $9, performed_by = $10
       WHERE id = $11 RETURNING *`,
      [record_number, machine_id, project_id, supplier_id, maintenance_date, maintenance_type,
       cost, description, next_maintenance_date, performed_by, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

