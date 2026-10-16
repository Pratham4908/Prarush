import React, { useState } from 'react';
import { 
  FileText, Plus, Pin, Download, Sparkles, Trash2, 
  Search, Eye, Edit3, Check, RefreshCw 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { processPrarushAIQuery } from '../utils/prarushAI.js';

export default function PrarushNotesView({
  notes = [],
  currentWorkspace,
  onSaveNote,
  onDeleteNote
}) {
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // Active note
  const currentNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const [title, setTitle] = useState(currentNote?.title || 'New Note');
  const [content, setContent] = useState(currentNote?.content || '# Draft Title\n\nStart typing ideas here...');

  // Sync when note selected
  const handleSelectNote = (note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    audioSystem.playTone(600, 'sine', 0.06);
  };

  const handleCreateNewNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      workspaceId: currentWorkspace.id,
      title: 'Untitled Note',
      content: '# Untitled Note\n\nWrite your thoughts, research, or meeting minutes...',
      tags: ['Draft'],
      pinned: false,
      updatedAt: new Date().toISOString()
    };
    onSaveNote(newNote);
    handleSelectNote(newNote);
    audioSystem.playSuccessSound();
  };

  const handleSaveCurrentNote = () => {
    if (!currentNote) return;
    const updated = {
      ...currentNote,
      title,
      content,
      updatedAt: new Date().toISOString()
    };
    onSaveNote(updated);
    audioSystem.playSuccessSound();
  };

  // AI Polish & Enhance
  const handleAIPolish = () => {
    setIsPolishing(true);
    audioSystem.playTone(700, 'sine', 0.1);

    setTimeout(() => {
      const res = processPrarushAIQuery(`Summarize and improve this note: ${content}`);
      const polishedContent = `${content}\n\n---\n### 🤖 AI Executive Summary & Key Findings\n${res.keyFindings ? res.keyFindings.map(k => `- ${k}`).join('\n') : res.text}`;
      setContent(polishedContent);
      setIsPolishing(false);
      audioSystem.playSuccessSound();
    }, 700);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    audioSystem.playSuccessSound();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const filteredNotes = notes.filter(n => {
    const matchesWs = n.workspaceId === currentWorkspace.id || !n.workspaceId;
    const matchesQ = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWs && matchesQ;
  });

  return (
    <div className="prarush-view-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Left Column: Notes List & Search */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Notes &amp; Docs
            </h3>
          </div>
          <button
            onClick={handleCreateNewNote}
            className="btn-primary"
            style={{ fontSize: '0.7rem', padding: '5px 10px' }}
          >
            <Plus size={13} />
            <span>New Note</span>
          </button>
        </div>

        {/* Search Notes */}
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: 9 }} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: 8,
              padding: '6px 10px 6px 30px',
              color: '#fff',
              fontSize: '0.75rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Notes Items List */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {filteredNotes.map(n => {
            const isSelected = n.id === currentNote?.id;
            return (
              <div
                key={n.id}
                onClick={() => handleSelectNote(n)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: isSelected ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#fff' }}>
                    {n.title}
                  </strong>
                  {n.pinned && <Pin size={11} color="#f59e0b" />}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.content.replace(/#|\*|_/g, '').slice(0, 60)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Note Editor & Preview */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Editor Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#fff',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              flex: 1
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {wordCount} words &bull; ~{readingTime} min read
            </span>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="sim-btn"
              style={{ fontSize: '0.7rem', padding: '5px 8px' }}
              title={isEditing ? "Switch to Markdown Preview" : "Switch to Editor"}
            >
              {isEditing ? <Eye size={13} /> : <Edit3 size={13} />}
              <span>{isEditing ? 'Preview' : 'Edit'}</span>
            </button>

            <button
              onClick={handleAIPolish}
              disabled={isPolishing}
              className="sim-btn"
              style={{ fontSize: '0.7rem', padding: '5px 8px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              title="Enhance & summarize note with AI"
            >
              {isPolishing ? <RefreshCw size={13} className="spin-slow" /> : <Sparkles size={13} />}
              <span>AI Polish</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="sim-btn"
              style={{ fontSize: '0.7rem', padding: '5px 8px' }}
              title="Export as Markdown .md file"
            >
              <Download size={13} />
            </button>

            <button
              onClick={handleSaveCurrentNote}
              className="btn-primary"
              style={{ fontSize: '0.72rem', padding: '5px 10px' }}
            >
              <Check size={13} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Text Area or Preview */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.84rem',
              lineHeight: 1.6,
              resize: 'none',
              fontFamily: 'Consolas, Monaco, monospace'
            }}
          />
        ) : (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            color: '#cbd5e1',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
