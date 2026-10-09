import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Square, CheckCircle, AlertTriangle, Sparkles, X, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzeCitizenReport } from '../utils/aiEngine';
import { audioSystem } from '../utils/audioSystem';

export default function CitizenReportModal({ isOpen, onClose, onSubmitReport }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('hazard');
  const [location, setLocation] = useState('Old Quarter, Corner 4th St');
  const [description, setDescription] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80');
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [hasVoiceMemo, setHasVoiceMemo] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const timerRef = useRef(null);

  // Pre-configured realistic photo options
  const PHOTO_PRESETS = [
    { label: 'Pothole Hazard', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' },
    { label: 'Dark Alleyway', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
    { label: 'Street Food Stall', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80' },
    { label: 'Street Musician', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80' },
  ];

  // AI Sentiment assessment
  const aiAssessment = analyzeCitizenReport(title, description);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setVoiceSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setIsRecording(true);
    setVoiceSeconds(0);
    audioSystem.playTone(600, 'sine', 0.1);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasVoiceMemo(true);
    audioSystem.playTone(800, 'sine', 0.15);
    
    // Auto synthesize voice memo transcript based on input context
    const transcript = description 
      ? `Citizen audio dispatch: "${description}"`
      : `Citizen audio dispatch: Reporting ${category} at ${location}. Please take caution.`;
    setVoiceTranscript(transcript);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReport = {
      id: `report-${Date.now()}`,
      category: category,
      categoryLabel: category === 'hazard' ? 'Street Hazard' : (category === 'food_gem' ? 'Hidden Gem Alert' : (category === 'lighting' ? 'Poor Lighting' : 'Cultural Pop-Up')),
      title: title.trim(),
      author: 'You (Urban Contributor)',
      authorBadge: 'Level 1 Local Scout',
      location: location.trim(),
      coords: [40.716 + (Math.random() - 0.5) * 0.005, -74.004 + (Math.random() - 0.5) * 0.005],
      timestamp: 'Just now',
      upvotes: 1,
      verified: false,
      verificationAgency: 'Pending Community Verification',
      description: description.trim() || 'Citizen reported update via City Life Mobile App.',
      hasVoiceNote: hasVoiceMemo,
      voiceDuration: hasVoiceMemo ? `0:${voiceSeconds < 10 ? '0' : ''}${voiceSeconds}` : null,
      voiceTranscript: hasVoiceMemo ? voiceTranscript : null,
      image: selectedPhoto,
      sentiment: aiAssessment.sentiment,
      severity: aiAssessment.severity
    };

    onSubmitReport(newReport);
    audioSystem.playSuccessSound();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="sheet-handle" />
        
        <div className="sheet-header">
          <span className="sheet-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📣</span> Submit Citizen Urban Report
          </span>
          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-content">
          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">Report Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: 'hazard', label: '⚠️ Road Hazard' },
                { id: 'lighting', label: '💡 Poor Lighting' },
                { id: 'food_gem', label: '🍜 Hidden Food Gem' },
                { id: 'culture', label: '🎨 Cultural Pop-Up' }
              ].map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    background: category === c.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: category === c.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    color: category === c.id ? '#fff' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Report Headline *</label>
            <input
              id="report-headline-input"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Broken pavement, or Midnight Bao stall open"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location / Street Cross</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Details &amp; Advice for Walkers</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Give specific hints, time observations, or warnings..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Voice Memo Recording Studio */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🎙️ Attach Voice Memo (Audio Note)</span>
              {hasVoiceMemo && <span style={{ color: '#10b981', fontSize: '0.7rem' }}>Recorded (0:{voiceSeconds < 10 ? '0' : ''}{voiceSeconds})</span>}
            </label>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed var(--border-glass)',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'rgba(244, 63, 94, 0.2)',
                      border: '1px solid #f43f5e',
                      color: '#fb7185',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Start Voice Recording"
                    aria-label="Start recording voice note"
                  >
                    <Mic size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: '#f43f5e',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulseAlarm 1s infinite alternate'
                    }}
                    title="Stop Voice Recording"
                    aria-label="Stop recording voice note"
                  >
                    <Square size={16} />
                  </button>
                )}

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                    {isRecording ? `Recording audio: ${voiceSeconds}s...` : (hasVoiceMemo ? 'Voice Note Ready' : 'Tap mic to record 15s voice tip')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    {isRecording ? 'Speak now into microphone' : 'Auto transcribed with NLP'}
                  </div>
                </div>
              </div>

              {hasVoiceMemo && (
                <button
                  type="button"
                  className="sim-btn"
                  onClick={() => audioSystem.speak(voiceTranscript)}
                >
                  <Volume2 size={12} /> Play
                </button>
              )}
            </div>
          </div>

          {/* Photo Presets */}
          <div className="form-group">
            <label className="form-label">Attach Photo Proof</label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {PHOTO_PRESETS.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(p.url)}
                  style={{
                    width: 72,
                    height: 52,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedPhoto === p.url ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                    flexShrink: 0,
                    opacity: selectedPhoto === p.url ? 1 : 0.6
                  }}
                >
                  <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Pre-Publish Sentiment Card */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
              <Sparkles size={14} />
              <span>AI Classifier: <strong>{aiAssessment.aiTag}</strong></span>
            </div>
            <span style={{ color: '#94a3b8' }}>{aiAssessment.safetyImpact}</span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: 8, padding: 12, fontWeight: 700 }}
          >
            Publish Verified Citizen Report 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
