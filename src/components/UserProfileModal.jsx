import React, { useState } from 'react';
import { User, LogOut, Trash2, Shield, Heart, Award, Phone, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { deleteAccount, logoutUser } from '../utils/authService.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdated }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    logoutUser();
    audioSystem.playTone(500, 'sine', 0.1);
    onUserUpdated(null);
    onClose();
  };

  const handleDeleteAccount = () => {
    deleteAccount(user.id);
    audioSystem.playWarningSound();
    onUserUpdated(null);
    setShowDeleteConfirm(false);
    onClose();
    alert('Your City Life account and all associated local data have been permanently deleted.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>{user.avatar || '👤'}</span>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#10b981' }}>{user.scoutLevel}</div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="sheet-content">
          {/* Scout Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#090d16',
                fontWeight: 800
              }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Verified Urban Scout</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', background: '#10b981', color: '#090d16', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
              ACTIVE
            </span>
          </div>

          {/* Scout Metric Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>14.2 km</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Safe Walked</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>98%</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Safety Score</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>7</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Pins Verified</div>
            </div>
          </div>

          {/* Account Details */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: '0.76rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Email:</span>
              <strong style={{ color: '#fff' }}>{user.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Emergency Contact:</span>
              <strong style={{ color: user.emergencyContact ? '#10b981' : '#f59e0b' }}>
                {user.emergencyContact || 'Not set'}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, padding: 10, justifyContent: 'center' }}
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Sign Out
            </button>

            <button
              className="btn-secondary"
              style={{ flex: 1, padding: 10, justifyContent: 'center', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={15} />
              Delete Account
            </button>
          </div>

          {/* Permanent Delete Account Confirmation */}
          {showDeleteConfirm && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid #f43f5e',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginTop: 6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fb7185', fontWeight: 700, fontSize: '0.82rem' }}>
                <AlertTriangle size={16} />
                <span>Confirm Account Deletion?</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                This will permanently delete your account, saved preferences, bookmarks, and local data. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-primary"
                  style={{ background: '#f43f5e', color: '#fff', padding: '6px 12px', fontSize: '0.72rem' }}
                  onClick={handleDeleteAccount}
                >
                  Yes, Delete My Account Forever
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
