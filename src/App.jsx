import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authBootstrapper, setInitializing } from './store/authSlice';
import { supabase } from './supabase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Waitlist from './pages/Waitlist';
import SiteContent from './pages/SiteContent';
import Products from './pages/Products';

import BlockingLoader from './components/ui/BlockingLoader';
import SubtleLoader from './components/ui/SubtleLoader';
import ToastContainer from './components/ui/ToastContainer';
import AdminLayout from './components/layout/AdminLayout';
import { ConfirmProvider } from './components/ui/ConfirmProvider';

const AutoLoginWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setInitializing(true));
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await dispatch(authBootstrapper(session.user));
      } else {
        dispatch(setInitializing(false));
      }
    };
    
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        dispatch(authBootstrapper(session.user));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--color-bg-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes nativeSpin { 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: '#000', borderRadius: '50%', animation: 'nativeSpin 1s linear infinite' }} />
      </div>
    );
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, profile } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user || !profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-text-dark)' }}>Access Denied</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
          You do not have the required administrative privileges to view this area.
        </p>
        <button 
          onClick={() => navigate('/login')}
          style={{ padding: '15px 40px', backgroundColor: 'var(--color-primary-dark)', color: '#fff', border: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px' }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Router>
      <AutoLoginWrapper>
        <ConfirmProvider>
          <BlockingLoader />
          <SubtleLoader />
          <ToastContainer />
          <div className="app-wrapper">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<Waitlist />} />
                <Route path="content" element={<SiteContent />} />
                <Route path="products" element={<Products />} />
              </Route>
            </Routes>
          </div>
        </ConfirmProvider>
      </AutoLoginWrapper>
    </Router>
  );
}

export default App;
