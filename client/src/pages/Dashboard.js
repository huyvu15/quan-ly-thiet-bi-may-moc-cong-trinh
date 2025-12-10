import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    machines: 0,
    suppliers: 0,
    maintenance: 0,
    assignments: 0,
    machinesInMaintenance: 0,
  });
  const [maintenanceByMonth, setMaintenanceByMonth] = useState([]);
  const [assignmentsByMonth, setAssignmentsByMonth] = useState([]);
  const [machinesByCategory, setMachinesByCategory] = useState([]);
  const [machinesByStatus, setMachinesByStatus] = useState([]);
  const [machinesByProject, setMachinesByProject] = useState([]);
  const [topMachines, setTopMachines] = useState([]);
  const [maintenanceCostByType, setMaintenanceCostByType] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#11998e', '#38ef7d', '#14b8a6', '#0ea5e9', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        projectsRes,
        machinesRes,
        suppliersRes,
        maintenanceRes,
        assignmentsRes,
        maintenanceByMonthRes,
        assignmentsByMonthRes,
        machinesByCategoryRes,
        machinesByStatusRes,
        machinesByProjectRes,
        topMachinesRes,
        maintenanceCostByTypeRes
      ] = await Promise.all([
        api.get('/projects'),
        api.get('/machines'),
        api.get('/suppliers'),
        api.get('/maintenance'),
        api.get('/assignments'),
        api.get('/stats/maintenance-by-month'),
        api.get('/stats/assignments-by-month'),
        api.get('/stats/machines-by-category'),
        api.get('/stats/machines-by-status'),
        api.get('/stats/machines-by-project'),
        api.get('/stats/top-machines'),
        api.get('/stats/maintenance-cost-by-type'),
      ]);

      const machinesInMaintenance = machinesRes.data.filter(m => m.status === 'maintenance').length;

      setStats({
        projects: projectsRes.data.length,
        machines: machinesRes.data.length,
        suppliers: suppliersRes.data.length,
        maintenance: maintenanceRes.data.length,
        assignments: assignmentsRes.data.length,
        machinesInMaintenance,
      });

      setMaintenanceByMonth((maintenanceByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        total_cost: typeof item.total_cost === 'string' ? parseFloat(item.total_cost) : (item.total_cost || 0)
      })));

      setAssignmentsByMonth((assignmentsByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));

      setMachinesByCategory((machinesByCategoryRes.data || []).map(item => ({
        category: item.category,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        name: item.category
      })));

      setMachinesByStatus((machinesByStatusRes.data || []).map(item => ({
        status: item.status,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));

      setMachinesByProject((machinesByProjectRes.data || []).map(item => ({
        ...item,
        machine_count: typeof item.machine_count === 'string' ? parseInt(item.machine_count) : (item.machine_count || 0)
      })));

      setTopMachines((topMachinesRes.data || []).map(item => ({
        ...item,
        assignment_count: typeof item.assignment_count === 'string' ? parseInt(item.assignment_count) : (item.assignment_count || 0),
        name: item.name || item.code
      })));

      setMaintenanceCostByType((maintenanceCostByTypeRes.data || []).map(item => ({
        ...item,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        total_cost: typeof item.total_cost === 'string' ? parseFloat(item.total_cost) : (item.total_cost || 0)
      })));
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMaintenanceByMonth([]);
      setAssignmentsByMonth([]);
      setMachinesByCategory([]);
      setMachinesByStatus([]);
      setMachinesByProject([]);
      setTopMachines([]);
      setMaintenanceCostByType([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  };

  const formatMonth = (month) => {
    if (!month) return '';
    const [year, mon] = month.split('-');
    return `${mon}/${year}`;
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
    return <div className="dashboard-loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống quản lý máy móc công trình</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏗️</div>
          <div className="stat-info">
            <h3>{stats.projects}</h3>
            <p>Công Trình</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>{stats.machines}</h3>
            <p>Máy Móc</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.suppliers}</h3>
            <p>Nhà Cung Cấp</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <h3>{stats.machinesInMaintenance}</h3>
            <p>Máy Đang Bảo Trì</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.assignments}</h3>
            <p>Phân Công</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <h3>{stats.maintenance}</h3>
            <p>Bảo Trì</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Chart 1: Area Chart - Bảo trì và phân công theo tháng */}
        <div className="chart-card">
          <h3>Bảo Trì & Phân Công Theo Tháng</h3>
          {maintenanceByMonth.length > 0 || assignmentsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(() => {
                const allMonths = new Set([
                  ...maintenanceByMonth.map(m => m.month),
                  ...assignmentsByMonth.map(a => a.month)
                ]);
                const monthMap = new Map();
                
                maintenanceByMonth.forEach(m => {
                  monthMap.set(m.month, { month: m.month, maintenance: m.count, assignments: 0 });
                });
                
                assignmentsByMonth.forEach(a => {
                  if (monthMap.has(a.month)) {
                    monthMap.get(a.month).assignments = a.count;
                  } else {
                    monthMap.set(a.month, { month: a.month, maintenance: 0, assignments: a.count });
                  }
                });
                
                return Array.from(monthMap.values())
                  .sort((a, b) => a.month.localeCompare(b.month))
                  .map(item => ({
                    month: formatMonth(item.month),
                    'Bảo Trì': item.maintenance,
                    'Phân Công': item.assignments,
                  }));
              })()}>
                <defs>
                  <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11998e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#11998e" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38ef7d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38ef7d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="Bảo Trì" stroke="#11998e" fillOpacity={1} fill="url(#colorMaintenance)" />
                <Area type="monotone" dataKey="Phân Công" stroke="#38ef7d" fillOpacity={1} fill="url(#colorAssignments)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 2: Composed Chart - Chi phí và số lượng bảo trì */}
        <div className="chart-card">
          <h3>Chi Phí & Số Lượng Bảo Trì</h3>
          {maintenanceByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={maintenanceByMonth.map(item => ({
                month: formatMonth(item.month),
                'Chi phí (triệu VNĐ)': item.total_cost / 1000000 || 0,
                'Số lượng': item.count || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'Chi phí (triệu VNĐ)') {
                      return [`${formatCurrency(value * 1000000)} đ`, name];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Chi phí (triệu VNĐ)" fill="#11998e" radius={[8, 8, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Số lượng" stroke="#38ef7d" strokeWidth={3} dot={{ fill: '#38ef7d', r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 3: Radial Bar Chart - Máy móc theo trạng thái */}
        <div className="chart-card">
          <h3>Máy Móc Theo Trạng Thái</h3>
          {machinesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={machinesByStatus.map((item, index) => ({
                name: getStatusLabel(item.status),
                value: item.count,
                fill: COLORS[index % COLORS.length]
              }))}>
                <RadialBar dataKey="value" cornerRadius={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  iconSize={12}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 4: Pie Chart - Máy móc theo loại */}
        <div className="chart-card">
          <h3>Phân Bố Máy Móc Theo Loại</h3>
          {machinesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={machinesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {machinesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 5: Bar Chart với gradient - Máy móc theo công trình */}
        <div className="chart-card">
          <h3>Máy Móc Theo Công Trình</h3>
          {machinesByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={machinesByProject}>
                <defs>
                  <linearGradient id="colorProject" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11998e" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#38ef7d" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="project_name" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="machine_count" fill="url(#colorProject)" name="Số máy móc" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 6: Horizontal Bar Chart - Top máy móc */}
        <div className="chart-card">
          <h3>Top 10 Máy Móc Được Sử Dụng Nhiều Nhất</h3>
          {topMachines.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMachines.slice(0, 10)} layout="vertical">
                <defs>
                  <linearGradient id="colorTop" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" width={150} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="assignment_count" fill="url(#colorTop)" name="Số lần phân công" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 7: Stacked Bar Chart - Chi phí bảo trì theo loại */}
        <div className="chart-card">
          <h3>Chi Phí Bảo Trì Theo Loại</h3>
          {maintenanceCostByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceCostByType.map(item => ({
                ...item,
                'Chi phí (triệu VNĐ)': item.total_cost / 1000000 || 0
              }))}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="maintenance_type" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => `${formatCurrency(value * 1000000)} đ`}
                />
                <Bar dataKey="Chi phí (triệu VNĐ)" fill="url(#colorCost)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
