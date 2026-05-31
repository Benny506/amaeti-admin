import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AdminLayout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-bg-light)' }}>
      <Sidebar 
        isMobileNavOpen={isMobileNavOpen} 
        closeNav={() => setIsMobileNavOpen(false)} 
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#faf9f6' }}>
        <TopBar openNav={() => setIsMobileNavOpen(true)} />
        
        <main className="admin-main-content">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
