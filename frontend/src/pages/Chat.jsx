import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { FaGraduationCap, FaPaperPlane, FaRobot, FaUser, FaChevronDown, FaChevronRight, FaFileAlt, FaPlus, FaComments, FaTrash, FaEdit, FaRedo } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import InteractiveQuiz from '../components/InteractiveQuiz';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ConfirmModal from '../components/ConfirmModal';

const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

function Chat() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  
  // Session states
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeSessionRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  // Fetch modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/modules`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setModules(data);
          if (data.length > 0) {
            setSelectedModule(data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err);
      }
    };
    fetchModules();
  }, [apiBaseUrl]);

  // Fetch sessions when module changes
  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedModule) {
        setSessions([]);
        setSelectedSession(null);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
          if (data.length > 0) {
            setSelectedSession(null);
          } else {
            setSelectedSession(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };
    fetchSessions();
  }, [selectedModule, apiBaseUrl]);

  // Fetch chat history when session changes
  useEffect(() => {
    setMessages([]);
    setIsLoading(false);
    setError(null);
    
    const fetchHistory = async () => {
      if (!selectedModule || !selectedSession) {
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/chat`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            sources: msg.sources || []
          })));
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchHistory();
  }, [selectedSession, selectedModule, apiBaseUrl]);

  // Track active session for race conditions
  useEffect(() => {
    activeSessionRef.current = selectedSession?.id;
  }, [selectedSession]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
    }
  };

  // Build conversation history for multi-turn
  const buildConversationHistory = () => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content
    }));
  };

  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newChatTitle || 'New Chat',
          documentIds: selectedDocs.length > 0 ? selectedDocs : null
        })
      });
      if (response.ok) {
        const session = await response.json();
        setSessions([session, ...sessions]);
        setSelectedSession(session);
        setShowNewChatModal(false);
        setNewChatTitle('');
        setSelectedDocs([]);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation(); // Prevent selecting the session
    setSessionToDelete(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    const sessionId = sessionToDelete;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (selectedSession?.id === sessionId) {
          setSelectedSession(sessions.find(s => s.id !== sessionId) || null);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setSessionToDelete(null);
    }
  };

  const handleSend = async (overrideText = null) => {
    const question = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!question || isLoading) return;

    if (!selectedModule) {
      setError('Please select a module first.');
      return;
    }

    if (!selectedSession) {
      setError('Please create a chat session first.');
      return;
    }

    const currentSessionId = selectedSession.id;

    // Add user message
    const tempId = Date.now().toString();
    const userMessage = { id: tempId, role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    if (typeof overrideText !== 'string') setInput('');
    setError(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const token = localStorage.getItem('token');

      // Save user message to backend
      fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'user', content: question })
      })
      .then(res => res.json())
      .then(savedMsg => {
        if (activeSessionRef.current === currentSessionId) {
           setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: savedMsg.id } : m));
        }
      })
      .catch(err => console.error('Failed to save user message:', err));

      // Decode the JWT to get the user_id
      let userId = 'unknown';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload._id || payload.id || payload.userId || payload.sub || 'unknown';
        } catch {
          userId = 'unknown';
        }
      }

      const conversationHistory = buildConversationHistory();

      const response = await fetch(`${AI_SERVICE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          module_id: selectedModule._id,
          question: question,
          top_k: 3,
          document_ids: selectedSession.documentIds || null,
          conversation_history: conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${response.status})`);
      }

      const data = await response.json();

      const assistantTempId = Date.now().toString() + 'ai';
      const assistantMessage = {
        id: assistantTempId,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || []
      };

      // Only update UI if we are still on the same session
      if (activeSessionRef.current === currentSessionId) {
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Save AI message to backend (we always save it, even if user navigated away)
      fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${currentSessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'assistant', content: data.answer, sources: data.sources || [] })
      })
      .then(res => res.json())
      .then(savedMsg => {
        if (activeSessionRef.current === currentSessionId) {
           setMessages(prev => prev.map(m => m.id === assistantTempId ? { ...m, id: savedMsg.id } : m));
        }
      })
      .catch(err => console.error('Failed to save AI message:', err));
    } catch (err) {
      if (activeSessionRef.current === currentSessionId) {
        setError(err.message);
      }
    } finally {
      if (activeSessionRef.current === currentSessionId) {
        setIsLoading(false);
      }
    }
  };

  const handleEditMessage = async (msgId, newContent) => {
    if (!selectedModule || !selectedSession || !msgId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/messages/${msgId}/truncate`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgIndex = messages.findIndex(m => m.id === msgId);
      if (msgIndex !== -1) {
        setMessages(messages.slice(0, msgIndex));
        handleSend(newContent);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateMessage = async (msgId) => {
    if (!selectedModule || !selectedSession || !msgId) return;
    try {
      const token = localStorage.getItem('token');
      const msgIndex = messages.findIndex(m => m.id === msgId);
      if (msgIndex === -1) return;
      
      let userMsgIndex = -1;
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userMsgIndex = i;
          break;
        }
      }
      
      if (userMsgIndex === -1) return;
      const userMsg = messages[userMsgIndex];

      await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/messages/${userMsg.id}/truncate`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessages(messages.slice(0, userMsgIndex));
      handleSend(userMsg.content);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-100 bg-slate-900">
      <Navbar />
      <div className="flex-1 pt-20 flex flex-row h-full">
        
        {/* Secondary Sidebar: Modules & Chats */}
        <div className="w-72 bg-slate-800/80 border-r border-slate-700/80 flex flex-col z-20 shadow-xl shrink-0 h-full">
          <div className="p-6 border-b border-slate-700/80">
            <h2 className="text-xl font-extrabold text-white mb-6 drop-shadow-sm flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                <FaGraduationCap size={20} className="text-white" />
              </div>
              AI Tutor
            </h2>
            <div className="space-y-2">
              <label htmlFor="module-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Module
              </label>
              <select
                id="module-select"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm font-bold border-slate-600/50 shadow-sm shadow-black/20 focus:border-primary/50 bg-slate-900/50"
                value={selectedModule?._id || ''}
                onChange={(e) => {
                  const mod = modules.find(m => m._id === e.target.value);
                  setSelectedModule(mod || null);
                  setSelectedSession(null);
                }}
              >
                {modules.length === 0 && <option value="">No modules found</option>}
                {modules.map(mod => (
                  <option key={mod._id} value={mod._id}>
                    {mod.moduleCode ? `${mod.moduleCode} - ` : ''}{mod.moduleName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <div className="flex items-center justify-between px-2 mb-4 mt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chat Sessions</span>
            </div>
            
            {sessions.map(s => (
              <div
                key={s.id}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  selectedSession?.id === s.id 
                    ? 'bg-primary/20 border border-primary/30 shadow-sm shadow-primary/10 text-white' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
                }`}
                onClick={() => setSelectedSession(s)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FaComments className={selectedSession?.id === s.id ? 'text-primary' : 'text-slate-500'} />
                  <span className="text-sm font-bold truncate">{s.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Delete Session"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}

            {sessions.length === 0 && selectedModule && (
              <div className="text-center p-4">
                <p className="text-sm text-slate-500 italic">No chats yet</p>
              </div>
            )}
            {!selectedModule && (
              <div className="text-center p-4">
                <p className="text-sm text-slate-500 italic">Select a module first</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-700/80">
            <button
              onClick={() => setShowNewChatModal(true)}
              disabled={!selectedModule}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-secondary hover:scale-[1.02] active:scale-[0.98] transition-all text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
            >
              <FaPlus /> New Chat
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-slate-900/50">
          
          {/* Header */}
          <header className="h-20 glass-panel border-b border-slate-600/50 shadow-md shadow-black/20 flex items-center px-8 z-10 shrink-0 relative">
            {selectedSession ? (
              <div>
                <h2 className="text-lg font-bold text-white">{selectedSession.title}</h2>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {selectedSession.documentIds?.length ? `Filtered to ${selectedSession.documentIds.length} PDFs` : 'Using all module PDFs'}
                </p>
              </div>
            ) : (
              <div className="text-slate-400 font-bold">Select or create a chat session to start</div>
            )}
          </header>

          {/* Error */}
          {error && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex justify-between items-center shadow-xl shadow-red-500/10 backdrop-blur-md">
              <p className="text-sm font-bold">⚠️ {error}</p>
              <button onClick={() => setError(null)} className="text-red-300 hover:text-white bg-red-500/20 px-2 py-1 rounded">✕</button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto space-y-10 pb-10">
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-70 mt-10">
                  <div className="bg-slate-800 p-6 rounded-full mb-6 shadow-[0_0_30px_rgba(14,165,233,0.2)] border border-slate-700/50">
                    <FaRobot size={64} className="text-primary" />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-3 drop-shadow-md">
                    {!selectedSession ? 'Create a Chat Session' : 'How can I help you?'}
                  </h2>
                  <p className="text-slate-400 max-w-md text-lg font-medium">
                    {!selectedSession 
                      ? 'Click "+ New Chat" on the left to start a conversation and select your PDFs.' 
                      : 'Ask questions based on your selected PDFs. I will cite my sources!'}
                  </p>
                  {!selectedSession && selectedModule && (
                    <button 
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-6 bg-gradient-to-br from-primary to-secondary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                    >
                      Start New Chat
                    </button>
                  )}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <MessageBubble 
                    key={index} 
                    message={msg} 
                    onEdit={handleEditMessage} 
                    onRegenerate={handleRegenerateMessage} 
                  />
                ))
              )}

              {isLoading && (
                <div className="flex gap-4 p-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                    <FaRobot className="text-white text-lg" />
                  </div>
                  <div className="glass-panel py-3 px-5 rounded-2xl rounded-tl-sm flex items-center gap-2 border border-slate-600/50 shadow-md">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <Footer />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/80 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] shrink-0 relative z-10">
            <div className="max-w-4xl mx-auto relative group">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={selectedSession ? "Ask a question..." : "Select or create a chat session first..."}
                rows={1}
                disabled={isLoading || !selectedSession}
                className="w-full bg-slate-800/80 text-white rounded-2xl pl-6 pr-16 py-4 resize-none custom-scrollbar leading-relaxed border-2 border-slate-600/50 shadow-inner shadow-black/20 focus:border-purple-500/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] focus:bg-slate-800 transition-all font-medium disabled:opacity-50 placeholder:text-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !selectedSession}
                className="absolute right-3 bottom-3 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
            <div className="text-center text-xs text-slate-500 font-bold mt-4 tracking-wide uppercase">
              AI can make mistakes. Always double-check your lecture notes.
            </div>
          </div>

        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">New Chat Session</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-400 mb-2">Chat Title</label>
              <input 
                type="text" 
                value={newChatTitle} 
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="w-full glass-input px-4 py-2 rounded-xl text-slate-100 border-slate-600 focus:border-primary/50 bg-slate-900/50"
                placeholder="e.g. Exam Prep"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-400 mb-2">Select PDFs to Include (Optional)</label>
              <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
                {selectedModule?.documents?.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-2">No documents uploaded to this module yet.</p>
                ) : (
                  selectedModule?.documents?.map(doc => (
                    <label key={doc.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-700/50 transition border border-transparent hover:border-slate-600">
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDocs([...selectedDocs, doc.id]);
                          else setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary/50 bg-slate-800 border-slate-600"
                      />
                      <span className="text-sm text-slate-200 truncate" title={doc.name}>{doc.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">If none are selected, all module PDFs will be used.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowNewChatModal(false); setNewChatTitle(''); setSelectedDocs([]); }}
                className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateSession}
                className="bg-primary hover:bg-primary/80 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-primary/20"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!sessionToDelete}
        title="Delete Chat Session"
        message="Are you sure you want to delete this chat session? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
}

/* ── Message Bubble Sub-component ──────────────────────── */

function MessageBubble({ message, onEdit, onRegenerate }) {
  const [showSources, setShowSources] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isUser = message.role === 'user';

  const handleSaveEdit = () => {
    if (editContent.trim() !== '' && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-5 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
        isUser ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white'
      }`}>
        {isUser ? <FaUser className="text-lg" /> : <FaRobot className="text-lg" />}
      </div>
      
      <div className="flex flex-col max-w-[85%] relative">
        <div 
          className={`py-4 px-6 shadow-xl text-[15px] leading-relaxed border ${
            isUser 
              ? 'bg-purple-900/40 border-purple-500/40 rounded-3xl rounded-tr-sm text-purple-50 shadow-purple-900/30' 
              : 'bg-emerald-900/30 border-emerald-500/40 rounded-3xl rounded-tl-sm text-emerald-50 shadow-emerald-900/30'
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-3 min-w-[300px]">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-500 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-primary resize-none custom-scrollbar"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="text-xs text-slate-300 hover:text-white font-bold px-3 py-1">Cancel</button>
                <button onClick={handleSaveEdit} className="text-xs bg-primary hover:bg-primary/80 text-white font-bold px-4 py-1.5 rounded-lg shadow-md">Save & Resubmit</button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-slate prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-xl break-words whitespace-pre-wrap">
              <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match && match[1] === 'quiz') {
                        try {
                          const quizData = JSON.parse(String(children).replace(/\n$/, ''));
                          return <InteractiveQuiz questions={quizData} messageId={message.id} />;
                        } catch(e) {
                          return (
                            <div className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/50 my-4">
                              <p className="font-bold">Error parsing interactive quiz:</p>
                              <pre className="text-xs mt-2 overflow-x-auto">{e.message}</pre>
                            </div>
                          );
                        }
                      }
                      return !inline ? (
                        <pre className={className} {...props}>{children}</pre>
                      ) : (
                        <code className={className} {...props}>{children}</code>
                      );
                    }
                  }}
                >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Action Buttons (visible on hover) */}
        {!isEditing && message.id && (
          <div className={`absolute top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? '-left-12' : '-right-12'}`}>
            {isUser ? (
              <button onClick={() => { setIsEditing(true); setEditContent(message.content); }} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full shadow-md transition-colors" title="Edit Message">
                <FaEdit size={12} />
              </button>
            ) : (
              <button onClick={() => onRegenerate(message.id)} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full shadow-md transition-colors" title="Regenerate Response">
                <FaRedo size={12} />
              </button>
            )}
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pl-2">
            <button
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors py-1 bg-slate-800/50 px-3 rounded-full border border-slate-700/50 hover:border-primary/30 shadow-sm"
              onClick={() => setShowSources(!showSources)}
            >
              {showSources ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              {message.sources.length} Reference{message.sources.length !== 1 ? 's' : ''}
            </button>

            {showSources && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {message.sources.map((source, i) => (
                  <div key={i} className={`p-4 rounded-xl border-2 text-sm shadow-lg shadow-black/20 transition-colors ${isUser ? 'bg-purple-900/30 border-purple-700/30 hover:border-purple-500/50' : 'bg-emerald-900/20 border-emerald-700/30 hover:border-emerald-500/50'}`}>
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-200 font-bold truncate">
                        <FaFileAlt className={`${isUser ? 'text-purple-400' : 'text-emerald-400'} shrink-0 text-base`} />
                        <span className="truncate" title={source.document_name}>{source.document_name}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap border ${isUser ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                        Pg {source.page_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-4">"{source.text_preview}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
