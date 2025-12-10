import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Machines from './pages/Machines';
import Suppliers from './pages/Suppliers';
import Assignments from './pages/Assignments';
import Maintenance from './pages/Maintenance';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="machines" element={<Machines />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

