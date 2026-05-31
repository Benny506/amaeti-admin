import React from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import logoMonogram from '../../assets/logo.svg';

const BlockingLoader = () => {
  const { blockingLoader } = useSelector((state) => state.ui);

  if (!blockingLoader) return null;

  const loadingText = typeof blockingLoader === 'string' ? blockingLoader : 'Processing...';

  return (
    <>
      <style>{`
        @keyframes premiumSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .blocking-loader-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 9999;
          background: radial-gradient(circle, rgba(15, 15, 15, 0.85) 0%, rgba(250, 249, 246, 0.8) 70%);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          animation: fadeIn 0.4s ease-out forwards;
        }
        .blocking-loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .blocking-loader-logo {
          height: 100px;
          margin-bottom: 30px;
          filter: brightness(0) invert(1);
        }
        .blocking-loader-text-container {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #Fdfbf7;
        }
        .blocking-loader-spinner {
          animation: premiumSpin 1s linear infinite;
        }
        .blocking-loader-text {
          font-family: var(--font-serif-display);
          font-size: 18px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-style: italic;
          font-weight: 500;
        }
      `}</style>

      <div className="blocking-loader-overlay">
        <div className="blocking-loader-content">
          <img 
            src={logoMonogram} 
            alt="Loading..." 
            className="blocking-loader-logo"
          />
          <div className="blocking-loader-text-container">
            <Loader2 size={20} className="blocking-loader-spinner" />
            <span className="blocking-loader-text">
              {loadingText}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlockingLoader;
