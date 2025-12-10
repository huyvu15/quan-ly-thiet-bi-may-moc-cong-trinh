import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    machine_id: '',
    project_id: '',
    assign_date: new Date().toISOString().split('T')[0],
    assigned_by: '',
    notes: '',
  });
  const [returnData, setReturnData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, machinesRes, projectsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/machines'),
        api.get('/projects'),
      ]);
      setAssignments(assignmentsRes.data);
      setMachines(machinesRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', formData);
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assignments/${selectedAssignment.id}/return`, returnData);
      fetchData();
      setShowReturnModal(false);
      setSelectedAssignment(null);
      setReturnData({ return_date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReturnClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowReturnModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phân công này?')) {
      try {
        await api.delete(`/assignments/${id}`);
        fetchData();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: '',
      project_id: '',
      assign_date: new Date().toISOString().split('T')[0],
      assigned_by: '',
      notes: '',
    });
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Phân Công Máy Móc</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Phân Công Máy Móc
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Máy</th>
              <th>Tên Máy</th>
              <th>Công Trình</th>
              <th>Ngày Phân Công</th>
              <th>Ngày Trả</th>
              <th>Người Phân Công</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.code}</td>
                  <td>{assignment.machine_name}</td>
                  <td>{assignment.project_name || '-'}</td>
                  <td>{assignment.assign_date}</td>
                  <td>{assignment.return_date || <span style={{ color: '#e74c3c' }}>Chưa trả</span>}</td>
                  <td>{assignment.assigned_by || '-'}</td>
                  <td>
                    {!assignment.return_date && (
                      <button className="btn-view" onClick={() => handleReturnClick(assignment)}>
                        Trả Máy
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(assignment.id)}>Xóa</button>
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
            <h2>Phân Công Máy Móc</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Máy Móc *</label>
                <select
                  value={formData.machine_id}
                  onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                  required
                >
                  <option value="">Chọn máy móc</option>
                  {machines.filter(m => m.status === 'available').map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.code} - {machine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Công Trình *</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                >
                  <option value="">Chọn công trình</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Phân Công</label>
                  <input
                    type="date"
                    value={formData.assign_date}
                    onChange={(e) => setFormData({ ...formData, assign_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Người Phân Công</label>
                  <input
                    type="text"
                    value={formData.assigned_by}
                    onChange={(e) => setFormData({ ...formData, assigned_by: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ghi Chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

      {showReturnModal && selectedAssignment && (
        <div className="modal-overlay" onClick={() => { setShowReturnModal(false); setSelectedAssignment(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Trả Máy Móc</h2>
            <form onSubmit={handleReturn}>
              <div className="form-group">
                <label>Máy Móc</label>
                <input type="text" value={`${selectedAssignment.code} - ${selectedAssignment.machine_name}`} disabled />
              </div>
              <div className="form-group">
                <label>Công Trình</label>
                <input type="text" value={selectedAssignment.project_name || '-'} disabled />
              </div>
              <div className="form-group">
                <label>Ngày Trả</label>
                <input
                  type="date"
                  value={returnData.return_date}
                  onChange={(e) => setReturnData({ ...returnData, return_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ghi Chú</label>
                <textarea
                  value={returnData.notes}
                  onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowReturnModal(false); setSelectedAssignment(null); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">Xác Nhận Trả</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;

