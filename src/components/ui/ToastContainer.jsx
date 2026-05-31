import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { removeToast } from '../../store/uiSlice';

const getToastConfig = (type) => {
  switch (type) {
    case 'success':
      return { icon: <CheckCircle size={18} />, color: 'var(--color-accent-sage)', bg: '#F2F5F0' };
    case 'error':
      return { icon: <AlertCircle size={18} />, color: 'var(--color-accent-rust)', bg: '#FDF7F5' };
    case 'warning':
      return { icon: <AlertTriangle size={18} />, color: 'var(--color-accent-gold)', bg: '#FDFBF4' };
    case 'info':
    default:
      return { icon: <Info size={18} />, color: 'var(--color-primary-dark)', bg: 'var(--color-bg-light)' };
  }
};

const Toast = ({ toast }) => {
  const dispatch = useDispatch();
  const config = getToastConfig(toast.type);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="d-flex align-items-start gap-3 p-3 mb-3"
      style={{
        backgroundColor: config.bg,
        border: `1px solid \${config.color}33`,
        borderLeft: `4px solid \${config.color}`,
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        width: '320px',
        pointerEvents: 'auto'
      }}
    >
      <div style={{ color: config.color, marginTop: '2px' }}>
        {config.icon}
      </div>
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-text-dark)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        style={{
          background: 'none', border: 'none', padding: '2px', cursor: 'pointer',
          color: 'var(--color-text-muted)', opacity: 0.6,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const toasts = useSelector((state) => state.ui.toasts);

  // We still render the container, but it's pointerEvents none.
  // The individual toasts have pointerEvents auto.
  return (
    <div
      className="position-fixed d-flex flex-column align-items-end"
      style={{
        top: '30px',
        right: '30px',
        zIndex: 10001, // Highest, above SubtleLoader (10000)
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
