import React, { useState } from 'react';
import { 
  Lock, Mail, User, Key, CheckCircle2, AlertCircle, 
  X, ArrowRight, ShieldCheck, Sparkles, LogIn 
} from 'lucide-react';
import { loginUser, registerUser, continueAsGuest } from '../utils/authManager.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushAuthModal({ 
  isOpen, 
  onClose, 
  onUserAuthenticated 
}) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const newUser = await registerUser({ name, email, password });
        audioSystem.playSuccessSound();
        if (onUserAuthenticated) onUserAuthenticated(newUser);
        onClose();
      } else {
        const loggedUser = await loginUser({ email, password });
        audioSystem.playSuccessSound();
        if (onUserAuthenticated) onUserAuthenticated(loggedUser);
        onClose();
      }
    } catch (err) {
      audioSystem.playWarningSound();
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    const guestUser = continueAsGuest();
    audioSystem.playTone(600, 'sine', 0.1);
    if (onUserAuthenticated) onUserAuthenticated(guestUser);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2100,
      padding: 16
    }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {authMode === 'signin' ? 'Sign In to Prarush' : 'Create Free Account'}
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
              {authMode === 'signin' 
                ? 'Sign in to access your local workspace & notes on this device' 
                : 'Create a local browser profile isolated to this device'}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: 8,
              padding: 6,
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          padding: '8px 24px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderBottom: authMode === 'signin' ? '2px solid #06b6d4' : '2px solid transparent',
              background: 'transparent',
              color: authMode === 'signin' ? '#06b6d4' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderBottom: authMode === 'signup' ? '2px solid #06b6d4' : '2px solid transparent',
              background: 'transparent',
              color: authMode === 'signup' ? '#06b6d4' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Local-First Preview Notice */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 10,
            fontSize: '0.73rem',
            color: '#94a3b8',
            lineHeight: 1.45
          }}>
            <strong style={{ color: '#38bdf8' }}>Local Profile Preview (Device Only): </strong>
            Profiles and passwords are stored strictly in your browser using OWASP-recommended PBKDF2 key derivation (100,000 iterations, HMAC-SHA256). Sign-in operates as an on-device preview; public accounts and recovery remain planned.
          </div>

          {errorMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#f43f5e',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                required
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 6,
              padding: '12px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)'
            }}
          >
            {isLoading ? 'Verifying Hash...' : (authMode === 'signin' ? 'Sign In Locally' : 'Create Local Profile')}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Guest Mode Divider */}
        <div style={{
          padding: '0 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: 16
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or explore without credentials</span>
          <button
            type="button"
            onClick={handleGuest}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>Continue as Guest (Local Offline Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
