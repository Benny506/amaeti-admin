import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAdminHeader } from '../store/uiSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAdminHeader({
      title: 'Atelier Command',
      description: 'Overview of system status and quick actions.'
    }));
  }, [dispatch]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <div style={{ padding: '40px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.5rem', marginBottom: '15px' }}>Content Management</h3>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: '14px' }}>Edit page content, banners, and typography.</p>
        </div>
        <div style={{ padding: '40px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.5rem', marginBottom: '15px' }}>Waitlist CRM</h3>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: '14px' }}>Manage subscriber list and export data.</p>
        </div>
        <div style={{ padding: '40px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.5rem', marginBottom: '15px' }}>System Logs</h3>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: '14px' }}>View security access and error logs.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
