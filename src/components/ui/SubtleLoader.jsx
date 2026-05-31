import React from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';

const SubtleLoader = () => {
  const { active, text } = useSelector((state) => state.ui.subtleLoader);

  if (!active) return null;

  return (
    <div 
      className="position-fixed"
      style={{
        bottom: '30px',
        right: '30px',
        zIndex: 10000, // Higher than BlockingLoader (9999)
      }}
    >
      <div 
        className="d-flex align-items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: 'var(--color-bg-light)',
          border: '1px solid rgba(206, 181, 158, 0.3)', // Sand color border
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
          maxWidth: '300px'
        }}
      >
        <Spinner animation="border" size="sm" style={{ color: 'var(--color-primary)', borderWidth: '2px' }} />
        <span 
          style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '13px', 
            color: 'var(--color-text-dark)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export default SubtleLoader;
