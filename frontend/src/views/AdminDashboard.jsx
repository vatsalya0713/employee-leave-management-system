import React, { useState, useEffect } from 'react';
import { adminAPI, employeeAPI } from '../services/api';
import { Users, FileText, Search, Edit2, Trash2, Check, X, AlertCircle, RefreshCw, User, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'leaves'
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search Filter States
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  // Pagination
  const [empPage, setEmpPage] = useState(0);
  const [empTotalPages, setEmpTotalPages] = useState(0);
  const [leavePage, setLeavePage] = useState(0);
  const [leaveTotalPages, setLeaveTotalPages] = useState(0);

  // Edit Balance inline state
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [tempBalance, setTempBalance] = useState('');

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else {
      fetchLeaves();
    }
  }, [activeTab, empPage, leavePage]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (searchName || searchDept || searchEmail) {
        const params = {};
        if (searchName) params.name = searchName;
        if (searchDept) params.department = searchDept;
        if (searchEmail) params.email = searchEmail;
        response = await employeeAPI.search(params, empPage, 10);
      } else {
        response = await adminAPI.getEmployees(empPage, 10);
      }
      
      setEmployees(response.data.content || []);
      setEmpTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Failed to fetch employees list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getLeaves(leavePage, 10);
      setLeaves(response.data.content || []);
      setLeaveTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Failed to fetch leave requests history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setEmpPage(0);
    fetchEmployees();
  };

  const handleResetSearch = () => {
    setSearchName('');
    setSearchDept('');
    setSearchEmail('');
    setEmpPage(0);
    // Trigger load by forcing async fetch
    setTimeout(fetchEmployees, 50);
  };

  const handleUpdateBalance = async (employeeId) => {
    if (tempBalance === '' || isNaN(tempBalance)) {
      alert('Please enter a valid numeric leave balance.');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.updateBalance(employeeId, parseInt(tempBalance));
      setSuccess('Leave balance updated successfully!');
      setEditingEmpId(null);
      fetchEmployees(); // Refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave balance.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to delete this employee profile? This action cannot be undone.')) return;

    try {
      setLoading(true);
      await adminAPI.deleteEmployee(id);
      setSuccess('Employee deleted successfully.');
      fetchEmployees(); // Refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee profile.');
    } finally {
      setLoading(false);
    }
  };

  const startEditBalance = (emp) => {
    setEditingEmpId(emp.id);
    setTempBalance(emp.leaveBalance.toString());
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage employee balances, view histories, and update profiles.</p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-glass)',
        marginBottom: '32px',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => { setActiveTab('employees'); setError(''); setSuccess(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'employees' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'employees' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Users size={18} />
          Employees Directory
        </button>
        <button
          onClick={() => { setActiveTab('leaves'); setError(''); setSuccess(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'leaves' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'leaves' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'leaves' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'var(--transition-smooth)'
          }}
        >
          <FileText size={18} />
          Leave Applications Log
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-glow)',
          color: 'var(--danger)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'var(--success-glow)',
          color: 'var(--success)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          marginBottom: '24px'
        }}>
          {success}
        </div>
      )}

      {/* Render Employees Tab */}
      {activeTab === 'employees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Search Filters */}
          <form onSubmit={handleSearch} className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', padding: '20px' }}>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Search by Name</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Employee name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Search by Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Engineering"
                value={searchDept}
                onChange={(e) => setSearchDept(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Search by Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="email@company.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" onClick={handleResetSearch} className="btn btn-secondary">Reset</button>
            </div>
          </form>

          {/* Table Directory */}
          {loading ? (
            <div style={{ padding: '40px', color: 'var(--primary)', textAlign: 'center' }}>Querying database...</div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Code</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Joining Date</th>
                      <th style={{ width: '150px' }}>Leave Balance</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px', borderRadius: '50%' }}>
                              <User size={16} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '600' }}>{emp.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><code>{emp.employeeCode}</code></td>
                        <td>{emp.department}</td>
                        <td>{emp.designation}</td>
                        <td>{emp.joiningDate}</td>
                        <td>
                          {editingEmpId === emp.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ width: '70px', padding: '6px 10px' }}
                                value={tempBalance}
                                onChange={(e) => setTempBalance(e.target.value)}
                              />
                              <button onClick={() => handleUpdateBalance(emp.id)} className="btn btn-primary" style={{ padding: '6px', borderRadius: '6px' }}>
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditingEmpId(null)} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '6px' }}>
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '1.05rem', color: 'var(--success)' }}>{emp.leaveBalance}</strong>
                              <button
                                onClick={() => startEditBalance(emp)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="btn btn-secondary"
                              style={{
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                color: 'var(--danger)',
                                background: 'transparent',
                                border: '1px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'var(--danger-glow)';
                                e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.borderColor = 'transparent';
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employees Pagination */}
          {empTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                disabled={empPage === 0}
                onClick={() => setEmpPage(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Page {empPage + 1} of {empTotalPages}
              </span>
              <button
                disabled={empPage === empTotalPages - 1}
                onClick={() => setEmpPage(prev => prev + 1)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Render Leaves Tab */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ padding: '40px', color: 'var(--primary)', textAlign: 'center' }}>Querying leave database...</div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>
                          <span style={{ fontWeight: '600' }}>{leave.employeeName}</span>
                        </td>
                        <td>
                          <span className="badge" style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}>{leave.leaveType}</span>
                        </td>
                        <td>{leave.startDate} to {leave.endDate}</td>
                        <td><strong>{leave.totalDays} days</strong></td>
                        <td>
                          <span className={`badge badge-${leave.status.toLowerCase()}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td>{new Date(leave.appliedDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leaves Pagination */}
          {leaveTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                disabled={leavePage === 0}
                onClick={() => setLeavePage(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Page {leavePage + 1} of {leaveTotalPages}
              </span>
              <button
                disabled={leavePage === leaveTotalPages - 1}
                onClick={() => setLeavePage(prev => prev + 1)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
