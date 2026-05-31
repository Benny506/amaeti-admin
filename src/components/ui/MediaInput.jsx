import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { supabase } from '../../supabase'; // Ensure supabase is imported

const MediaInput = ({ value, onChange, label, accept = "image/*,video/*", typeHint }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false); // Reset error on new value

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      setIsVideo(value.type.startsWith('video/'));
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string' && value.length > 0) {
      // Determine if it's a video based on extension or explicit props
      setIsVideo(value.endsWith('.mp4') || value.endsWith('.webm') || value.includes('video'));
      
      if (value.startsWith('http') || value.startsWith('data:')) {
        setPreviewUrl(value);
      } else {
        // Resolve relative paths to Supabase public URL in site_content bucket
        const { data } = supabase.storage.from('site_content').getPublicUrl(value);
        setPreviewUrl(data.publicUrl);
      }
    } else {
      setPreviewUrl(null);
      setIsVideo(false);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {label && <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{label}</label>}
      
      <div 
        onClick={triggerUpload}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '200px',
          border: '1px dashed rgba(0,0,0,0.2)',
          backgroundColor: 'var(--color-bg-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-text-dark)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept={accept}
          onChange={handleFileChange}
        />

        {previewUrl && !hasError ? (
          <>
            {isVideo ? (
              <video 
                src={previewUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                onError={() => setHasError(true)}
                style={{ maxWidth: '100%', maxHeight: '400px', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
              />
            ) : (
              <img 
                src={previewUrl} 
                alt="Media preview" 
                onError={() => setHasError(true)}
                style={{ maxWidth: '100%', maxHeight: '400px', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
              />
            )}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            >
              <span style={{ color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Click to Change
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <UploadCloud size={32} color="var(--color-text-muted)" style={{ marginBottom: '10px' }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
              Click to browse or drag media here
            </p>
            {typeHint && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'rgba(0,0,0,0.4)', marginTop: '5px' }}>
                {typeHint}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaInput;
