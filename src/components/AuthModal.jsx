import React, { useState } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, X, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { signUpUser, loginUser } from '../utils/authService.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🛡️');
  const [errorMessage, setErrorMessage] = useState('');

  const AVATARS = ['🛡️', '🦁', '🦊', '⚡', '🚀', '🧭', '🌟', '🤖'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (mode === 'signup') {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setErrorMessage('Please fill in all required fields.');
          return;
        }
        const user = signUpUser({
          name,
          email,
          password,
          avatar: selectedAvatar,
          emergencyContact
        });
        audioSystem.playSuccessSound();
        onAuthSuccess(user);
        onClose();
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMessage('Please enter your email and password.');
          return;
        }
        const user = loginUser(email, password);
        audioSystem.playSuccessSound();
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error');
      audioSystem.playWarningSound();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>{selectedAvatar}</span>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {mode === 'signup' ? 'Create City Life Account' : 'Welcome Back Scout'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                {mode === 'signup' ? 'Join global urban scouts & unlock safety features' : 'Access your verified reports & safe routes'}
              </div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Tab switch: Signup / Login */}
        <div style={{ display: 'flex', padding: '12px 20px 0 20px', gap: 10 }}>
          <button
            type="button"
            className={`filter-chip ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Create Account
          </button>
          <button
            type="button"
            className={`filter-chip ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-content">
          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid #f43f5e',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.74rem',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              {/* Avatar Selector */}
              <div className="form-group">
                <label className="form-label">Choose Scout Avatar</label>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      style={{
                        fontSize: '1.2rem',
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: selectedAvatar === av ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: selectedAvatar === av ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                        cursor: 'pointer'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name or Scout Handle *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Alex River"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                required
                className="form-input"
                placeholder="scout@citylife.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Emergency Contact Phone (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 019-2834"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                Used by SafeRoute SOS Guard to rapid-dispatch your GPS coordinates in emergencies.
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: 8, padding: 12, fontWeight: 700 }}
          >
            {mode === 'signup' ? 'Create Account & Unlock Features 🚀' : 'Sign In to Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
