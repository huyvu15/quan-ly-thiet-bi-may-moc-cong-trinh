const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Thống kê bảo trì theo tháng
router.get('/maintenance-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(maintenance_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count,
        COALESCE(SUM(cost), 0)::DECIMAL as total_cost
      FROM maintenance_records
      GROUP BY TO_CHAR(maintenance_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê phân công máy móc theo tháng
router.get('/assignments-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(assign_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count
      FROM machine_assignments
      GROUP BY TO_CHAR(assign_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê máy móc theo loại
router.get('/machines-by-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(category, 'Khác') as category,
        COUNT(*)::INTEGER as count
      FROM machines
      GROUP BY category
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê máy móc theo trạng thái
router.get('/machines-by-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(status, 'available') as status,
        COUNT(*)::INTEGER as count
      FROM machines
      GROUP BY status
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê máy móc theo công trình
router.get('/machines-by-project', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(p.name, 'Chưa phân công') as project_name,
        COUNT(DISTINCT ma.machine_id)::INTEGER as machine_count
      FROM machine_assignments ma
      LEFT JOIN projects p ON ma.project_id = p.id
      WHERE ma.return_date IS NULL
      GROUP BY p.name
      ORDER BY machine_count DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top máy móc được sử dụng nhiều nhất
router.get('/top-machines', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.code,
        m.name,
        m.category,
        COUNT(ma.id)::INTEGER as assignment_count
      FROM machines m
      LEFT JOIN machine_assignments ma ON m.id = ma.machine_id
      GROUP BY m.id, m.code, m.name, m.category
      ORDER BY assignment_count DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Thống kê chi phí bảo trì theo loại
router.get('/maintenance-cost-by-type', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(maintenance_type, 'Khác') as maintenance_type,
        COUNT(*)::INTEGER as count,
        COALESCE(SUM(cost), 0)::DECIMAL as total_cost
      FROM maintenance_records
      GROUP BY maintenance_type
      ORDER BY total_cost DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

