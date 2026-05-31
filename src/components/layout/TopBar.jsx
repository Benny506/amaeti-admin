import React from 'react';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import logoIcon from '../../assets/logo.svg';

const TopBar = ({ openNav }) => {
  const { adminHeader } = useSelector((state) => state.ui);

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '20px 40px', 
      backgroundColor: '#fff', 
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      flexShrink: 0,
      height: '80px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
        <button 
          className="d-lg-none" 
          onClick={openNav} 
          style={{ background: 'none', border: 'none', padding: 0, marginRight: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <Menu size={24} color="var(--color-text-dark)" />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h1 style={{ 
            fontFamily: 'var(--font-serif-display)', 
            fontSize: '24px', 
            margin: 0, 
            color: 'var(--color-text-dark)', 
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {adminHeader.title}
          </h1>
          {adminHeader.description && (
            <p className="d-none d-md-block" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', margin: '4px 0 0 0', color: 'var(--color-text-muted)' }}>
              {adminHeader.description}
            </p>
          )}
        </div>
      </div>

      <img src={logoIcon} alt="Amaeti Logo" style={{ height: '30px', flexShrink: 0, marginLeft: '20px', filter: 'brightness(0)' }} />
    </header>
  );
};

export default TopBar;
