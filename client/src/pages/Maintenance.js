import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [machines, setMachines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    record_number: '',
    machine_id: '',
    project_id: '',
    supplier_id: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    maintenance_type: '',
    cost: '',
    description: '',
    next_maintenance_date: '',
    performed_by: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenanceRes, machinesRes, projectsRes, suppliersRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/machines'),
        api.get('/projects'),
        api.get('/suppliers'),
      ]);
      setMaintenanceRecords(maintenanceRes.data);
      setMachines(machinesRes.data);
      setProjects(projectsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/maintenance/${editingRecord.id}`, formData);
      } else {
        await api.post('/maintenance', formData);
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      record_number: record.record_number || '',
      machine_id: record.machine_id || '',
      project_id: record.project_id || '',
      supplier_id: record.supplier_id || '',
      maintenance_date: record.maintenance_date || new Date().toISOString().split('T')[0],
      maintenance_type: record.maintenance_type || '',
      cost: record.cost || '',
      description: record.description || '',
      next_maintenance_date: record.next_maintenance_date || '',
      performed_by: record.performed_by || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi bảo trì này?')) {
      try {
        await api.delete(`/maintenance/${id}`);
        fetchData();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      record_number: '',
      machine_id: '',
      project_id: '',
      supplier_id: '',
      maintenance_date: new Date().toISOString().split('T')[0],
      maintenance_type: '',
      cost: '',
      description: '',
      next_maintenance_date: '',
      performed_by: '',
    });
    setEditingRecord(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Bảo Trì Máy Móc</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Thêm Bản Ghi Bảo Trì
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Số Phiếu</th>
              <th>Máy Móc</th>
              <th>Công Trình</th>
              <th>Ngày Bảo Trì</th>
              <th>Loại</th>
              <th>Chi Phí</th>
              <th>Nhà Cung Cấp</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRecords.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              maintenanceRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.record_number}</td>
                  <td>{record.machine_name}</td>
                  <td>{record.project_name || '-'}</td>
                  <td>{record.maintenance_date}</td>
                  <td>{record.maintenance_type || '-'}</td>
                  <td>{formatCurrency(record.cost)} đ</td>
                  <td>{record.supplier_name || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(record)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(record.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRecord ? 'Sửa Bản Ghi Bảo Trì' : 'Thêm Bản Ghi Bảo Trì'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Số Phiếu *</label>
                  <input
                    type="text"
                    value={formData.record_number}
                    onChange={(e) => setFormData({ ...formData, record_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày Bảo Trì</label>
                  <input
                    type="date"
                    value={formData.maintenance_date}
                    onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Máy Móc *</label>
                <select
                  value={formData.machine_id}
                  onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                  required
                >
                  <option value="">Chọn máy móc</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.code} - {machine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Công Trình</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  >
                    <option value="">Chọn công trình</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nhà Cung Cấp</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại Bảo Trì</label>
                  <select
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  >
                    <option value="">Chọn loại</option>
                    <option value="preventive">Bảo trì định kỳ</option>
                    <option value="repair">Sửa chữa</option>
                    <option value="inspection">Kiểm tra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Chi Phí (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Bảo Trì Tiếp Theo</label>
                  <input
                    type="date"
                    value={formData.next_maintenance_date}
                    onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Người Thực Hiện</label>
                  <input
                    type="text"
                    value={formData.performed_by}
                    onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;

