import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, CheckSquare, LogOut, Shield, Compass, User } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{
      width: '260px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      minHeight: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 8px', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            L
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>LeavePortal</span>
        </div>

        {/* User Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: '50%'
          }}>
            <User size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</h4>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase' }}>{user.role}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {user.role === 'EMPLOYEE' && (
            <>
              <NavLink to="/employee" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Compass size={18} />
                Dashboard
              </NavLink>
            </>
          )}

          {user.role === 'MANAGER' && (
            <>
              <NavLink to="/manager" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CheckSquare size={18} />
                Approvals
              </NavLink>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Shield size={18} />
                Admin Panel
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="btn btn-secondary"
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          gap: '12px',
          background: 'transparent',
          border: '1px solid transparent',
          color: 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = 'var(--danger)';
          e.target.style.background = 'var(--danger-glow)';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'var(--text-secondary)';
          e.target.style.background = 'transparent';
        }}
      >
        <LogOut size={18} />
        Logout
      </button>

      {/* Inject link styles directly */}
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          transition: var(--transition-smooth);
        }
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background: var(--primary-glow);
          color: var(--primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
