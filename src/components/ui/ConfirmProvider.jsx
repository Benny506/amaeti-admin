import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    iconType: 'warning',
    resolvePromise: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        description: options.description || 'This action cannot be undone.',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        iconType: options.iconType || 'warning',
        resolvePromise: resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState.resolvePromise) {
      modalState.resolvePromise(true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modalState.resolvePromise) {
      modalState.resolvePromise(false);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const getIcon = () => {
    switch (modalState.iconType) {
      case 'info': return <Info size={40} color="#0d6efd" />;
      case 'danger': return <ShieldAlert size={40} color="#dc3545" />;
      case 'warning':
      default: return <AlertTriangle size={40} color="#ffc107" />;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {modalState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(18, 18, 18, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '40px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transform: 'translateY(0)',
            animation: 'slideUpFade 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              {getIcon()}
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '24px', color: 'var(--color-text-dark)', marginBottom: '10px' }}>
              {modalState.title}
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '30px', lineHeight: 1.5 }}>
              {modalState.description}
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0,0,0,0.1)',
                  color: 'var(--color-text-dark)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  borderRadius: '0'
                }}
              >
                {modalState.cancelText}
              </button>
              <button 
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: modalState.iconType === 'danger' ? '#dc3545' : 'var(--color-primary-dark)',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  borderRadius: '0'
                }}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
