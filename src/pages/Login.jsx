import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../supabase';
import { authBootstrapper } from '../store/authSlice';
import { showBlockingLoader, hideBlockingLoader, addToast } from '../store/uiSlice';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';

import logoMonogram from '../assets/logo.svg';
import logoWordmark from '../assets/logo-wordmark.svg';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      dispatch(showBlockingLoader('Authenticating...'));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        dispatch(hideBlockingLoader());
        dispatch(addToast({ type: 'error', message: error.message }));
        return;
      }

      if (data?.user) {
        dispatch(showBlockingLoader('Verifying clearance...'));
        dispatch(authBootstrapper(data.user))
          .unwrap()
          .then(() => {
            dispatch(hideBlockingLoader());
            dispatch(addToast({ type: 'success', message: 'Access granted.' }));
            navigate('/');
          })
          .catch((err) => {
            dispatch(hideBlockingLoader());
            dispatch(addToast({ type: 'error', message: 'Access Denied: ' + err }));
          });
      }
    },
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '50px 40px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <img src={logoMonogram} alt="Amaeti Logo" style={{ height: '40px', filter: 'brightness(0)', marginBottom: '15px' }} />
          <h1 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2.2rem', marginBottom: '5px', color: 'var(--color-text-dark)' }}>Admin Portal</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)' }}>Secure Backend Access</p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--color-text-dark)' }}>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{ width: '100%', padding: '12px 15px', border: formik.touched.email && formik.errors.email ? '1px solid #dc3545' : '1px solid rgba(0,0,0,0.1)', backgroundColor: 'var(--color-bg-light)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
            />
            {formik.touched.email && formik.errors.email && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#dc3545', marginTop: '5px' }}>{formik.errors.email}</div>
            )}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--color-text-dark)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{ width: '100%', padding: '12px 15px', paddingRight: '45px', border: formik.touched.password && formik.errors.password ? '1px solid #dc3545' : '1px solid rgba(0,0,0,0.1)', backgroundColor: 'var(--color-bg-light)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#dc3545', marginTop: '5px' }}>{formik.errors.password}</div>
            )}
          </div>

          <button 
            type="submit"
            disabled={formik.isSubmitting}
            style={{ width: '100%', padding: '15px', backgroundColor: 'var(--color-primary-dark)', color: '#fff', border: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', opacity: formik.isSubmitting ? 0.7 : 1 }}
          >
            Authenticate
          </button>
        </form>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <img src={logoWordmark} alt="Amaeti Wordmark" style={{ height: '14px', filter: 'brightness(0)', opacity: 0.5, marginBottom: '15px' }} />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.6', margin: 0 }}>
            No registration or password recovery is available.<br/>
            Contact the technical department for access issues.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
