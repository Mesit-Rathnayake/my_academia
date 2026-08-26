import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar';
import { FaGraduationCap, FaPaperPlane, FaRobot, FaUser, FaChevronDown, FaChevronRight, FaFileAlt, FaPlus, FaComments, FaTrash, FaEdit, FaRedo, FaStar, FaBars, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import CustomSelect from '../components/CustomSelect';
import InteractiveQuiz from '../components/InteractiveQuiz';
import { motion } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ConfirmModal from '../components/ConfirmModal';

const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

function Chat() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const activeSessionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    const updateSidebar = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    updateSidebar();
    window.addEventListener('resize', updateSidebar);
    return () => window.removeEventListener('resize', updateSidebar);
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/modules`, {
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
          setSelectedSession(null);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };
    fetchSessions();
  }, [selectedModule, apiBaseUrl]);

  useEffect(() => {
    setMessages([]);
    setIsLoading(false);
    setError(null);

    const fetchHistory = async () => {
      if (!selectedModule || !selectedSession) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(
            data.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              sources: msg.sources || [],
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchHistory();
  }, [selectedSession, selectedModule, apiBaseUrl]);

  useEffect(() => {
    activeSessionRef.current = selectedSession?.id;
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
    }
  };

  const buildConversationHistory = () =>
    messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content,
    }));

  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newChatTitle || 'New Chat',
          documentIds: selectedDocs.length > 0 ? selectedDocs : null,
        }),
      });
      if (response.ok) {
        const session = await response.json();
        setSessions((prev) => [session, ...prev]);
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
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    const sessionId = sessionToDelete;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (selectedSession?.id === sessionId) {
          setSelectedSession(sessions.find((s) => s.id !== sessionId) || null);
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
    const tempId = Date.now().toString();
    const userMessage = { id: tempId, role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    if (typeof overrideText !== 'string') setInput('');
    setError(null);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const token = localStorage.getItem('token');

      fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'user', content: question }),
      })
        .then((res) => res.json())
        .then((savedMsg) => {
          if (activeSessionRef.current === currentSessionId) {
            setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: savedMsg.id } : m)));
          }
        })
        .catch((err) => console.error('Failed to save user message:', err));

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
          question,
          top_k: 3,
          document_ids: selectedSession.documentIds || null,
          conversation_history: conversationHistory,
        }),
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
        sources: data.sources || [],
      };

      if (activeSessionRef.current === currentSessionId) {
        setMessages((prev) => [...prev, assistantMessage]);
      }

      fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${currentSessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'assistant', content: data.answer, sources: data.sources || [] }),
      })
        .then((res) => res.json())
        .then((savedMsg) => {
          if (activeSessionRef.current === currentSessionId) {
            setMessages((prev) => prev.map((m) => (m.id === assistantTempId ? { ...m, id: savedMsg.id } : m)));
          }
        })
        .catch((err) => console.error('Failed to save AI message:', err));
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgIndex = messages.findIndex((m) => m.id === msgId);
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
      const msgIndex = messages.findIndex((m) => m.id === msgId);
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
        headers: { Authorization: `Bearer ${token}` },
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="flex h-screen overflow-hidden bg-slate-100 text-slate-800"
    >
      <Navbar />

      <div className="relative flex flex-1 overflow-hidden pt-20">
        <div
          className={[
            'fixed inset-y-20 left-0 z-40 w-[290px] border-r border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          ].join(' ')}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 shadow-lg shadow-indigo-500/30">
                    <FaGraduationCap className="text-lg text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Study companion</p>
                    <h2 className="text-xl font-black text-slate-900">AI Tutor</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="mt-5">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Module</span>
                <div aria-label="Select a module">
                  <CustomSelect
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-inner shadow-slate-200/50 focus:border-indigo-500"
                    value={selectedModule?._id || ''}
                    onChange={(val) => {
                      const mod = modules.find((m) => m._id === val);
                      setSelectedModule(mod || null);
                      setSelectedSession(null);
                    }}
                    options={
                      modules.length === 0
                        ? [{ value: '', label: 'No modules found' }]
                        : modules.map((mod) => ({
                            value: mod._id,
                            label: (mod.moduleCode ? `${mod.moduleCode} - ` : '') + mod.moduleName,
                          }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Chat sessions</span>
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">{sessions.length}</span>
              </div>

              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={[
                      'group flex items-center gap-2 rounded-2xl border transition-all duration-200',
                      selectedSession?.id === s.id
                        ? 'border-indigo-200 bg-indigo-50/80 shadow-sm shadow-indigo-100'
                        : 'border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-white',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSession(s)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left outline-none transition hover:brightness-95 focus:ring-2 focus:ring-indigo-200"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                          <FaComments size={12} />
                        </div>
                        <span className="truncate text-sm font-semibold text-slate-700">{s.title}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="mr-2 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      title="Delete session"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                ))}

                {sessions.length === 0 && selectedModule && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    No chats yet
                  </div>
                )}
                {!selectedModule && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Select a module first
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                disabled={!selectedModule}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPlus /> New chat
              </button>
            </div>
          </div>
        </div>

        {!sidebarOpen && (
          <button
            type="button"
            className="fixed left-4 top-28 z-50 rounded-xl border border-slate-200 bg-white/85 p-3 text-slate-600 shadow-lg backdrop-blur lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars size={14} />
          </button>
        )}

        <div className="flex min-w-0 flex-1 flex-col bg-slate-100">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <FaBars size={14} />
              </button>

              {selectedSession ? (
                <div>
                  <h2 className="text-lg font-black text-slate-900">{selectedSession.title}</h2>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    {selectedSession.documentIds?.length ? `Filtered to ${selectedSession.documentIds.length} PDFs` : 'Using all module PDFs'}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-black text-slate-900">Ask your notes anything</h2>
                  <p className="text-sm text-slate-500">Select or create a session to begin</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              <FaStar size={10} />
              Smart study mode
            </div>
          </header>

          {error && (
            <div className="absolute left-1/2 top-24 z-30 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-lg shadow-red-100">
              <div className="flex items-center justify-between gap-3">
                <span>⚠️ {error}</span>
                <button type="button" onClick={() => setError(null)} className="rounded-lg bg-red-100 px-2 py-1 text-red-600">✕</button>
              </div>
            </div>
          )}

          <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              {messages.length === 0 && !isLoading ? (
                <div className="flex h-[65vh] flex-col items-center justify-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-indigo-100 bg-white shadow-xl shadow-indigo-100">
                    <FaRobot className="text-4xl text-indigo-600" />
                  </div>
                  <h3 className="mt-6 text-3xl font-black text-slate-900">
                    {!selectedSession ? 'Create a chat session' : 'How can I help you today?'}
                  </h3>
                  <p className="mt-3 max-w-lg text-base text-slate-600">
                    {!selectedSession
                      ? 'Start a new conversation and pull in the documents you want the tutor to reference.'
                      : 'Ask questions based on your module content and I will respond with grounded answers and citations.'}
                  </p>
                  {!selectedSession && selectedModule && (
                    <button
                      type="button"
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02]"
                    >
                      Start new chat
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-8 pb-6">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id ?? `${msg.role}-${msg.content}`} message={msg} onEdit={handleEditMessage} onRegenerate={handleRegenerateMessage} />
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                    <FaRobot />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white/85 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="relative rounded-[1.75rem] border border-slate-200 bg-slate-50 p-2 shadow-inner shadow-slate-200/50">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedSession ? 'Ask a question about your course notes...' : 'Select or create a chat session first...'}
                  rows={1}
                  disabled={isLoading || !selectedSession}
                  className="max-h-36 min-h-[56px] w-full resize-none rounded-[1.25rem] border-0 bg-transparent px-4 py-4 pr-16 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !selectedSession}
                  className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>

              <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                AI can make mistakes — always verify lecture notes
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">New session</p>
                <h3 className="text-2xl font-black text-slate-900">Build a study chat</h3>
              </div>
              <button type="button" onClick={() => setShowNewChatModal(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500">
                <FaTimes size={14} />
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="chat-title-input" className="mb-2 block text-sm font-bold text-slate-600">Chat title</label>
              <input
                id="chat-title-input"
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Exam prep"
              />
            </div>

            <div className="mb-6">
              <span className="mb-2 block text-sm font-bold text-slate-600">Select PDFs to include</span>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
                {selectedModule?.documents?.length === 0 ? (
                  <p className="p-3 text-sm text-slate-500">No documents uploaded yet for this module.</p>
                ) : (
                  selectedModule?.documents?.map((doc) => (
                    <label key={doc.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-white p-2.5 hover:border-indigo-200 hover:bg-indigo-50/30">
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDocs((prev) => [...prev, doc.id]);
                          else setSelectedDocs((prev) => prev.filter((id) => id !== doc.id));
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate text-sm text-slate-700" title={doc.name}>{doc.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">Leave blank to use all module PDFs.</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatTitle('');
                  setSelectedDocs([]);
                }}
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSession}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
              >
                Create chat
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!sessionToDelete}
        title="Delete chat session"
        message="Are you sure you want to delete this chat session? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />
    </motion.div>
  );
}

function renderMessageCode({ inline, className, children, ...props }, messageId) {
  const match = /language-(\w+)/.exec(className || '');
  let contentText = '';
  if (typeof children === 'string') {
    contentText = children;
  } else if (Array.isArray(children)) {
    contentText = children.join('');
  } else if (children != null) {
    contentText = String(children);
  }

  if (!inline && match?.[1] === 'quiz') {
    try {
      const quizData = JSON.parse(contentText.replace(/\n$/, ''));
      return <InteractiveQuiz questions={quizData} messageId={messageId} />;
    } catch (e) {
      return (
        <div className="my-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-bold">Error parsing interactive quiz:</p>
          <pre className="mt-2 overflow-x-auto text-xs">{e.message}</pre>
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
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
          <FaRobot />
        </div>
      )}

      <div className={`relative max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={[
            'rounded-[1.75rem] border px-4 py-3 shadow-sm',
            isUser
              ? 'border-violet-200 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-200/70'
              : 'border-slate-200 bg-white text-slate-800 shadow-slate-100',
          ].join(' ')}
        >
          {isEditing ? (
            <div className="flex min-w-[280px] flex-col gap-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEdit} className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white">
                  Save & resubmit
                </button>
              </div>
            </div>
          ) : (
            <div className={`prose prose-sm max-w-none break-words prose-p:leading-relaxed prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-50 prose-code:text-current md:prose-base ${isUser ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white' : ''}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code(props) {
                    return renderMessageCode(props, message.id);
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isEditing && message.id && (
          <div className={`mt-2 flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {isUser ? (
              <button type="button" onClick={() => { setIsEditing(true); setEditContent(message.content); }} className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700">
                <FaEdit size={11} />
              </button>
            ) : (
              <button type="button" onClick={() => onRegenerate(message.id)} className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700">
                <FaRedo size={11} />
              </button>
            )}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            >
              {showSources ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              {message.sources.length} reference{message.sources.length !== 1 ? 's' : ''}
            </button>

            {showSources && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {message.sources.map((source) => (
                  <div key={`${source.document_name}-${source.page_number}-${source.text_preview}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-700">
                        <FaFileAlt className="text-emerald-500" />
                        <span className="truncate" title={source.document_name}>{source.document_name}</span>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        Pg {source.page_number}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 italic">"{source.text_preview}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
          <FaUser />
        </div>
      )}
    </div>
  );
}

export default Chat;
