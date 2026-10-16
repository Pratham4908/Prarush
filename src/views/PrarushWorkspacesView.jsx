import React, { useState } from 'react';
import { 
  Layers, Plus, CheckCircle2, ArrowRight, Folder, 
  Trash2, Edit, Check 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushWorkspacesView({
  workspaces = [],
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('work');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWs = {
      id: `ws-${Date.now()}`,
      name: name.trim(),
      icon,
      description: desc.trim() || 'Custom user workspace',
      category,
      color: '#06b6d4',
      createdAt: new Date().toISOString()
    };

    onCreateWorkspace(newWs);
    audioSystem.playSuccessSound();
    setName('');
    setDesc('');
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
            <Layers size={24} color="#06b6d4" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Universal Workspaces Directory
            </h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0', maxWidth: 660 }}>
            Segregate work, research, creator projects, and personal routines into isolated workspaces with dedicated tasks, documents, and memory.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '8px 14px' }}
        >
          <Plus size={15} />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Workspaces Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16
      }}>
        {workspaces.map(ws => {
          const isActive = ws.id === activeWorkspaceId;

          return (
            <div
              key={ws.id}
              style={{
                background: 'var(--bg-card)',
                border: isActive ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: isActive ? '0 0 20px rgba(6, 182, 212, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '2rem' }}>{ws.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {ws.name}
                    </h3>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#06b6d4',
                      textTransform: 'uppercase'
                    }}>
                      Category: {ws.category}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    background: 'var(--accent-cyan)',
                    color: '#090d16',
                    padding: '2px 8px',
                    borderRadius: 999
                  }}>
                    CURRENT ACTIVE
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                {ws.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Created {new Date(ws.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    audioSystem.playSuccessSound();
                  }}
                  className={isActive ? "btn-secondary" : "btn-primary"}
                  style={{ fontSize: '0.74rem', padding: '6px 12px' }}
                >
                  {isActive ? 'Selected ✓' : 'Switch Workspace'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Workspace Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="sheet-handle" />
            <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, marginBottom: 14 }}>
              Create New Universal Workspace
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Workspace Name:</label>
                <input
                  type="text"
                  placeholder="e.g. 'Startup Incubation' or 'BioTech Thesis'..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 8,
                    padding: 10,
                    color: '#fff',
                    fontSize: '0.82rem',
                    marginTop: 4
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Icon Emoji:</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 8,
                      padding: 8,
                      color: '#fff',
                      fontSize: '0.82rem',
                      marginTop: 4
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 8,
                      padding: 8,
                      color: '#fff',
                      fontSize: '0.82rem',
                      marginTop: 4
                    }}
                  >
                    <option value="personal">Personal</option>
                    <option value="study">Academic / Study</option>
                    <option value="developer">Engineering / Dev</option>
                    <option value="creator">Creative / Media</option>
                    <option value="business">Business / Venture</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Short Description:</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Goals, milestones, and scope for this workspace..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 8,
                    padding: 8,
                    color: '#fff',
                    fontSize: '0.8rem',
                    marginTop: 4,
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                  Create Workspace
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
