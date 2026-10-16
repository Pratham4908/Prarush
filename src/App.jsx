import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Layers, CheckSquare, Bot, Cpu, FileText, 
  Folder, Zap, Calendar, Shield, Sun, Moon, ArrowRight 
} from 'lucide-react';

// Prarush Core Navigation & Modals
import PrarushHeader from './components/PrarushHeader.jsx';
import PrarushSidebar from './components/PrarushSidebar.jsx';
import CommandCenterModal from './components/CommandCenterModal.jsx';
import SubscriptionModal from './components/SubscriptionModal.jsx';
import PrarushProfileModal from './components/PrarushProfileModal.jsx';

// Prarush 13 Universal Views
import PrarushDashboardView from './views/PrarushDashboardView.jsx';
import PrarushWorkspacesView from './views/PrarushWorkspacesView.jsx';
import PrarushAIAssistantView from './views/PrarushAIAssistantView.jsx';
import PrarushModelHubView from './views/PrarushModelHubView.jsx';
import PrarushContentStudioView from './views/PrarushContentStudioView.jsx';
import PrarushKanbanView from './views/PrarushKanbanView.jsx';
import PrarushNotesView from './views/PrarushNotesView.jsx';
import PrarushCalendarView from './views/PrarushCalendarView.jsx';
import PrarushDocumentsView from './views/PrarushDocumentsView.jsx';
import PrarushKnowledgeView from './views/PrarushKnowledgeView.jsx';
import PrarushAutomationsView from './views/PrarushAutomationsView.jsx';
import PrarushTemplatesView from './views/PrarushTemplatesView.jsx';
import PrarushAdminView from './views/PrarushAdminView.jsx';

// State & Storage
import { 
  STORAGE_KEYS, 
  DEFAULT_WORKSPACES, 
  INITIAL_TASKS, 
  INITIAL_NOTES, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUTOMATIONS, 
  INITIAL_KNOWLEDGE, 
  INITIAL_CALENDAR_EVENTS, 
  getStoredData, 
  saveStoredData, 
  logActivity 
} from './utils/prarushStore.js';
import { audioSystem } from './utils/audioSystem.js';

