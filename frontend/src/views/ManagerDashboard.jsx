import React, { useState, useEffect } from 'react';
import { managerAPI } from '../services/api';
import { Check, X, AlertCircle, Calendar, RefreshCw, User, HelpCircle } from 'lucide-react';

const ManagerDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPendingLeaves();
  }, [page]);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await managerAPI.getPending(page, 10);
      setPendingLeaves(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Failed to fetch pending leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setError('');
    setSuccess('');
    setProcessingId(id);

    try {
      await managerAPI.approve(id);
      setSuccess('Leave request approved successfully!');
      fetchPendingLeaves(); // Refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve leave request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setError('');
    setSuccess('');
    setProcessingId(id);

    try {
      await managerAPI.reject(id);
      setSuccess('Leave request rejected successfully.');
      fetchPendingLeaves(); // Refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject leave request.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Manager Approvals</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review pending employee leave applications and take actions.</p>
        </div>
        <button
          onClick={fetchPendingLeaves}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          Refresh
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

      {loading ? (
        <div style={{ padding: '40px', color: 'var(--primary)', textAlign: 'center' }}>Loading approvals...</div>
      ) : pendingLeaves.length === 0 ? (
        <div className="glass-card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          color: 'var(--text-muted)',
          gap: '16px',
          textAlign: 'center'
        }}>
          <Check size={48} style={{ color: 'var(--success)', opacity: 0.6 }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>All Caught Up!</h3>
            <p style={{ fontSize: '0.95rem' }}>No pending leave requests found for review.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            background: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            padding: '6px',
                            borderRadius: '50%'
                          }}>
                            <User size={16} />
                          </div>
                          <div>
                            <span style={{ fontWeight: '600' }}>{leave.employeeName}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>{leave.leaveType}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.875rem' }}>
                          <span>{leave.startDate}</span>
                          <span style={{ color: 'var(--text-muted)' }}>to {leave.endDate}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>{leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}</strong>
                      </td>
                      <td>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          "{leave.reason}"
                        </p>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApprove(leave.id)}
                            disabled={processingId !== null}
                            className="btn btn-primary"
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.85rem',
                              background: 'var(--success-glow)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: 'var(--success)',
                              boxShadow: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--success)';
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'var(--success-glow)';
                              e.target.style.color = 'var(--success)';
                            }}
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(leave.id)}
                            disabled={processingId !== null}
                            className="btn btn-secondary"
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.85rem',
                              background: 'var(--danger-glow)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: 'var(--danger)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--danger)';
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'var(--danger-glow)';
                              e.target.style.color = 'var(--danger)';
                            }}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
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

export default ManagerDashboard;
