import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Plus, Clock, Tag, CheckCircle2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushCalendarView({ 
  events = [], 
  currentWorkspace, 
  onAddEvent 
}) {
  const [eventList, setEventList] = useState(events);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-10-24');
  const [newEventTime, setNewEventTime] = useState('14:00 - 15:00');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const created = {
      id: `evt-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      workspaceId: currentWorkspace.id,
      color: '#06b6d4'
    };

    setEventList(prev => [...prev, created]);
    if (onAddEvent) onAddEvent(created);
    audioSystem.playSuccessSound();
    setNewEventTitle('');
    setIsAddOpen(false);
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={24} color="#06b6d4" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Calendar &amp; Event Scheduler
            </h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
            Unified schedule synchronizing release milestones, sprint deadlines, and AI workflow cron triggers.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '8px 14px' }}
        >
          <Plus size={15} />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* Events Agenda Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {eventList.map(evt => (
          <div
            key={evt.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}>
                <span style={{ fontSize: '0.95rem' }}>{evt.date.split('-')[2] || '20'}</span>
                <span style={{ fontSize: '0.55rem', textTransform: 'uppercase' }}>OCT</span>
              </div>

              <div>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {evt.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: '0.74rem', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    <span>{evt.time}</span>
                  </div>
                  <span>&bull;</span>
                  <span>Workspace: {currentWorkspace.name}</span>
                </div>
              </div>
            </div>

            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '3px 10px',
              borderRadius: 999
            }}>
              CONFIRMED
            </span>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="sheet-handle" />
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>
              Schedule New Calendar Event
            </h3>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Event title..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 10,
                  padding: 10,
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 8,
                    padding: 8,
                    color: '#fff',
                    fontSize: '0.78rem'
                  }}
                />
                <input
                  type="text"
                  placeholder="14:00 - 15:00"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 8,
                    padding: 8,
                    color: '#fff',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                  Save Event
                </button>
                <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)} style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
