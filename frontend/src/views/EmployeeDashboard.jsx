import React, { useState, useEffect } from 'react';
import { leaveAPI, employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, FileText, Send, Trash2, Award, Briefcase, Mail } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [profile, setProfile] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch employee profile details to get leave balance, department, designation, etc.
      // Wait, we can fetch all employees search by email to get their employee profile!
      const employeeResponse = await employeeAPI.search({ email: user.email });
      if (employeeResponse.data?.content?.length > 0) {
        setProfile(employeeResponse.data.content[0]);
      }
      
      // Fetch leaves
      const leavesResponse = await leaveAPI.getMyLeaves();
      setLeaves(leavesResponse.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        leaveType,
        startDate,
        endDate,
        reason
      };
      await leaveAPI.apply(payload);
      setFormSuccess('Leave application submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchDashboardData(); // Refresh balance and list
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    
    try {
      await leaveAPI.cancel(id);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  // Calculate duration locally for visual guidance
  const calculatedDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading && !profile) {
    return <div style={{ padding: '40px', color: 'var(--primary)', textAlign: 'center' }}>Loading Employee Profile...</div>;
  }

  const durationDays = calculatedDays();

  return (
    <div className="main-content animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Welcome, {user.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Apply for leaves and track your requests status.</p>
      </div>

      {/* Employee Profile Card & Leave Balance */}
      <div className="dashboard-grid">
        {profile && (
          <div className="glass-card stat-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                padding: '16px',
                borderRadius: '12px'
              }}>
                <Briefcase size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{profile.designation}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Department: <strong>{profile.department}</strong></span>
                  <span>Employee Code: <strong>{profile.employeeCode}</strong></span>
                  <span>Joined Date: <strong>{profile.joiningDate}</strong></span>
                </div>
              </div>
            </div>
            
            {/* Numeric Leave Balance Display */}
            <div style={{ textAlign: 'center', padding: '10px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)', marginTop: '4px' }}>{profile.leaveBalance}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days Remaining</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* Leave Application Form */}
        <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Send size={20} className="primary" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Apply for Leave</h3>
          </div>

          {formError && (
            <div style={{
              background: 'var(--danger-glow)',
              color: 'var(--danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{
              background: 'var(--success-glow)',
              color: 'var(--success)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '20px'
            }}>
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleApplyLeave}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                className="form-select"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {durationDays > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Total Requested Days: <strong style={{ color: 'var(--primary)' }}>{durationDays} {durationDays === 1 ? 'day' : 'days'}</strong>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason for Leave</label>
              <textarea
                className="form-input"
                style={{ resize: 'none', height: '100px' }}
                placeholder="Brief description of the reason for applying..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting Request...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Leave Requests History */}
        <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>My Leave History</h3>
          </div>

          {leaves.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              padding: '40px 0',
              gap: '12px'
            }}>
              <Calendar size={48} style={{ opacity: 0.3 }} />
              <p>No leave requests found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
              {leaves.map((leave) => (
                <div key={leave.id} style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'var(--transition-smooth)'
                }}
                className="hover-card-effects"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge" style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }}>{leave.leaveType}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {leave.startDate} to {leave.endDate}
                    </span>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', wordBreak: 'break-word' }}>
                      "{leave.reason}"
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Applied on: {new Date(leave.appliedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <span className={`badge badge-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                    
                    {leave.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelLeave(leave.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Trash2 size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .hover-card-effects:hover {
          border-color: rgba(255, 255, 255, 0.15) !important;
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
