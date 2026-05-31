import React, { useState, useEffect } from 'react';

const InputRow = ({ label, value, onChange, onDirty, isTextarea = false }) => {
  const [localVal, setLocalVal] = useState(value || '');

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalVal(e.target.value);
    if (onDirty) onDirty();
  };
  
  const handleBlur = () => {
    if (localVal !== value) {
      onChange(localVal);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{label}</label>
      {isTextarea ? (
        <textarea 
          value={localVal} 
          onChange={handleChange}
          onBlur={handleBlur}
          className="auth-input"
          style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
        />
      ) : (
        <input 
          type="text" 
          value={localVal} 
          onChange={handleChange}
          onBlur={handleBlur}
          className="auth-input"
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
};

export default InputRow;
