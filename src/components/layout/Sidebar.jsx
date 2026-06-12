import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Offcanvas } from 'react-bootstrap';
import { 
  Users, 
  FileText, 
  LogOut,
  Package,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '../../supabase';
import { clearAuth } from '../../store/authSlice';
import { useConfirm } from '../ui/ConfirmProvider';
import { showSubtleLoader, hideSubtleLoader } from '../../store/uiSlice';
import logoWordmark from '../../assets/logo-wordmark.svg';

const navItems = [
  { path: '/', label: 'Waitlist', icon: Users },
  { path: '/content', label: 'Site Content', icon: FileText },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/delivery', label: 'Delivery', icon: Truck },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
];

const SidebarContent = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const location = useLocation();

  const handleSignOut = async () => {
    const isConfirmed = await confirm({
      title: 'Sign Out',
      description: 'Are you sure you want to sign out of the Amaeti Administration Panel?',
      confirmText: 'Sign Out',
      iconType: 'danger'
    });

    if (!isConfirmed) return;

    try {
      dispatch(showSubtleLoader('Signing out securely...'));
      await supabase.auth.signOut();
      dispatch(clearAuth());
      if (onClose) onClose();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      dispatch(hideSubtleLoader());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-text-dark)', color: '#fff', padding: '30px 20px' }}>
      <div style={{ marginBottom: '50px', padding: '0 10px', display: 'flex', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif-display)',
          fontSize: '24px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          margin: 0,
          fontWeight: 300
        }}>Amaeti</h1>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/waitlist');
          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 15px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            width: '100%',
            padding: '12px 15px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ isMobileNavOpen, closeNav }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block" style={{ width: '260px', height: '100vh', flexShrink: 0, overflowY: 'auto', backgroundColor: 'var(--color-text-dark)' }}>
        <SidebarContent />
      </div>

      {/* Mobile Offcanvas */}
      <Offcanvas show={isMobileNavOpen} onHide={closeNav} placement="start" style={{ width: '280px', backgroundColor: 'var(--color-text-dark)', border: 'none' }}>
        <Offcanvas.Header closeButton closeVariant="white" style={{ position: 'absolute', right: 0, top: 0, zIndex: 10 }}>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: 0, overflowY: 'auto' }}>
          <SidebarContent onClose={closeNav} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
