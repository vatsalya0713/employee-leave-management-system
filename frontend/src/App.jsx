import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './views/Login';
import Register from './views/Register';
import EmployeeDashboard from './views/EmployeeDashboard';
import ManagerDashboard from './views/ManagerDashboard';
import AdminDashboard from './views/AdminDashboard';

// Root redirector mapping user to dashboard based on role
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  } else if (user.role === 'MANAGER') {
    return <Navigate to="/manager" replace />;
  } else {
    return <Navigate to="/employee" replace />;
  }
};

// Main layout layout wrapping sidebar around views
const MainLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Mappings */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/unauthorized" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#0a0e17'
            }}>
              <h2 style={{ color: 'var(--danger)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: '700' }}>Access Denied</h2>
              <p style={{ color: 'var(--text-secondary)' }}>You do not have permissions to access this page.</p>
              <a href="/" style={{ color: 'var(--primary)', marginTop: '20px', fontWeight: '500' }}>Return to Dashboard</a>
            </div>
          } />

          {/* Protected Mappings */}
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <MainLayout>
                <EmployeeDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <MainLayout>
                <ManagerDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Fallback paths */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
