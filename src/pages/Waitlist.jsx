import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminHeader } from '../store/uiSlice';
import { fetchWaitlistData } from '../store/waitlistSlice';
import { RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const Waitlist = () => {
  const dispatch = useDispatch();
  const { data, totalCount, currentPage, pageSize, loading } = useSelector((state) => state.waitlist);

  useEffect(() => {
    dispatch(setAdminHeader({
      title: 'Waitlist CRM',
      description: 'Manage subscribers and view sign-up analytics.'
    }));
    
    // Always fetch latest on mount
    dispatch(fetchWaitlistData({ page: 1, pageSize: 15 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchWaitlistData({ page: currentPage, pageSize }));
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchWaitlistData({ page: newPage, pageSize }));
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 20px', backgroundColor: 'var(--color-bg-light)', 
            border: '1px solid rgba(0,0,0,0.1)', cursor: loading ? 'not-allowed' : 'pointer', 
            fontFamily: 'var(--font-sans)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' 
          }}
        >
          <RefreshCcw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-light)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <th style={{ padding: '20px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>ID</th>
                <th style={{ padding: '20px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Email Address</th>
                <th style={{ padding: '20px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Sign Up Date</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && !loading ? (
                <tr>
                  <td colSpan="3" style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>
                    No waitlist entries found.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)' }}>#{row.id}</td>
                    <td style={{ padding: '20px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500 }}>{row.email}</td>
                    <td style={{ padding: '20px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)' }}>{formatDate(row.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderTop: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'var(--color-bg-light)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer', opacity: (currentPage === 1 || loading) ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', cursor: (currentPage >= totalPages || loading) ? 'not-allowed' : 'pointer', opacity: (currentPage >= totalPages || loading) ? 0.5 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Waitlist;
