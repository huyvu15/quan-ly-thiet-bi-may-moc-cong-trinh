import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    status: 'available',
    description: '',
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await api.get('/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await api.put(`/machines/${editingMachine.id}`, formData);
      } else {
        await api.post('/machines', formData);
      }
      fetchMachines();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (machine) => {
    setEditingMachine(machine);
    setFormData({
      code: machine.code || '',
      name: machine.name || '',
      category: machine.category || '',
      manufacturer: machine.manufacturer || '',
      model: machine.model || '',
      serial_number: machine.serial_number || '',
      purchase_date: machine.purchase_date || '',
      purchase_price: machine.purchase_price || '',
      status: machine.status || 'available',
      description: machine.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa máy móc này?')) {
      try {
        await api.delete(`/machines/${id}`);
        fetchMachines();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: '',
      manufacturer: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_price: '',
      status: 'available',
      description: '',
    });
    setEditingMachine(null);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'available': 'Sẵn sàng',
      'in_use': 'Đang sử dụng',
      'maintenance': 'Bảo trì',
      'broken': 'Hỏng'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Máy Móc</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Thêm Máy Móc
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Máy</th>
              <th>Tên Máy</th>
              <th>Loại</th>
              <th>Nhà SX</th>
              <th>Model</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {machines.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              machines.map((machine) => (
                <tr key={machine.id}>
                  <td>{machine.code}</td>
                  <td>{machine.name}</td>
                  <td>{machine.category || '-'}</td>
                  <td>{machine.manufacturer || '-'}</td>
                  <td>{machine.model || '-'}</td>
                  <td>
                    <span className={`status-badge ${machine.status}`}>
                      {getStatusLabel(machine.status)}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(machine)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(machine.id)}>Xóa</button>
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
            <h2>{editingMachine ? 'Sửa Máy Móc' : 'Thêm Máy Móc'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Máy *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">Sẵn sàng</option>
                    <option value="in_use">Đang sử dụng</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="broken">Hỏng</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tên Máy *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="VD: Máy đào, Máy ủi, Xe tải"
                  />
                </div>
                <div className="form-group">
                  <label>Nhà Sản Xuất</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số Serial</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Mua</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giá Mua (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    min="0"
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

export default Machines;

