import React, { useState, useEffect } from 'react';
import { ShieldCheck, BellRing, Phone, Heart, CheckCircle, AlertTriangle, X, Play, Square } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function NightWalkGuardianModal({ 
  isOpen, 
  onClose, 
  user, 
  currentCityName = 'Current Location',
  onTriggerSOS 
}) {
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins default
  const [totalSeconds, setTotalSeconds] = useState(900);
  const [checkInMissed, setCheckInMissed] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setCheckInMissed(true);
            audioSystem.playWarningSound();
            return 0;
          }
          // gentle chime reminder at 60s
          if (prev === 60) {
            audioSystem.playTone(550, 'triangle', 0.2);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const handleStartGuardian = (mins = 15) => {
    setSecondsRemaining(mins * 60);
    setTotalSeconds(mins * 60);
    setIsActive(true);
    setCheckInMissed(false);
    audioSystem.playSuccessSound();
  };

  const handleImSafeCheckIn = () => {
    audioSystem.playTone(880, 'sine', 0.15);
    setSecondsRemaining(totalSeconds); // reset countdown
    setCheckInMissed(false);
  };

  const handleStopGuardian = () => {
    setIsActive(false);
    setCheckInMissed(false);
    audioSystem.playTone(440, 'sine', 0.1);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const emergencyMessage = `🚨 EMERGENCY DISPATCH: I am walking in ${currentCityName} and missed my SafeRoute Guardian check-in. My emergency contact is ${user?.emergencyContact || '911'}. Please verify my location.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? '#10b981' : '#fb7185'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                Night Walk Guardian™
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                Live autonomous safety countdown companion
              </div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="sheet-content">
          {!isActive ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 14,
                padding: 14,
                fontSize: '0.78rem',
                color: '#cbd5e1',
                lineHeight: 1.45
              }}>
                🌟 <strong>How Guardian Mode Protects You:</strong> Set your estimated walk duration. If you don’t tap <em>"I'm Safe"</em> before the timer expires, Guardian automatically sounds an acoustic siren and generates an emergency location dispatch to your contacts.
              </div>

              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                Select Walk Duration:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[10, 15, 25].map(mins => (
                  <button
                    key={mins}
                    className="btn-secondary"
                    onClick={() => handleStartGuardian(mins)}
                    style={{ justifyContent: 'center', padding: '12px 10px', flexDirection: 'column', gap: 2 }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{mins}m</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Quick Walk</span>
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => handleStartGuardian(15)}
                style={{ padding: 14, fontWeight: 700, marginTop: 4 }}
              >
                <Play size={16} /> Start 15-Minute Safe Guardian Walk
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              {/* Pulsing Timer Circle */}
              <div style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: checkInMissed ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                border: `3px solid ${checkInMissed ? '#f43f5e' : '#10b981'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: checkInMissed ? '0 0 30px #f43f5e' : '0 0 20px rgba(16, 185, 129, 0.3)',
                animation: checkInMissed ? 'pulseAlarm 0.8s infinite alternate' : 'none'
              }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                  {formatTime(secondsRemaining)}
                </span>
                <span style={{ fontSize: '0.65rem', color: checkInMissed ? '#f43f5e' : '#86efac', fontWeight: 700 }}>
                  {checkInMissed ? 'CHECK-IN MISSED!' : 'TIME REMAINING'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                  {checkInMissed ? '⚠️ Alert! Are you okay?' : 'Guardian is actively monitoring your route'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
                  {checkInMissed ? 'Tap "I\'m Safe" or SOS will be triggered!' : 'Tap "I\'m Safe" anytime to reset your check-in timer.'}
                </div>
              </div>

              {/* Big "I'M SAFE" Check-in Button */}
              <button
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  width: '100%',
                  padding: 14,
                  fontSize: '0.95rem',
                  fontWeight: 800
                }}
                onClick={handleImSafeCheckIn}
              >
                <CheckCircle size={20} /> I'M SAFE — RESET CHECK-IN
              </button>

              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: 10, justifyContent: 'center' }}
                  onClick={handleStopGuardian}
                >
                  <Square size={14} /> End Guardian Walk
                </button>

                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: 10, justifyContent: 'center', background: '#f43f5e' }}
                  onClick={onTriggerSOS}
                >
                  <BellRing size={14} /> Sound SOS Siren
                </button>
              </div>

              {/* Emergency Text Dispatch Link */}
              <a
                href={`sms:?body=${encodeURIComponent(emergencyMessage)}`}
                style={{
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Phone size={13} /> Rapid Dispatch SMS to Emergency Contact
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
