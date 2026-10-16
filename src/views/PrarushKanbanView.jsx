import React, { useState } from 'react';
import { 
  CheckSquare, Plus, MoreVertical, Clock, AlertCircle, 
  CheckCircle2, ArrowRight, Tag, Filter, User 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushKanbanView({ 
  tasks = [], 
  currentWorkspace, 
  onAddTask, 
  onUpdateTaskStatus,
  onDeleteTask 
}) {
  const [filterPriority, setFilterPriority] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('Sprint');

  const columns = [
    { id: 'todo', label: 'To Do', color: '#94a3b8' },
    { id: 'in_progress', label: 'In Progress', color: '#06b6d4' },
    { id: 'review', label: 'In Review', color: '#f59e0b' },
    { id: 'done', label: 'Completed', color: '#10b981' }
  ];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      deadline: newTaskDeadline || '2026-10-30',
      tags: newTaskTags.split(',').map(t => t.trim()),
      workspaceId: currentWorkspace.id,
      status: 'todo',
      assignee: 'Current User'
    });

    audioSystem.playSuccessSound();
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddModalOpen(false);
  };

  const handleAdvanceTask = (task) => {
    const sequence = ['todo', 'in_progress', 'review', 'done'];
    const currentIdx = sequence.indexOf(task.status);
    if (currentIdx < sequence.length - 1) {
      const nextStatus = sequence[currentIdx + 1];
      onUpdateTaskStatus(task.id, nextStatus);
      audioSystem.playTone(650, 'sine', 0.08);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesWorkspace = t.workspaceId === currentWorkspace.id || !t.workspaceId;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchesWorkspace && matchesPriority;
  });

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header & Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={20} color="#06b6d4" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {currentWorkspace.name} &bull; Task Board
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Agile sprints, priority matrices, and team milestone tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
            <Filter size={14} />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: 8,
                padding: '4px 8px',
                color: '#fff',
                fontSize: '0.72rem'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.76rem', padding: '7px 12px' }}
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban 4-Column Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
        alignItems: 'start'
      }}>
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 400
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 8,
                borderBottom: `2px solid ${col.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                    {col.label}
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    padding: '1px 6px',
                    borderRadius: 999
                  }}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.length === 0 ? (
                  <div style={{
                    padding: 24,
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.72rem',
                    border: '1px dashed rgba(255,255,255,0.06)',
                    borderRadius: 10
                  }}>
                    No tasks in {col.label}
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#fff', lineHeight: 1.3 }}>
                          {task.title}
                        </strong>
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          padding: '2px 5px',
                          borderRadius: 4,
                          background: task.priority === 'urgent' ? '#f43f5e20' : task.priority === 'high' ? '#f59e0b20' : '#10b98120',
                          color: task.priority === 'urgent' ? '#fb7185' : task.priority === 'high' ? '#fbbf24' : '#6ee7b7'
                        }}>
                          {task.priority?.toUpperCase()}
                        </span>
                      </div>

                      {task.description && (
                        <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />
                          <span>{task.deadline || 'No deadline'}</span>
                        </div>

                        {col.id !== 'done' && (
                          <button
                            onClick={() => handleAdvanceTask(task)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#38bdf8',
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                            title="Move to next stage"
                          >
                            <span>Advance</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, margin: '0 auto' }}>
            <div className="sheet-handle" />
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>
              Add New Kanban Task
            </h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Task title (e.g., 'Refactor Auth middleware')..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
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
              <textarea
                placeholder="Task description and acceptance criteria..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                rows={3}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 10,
                  padding: 10,
                  color: '#fff',
                  fontSize: '0.82rem',
                  resize: 'none'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Priority:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 8,
                      padding: 8,
                      color: '#fff',
                      fontSize: '0.76rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Deadline:</label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 8,
                      padding: 8,
                      color: '#fff',
                      fontSize: '0.76rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                  Create Task
                </button>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
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