export default function App() {
  // 1. Workspaces
  const [workspaces, setWorkspaces] = useState(() => 
    getStoredData(STORAGE_KEYS.WORKSPACES, DEFAULT_WORKSPACES)
  );
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => 
    getStoredData(STORAGE_KEYS.ACTIVE_WORKSPACE, DEFAULT_WORKSPACES[0].id)
  );
  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  // 2. Active View Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // 3. Productivity Datasets
  const [tasks, setTasks] = useState(() => 
    getStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );
  const [notes, setNotes] = useState(() => 
    getStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES)
  );
  const [documents, setDocuments] = useState(() => 
    getStoredData(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS)
  );
  const [automations, setAutomations] = useState(() => 
    getStoredData(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS)
  );
  const [knowledge, setKnowledge] = useState(() => 
    getStoredData(STORAGE_KEYS.KNOWLEDGE, INITIAL_KNOWLEDGE)
  );
  const [events, setEvents] = useState(() => 
    getStoredData(STORAGE_KEYS.EVENTS, INITIAL_CALENDAR_EVENTS)
  );

  // 4. Global Settings & Controls
  const [selectedModelId, setSelectedModelId] = useState('prarush-neural-4');
  const [currentLocale, setCurrentLocale] = useState(() => 
    getStoredData('prarush_locale', 'en')
  );
  const [isDarkMode, setIsDarkMode] = useState(() => 
    getStoredData(STORAGE_KEYS.THEME, true)
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 5. Modals
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 6. User Profile
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-prarush-1',
    name: 'Pratham Dev',
    email: 'pratham@prarush.ai',
    avatar: '⚡',
    role: 'Lead Architect & AI Systems Specialist'
  });

  // Global Keyboard Listener for Ctrl+K / Cmd+K (Command Center)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandCenterOpen(false);
        setIsProfileModalOpen(false);
        setIsSubscriptionModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update theme class on body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('prarush-light-theme');
    } else {
      document.body.classList.add('prarush-light-theme');
    }
  }, [isDarkMode]);

  // Actions
  const handleSelectWorkspace = (wsId) => {
    setActiveWorkspaceId(wsId);
    saveStoredData(STORAGE_KEYS.ACTIVE_WORKSPACE, wsId);
    logActivity('Workspace Switch', `Switched active context to ${wsId}`, wsId);
    audioSystem.playTone(520, 'sine', 0.08);
  };

  const handleCreateWorkspace = (newWs) => {
    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    setActiveWorkspaceId(newWs.id);
    saveStoredData(STORAGE_KEYS.WORKSPACES, updated);
    saveStoredData(STORAGE_KEYS.ACTIVE_WORKSPACE, newWs.id);
    logActivity('Workspace Created', `Created project workspace: ${newWs.name}`, newWs.id);
    audioSystem.playSuccessSound();
  };

  const handleAddTask = (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      workspaceId: taskData.workspaceId || activeWorkspaceId,
      title: taskData.title,
      description: taskData.description || 'Quick captured task item',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      deadline: taskData.deadline || '2026-10-30',
      tags: taskData.tags || ['Sprint'],
      assignee: currentUser.name,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStoredData(STORAGE_KEYS.TASKS, updated);
    logActivity('Task Created', `Added task "${newTask.title}"`, newTask.workspaceId);
    audioSystem.playSuccessSound();
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updated);
    saveStoredData(STORAGE_KEYS.TASKS, updated);
    logActivity('Task Status Changed', `Task moved to ${newStatus}`, activeWorkspaceId);
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveStoredData(STORAGE_KEYS.TASKS, updated);
    logActivity('Task Deleted', `Removed task ${taskId}`, activeWorkspaceId);
  };

  const handleSaveNote = (noteData) => {
    const existingIndex = notes.findIndex(n => n.id === noteData.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...notes];
      updated[existingIndex] = { ...updated[existingIndex], ...noteData, updatedAt: new Date().toISOString() };
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        title: noteData.title || 'Untitled Thought',
        content: noteData.content || '',
        category: 'general',
        tags: ['Draft'],
        pinned: false,
        updatedAt: new Date().toISOString()
      };
      updated = [newNote, ...notes];
    }
    setNotes(updated);
    saveStoredData(STORAGE_KEYS.NOTES, updated);
    logActivity('Note Saved', `Saved document: ${noteData.title}`, activeWorkspaceId);
  };

  const handleDeleteNote = (noteId) => {
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    saveStoredData(STORAGE_KEYS.NOTES, updated);
  };

  const handleUploadDocument = (docData) => {
    const updated = [docData, ...documents];
    setDocuments(updated);
    saveStoredData(STORAGE_KEYS.DOCUMENTS, updated);
    logActivity('Document Added', `Uploaded file: ${docData.name}`, activeWorkspaceId);
  };

  const handleDeleteDocument = (docId) => {
    const updated = documents.filter(d => d.id !== docId);
    setDocuments(updated);
    saveStoredData(STORAGE_KEYS.DOCUMENTS, updated);
  };

  const handleAddEvent = (evtData) => {
    const updated = [...events, evtData];
    setEvents(updated);
    saveStoredData(STORAGE_KEYS.EVENTS, updated);
    logActivity('Calendar Event', `Added event: ${evtData.title}`, activeWorkspaceId);
  };

  const handleCloneTemplate = (tpl) => {
    // Clone template as a project in active workspace
    const sampleTask = {
      title: `[Template] ${tpl.name} - Initial Sprint`,
      workspaceId: activeWorkspaceId,
      description: `Imported from community template by ${tpl.author}`,
      priority: 'high',
      status: 'in_progress',
      tags: [tpl.category, 'Template']
    };
    handleAddTask(sampleTask);
    setActiveTab('kanban');
  };

  const handleToggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    saveStoredData(STORAGE_KEYS.THEME, next);
  };

  const handleChangeLocale = (loc) => {
    setCurrentLocale(loc);
    saveStoredData('prarush_locale', loc);
  };

  // Render active view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <PrarushDashboardView
            currentWorkspace={currentWorkspace}
            tasks={tasks}
            notes={notes}
            documents={documents}
            automations={automations}
            onNavigate={(tab) => setActiveTab(tab)}
            onAddTask={handleAddTask}
            onOpenAIWithPrompt={() => setActiveTab('ai_assistant')}
            currentUser={currentUser}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        );

      case 'workspaces':
        return (
          <PrarushWorkspacesView
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelectWorkspace={handleSelectWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
          />
        );

      case 'ai_assistant':
        return (
          <PrarushAIAssistantView
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'model_hub':
        return (
          <PrarushModelHubView
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        );

      case 'content_studio':
        return (
          <PrarushContentStudioView
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        );

      case 'kanban':
        return (
          <PrarushKanbanView
            tasks={tasks}
            currentWorkspace={currentWorkspace}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        );

      case 'notes':
        return (
          <PrarushNotesView
            notes={notes}
            currentWorkspace={currentWorkspace}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
          />
        );

      case 'calendar':
        return (
          <PrarushCalendarView
            events={events}
            currentWorkspace={currentWorkspace}
            onAddEvent={handleAddEvent}
          />
        );

      case 'documents':
        return (
          <PrarushDocumentsView
            documents={documents}
            currentWorkspace={currentWorkspace}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        );

      case 'knowledge':
        return (
          <PrarushKnowledgeView
            knowledgeItems={knowledge}
          />
        );

      case 'automations':
        return (
          <PrarushAutomationsView
            automations={automations}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        );

      case 'templates':
        return (
          <PrarushTemplatesView
            onCloneTemplate={handleCloneTemplate}
          />
        );

      case 'admin':
        return (
          <PrarushAdminView />
        );

      default:
        return (
          <PrarushDashboardView
            currentWorkspace={currentWorkspace}
            tasks={tasks}
            notes={notes}
            documents={documents}
            automations={automations}
            onNavigate={(tab) => setActiveTab(tab)}
            onAddTask={handleAddTask}
            onOpenAIWithPrompt={() => setActiveTab('ai_assistant')}
            currentUser={currentUser}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="prarush-app-root" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: isDarkMode ? '#060911' : '#f8fafc',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* 1. Global Navigation Top Header */}
      <PrarushHeader
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
        currentLocale={currentLocale}
        onChangeLocale={handleChangeLocale}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onQuickCreateTask={() => {
          handleAddTask({
            title: 'New Quick Task',
            priority: 'medium',
            status: 'todo'
          });
          setActiveTab('kanban');
        }}
      />

      {/* 2. Body Layout: Sidebar + Main Canvas */}
      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Collapsible Left Navigation Sidebar */}
        <PrarushSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          currentLocale={currentLocale}
          unreadTasksCount={tasks.filter(t => t.status !== 'done').length}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main 
          className="prarush-main-canvas"
          style={{
            flex: 1,
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
            background: isDarkMode 
              ? 'radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.05) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)' 
              : '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Global Command Center Modal (Ctrl+K) */}
      <CommandCenterModal
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsCommandCenterOpen(false);
        }}
        workspaces={workspaces}
        onSelectWorkspace={(wsId) => {
          handleSelectWorkspace(wsId);
          setIsCommandCenterOpen(false);
        }}
        onOpenSubscription={() => {
          setIsCommandCenterOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
      />

      {/* 4. Freemium Upgrade / Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        user={currentUser}
        onSubscriptionChanged={() => {
          audioSystem.playSuccessSound();
        }}
      />

      {/* 5. User Profile & GDPR Privacy Modal */}
      <PrarushProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
      />
    </div>
  );
}
