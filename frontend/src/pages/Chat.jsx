import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar';
import { FaPaperPlane, FaChevronDown, FaChevronRight, FaFileAlt, FaPlus, FaComments, FaTrash, FaEdit, FaRedo, FaBars, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import CustomSelect from '../components/CustomSelect';
import InteractiveQuiz from '../components/InteractiveQuiz';
import { motion } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ConfirmModal from '../components/ConfirmModal';
import { getCache } from '../utils/cache';
import { getUserAvatar, getDeptMeta } from '../utils/theme';

const AI_AVATAR_URL = 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=AcademiaAI&backgroundColor=2563eb';

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

  const cachedUser = getCache('dashboard_user');
  const userAvatar = getUserAvatar(cachedUser);

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
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchHistory();
  }, [selectedModule, selectedSession, apiBaseUrl]);

  useEffect(() => {
    activeSessionRef.current = selectedSession ? selectedSession.id : null;
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const buildConversationHistory = () => {
    return messages.slice(-20).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content,
    }));
  };

  const handleCreateSession = async () => {
    if (!selectedModule) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newChatTitle.trim() || 'Untitled Thread',
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
      setError('Select a module first.');
      return;
    }

    if (!selectedSession) {
      setError('Create or select a discussion thread first.');
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
      const chatEndpoint = process.env.REACT_APP_AI_SERVICE_URL
        ? `${process.env.REACT_APP_AI_SERVICE_URL}/api/v1/chat`
        : `${apiBaseUrl}/api/modules/ai-chat`;
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

  const dept = selectedModule ? getDeptMeta(selectedModule.moduleCode) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="flex h-screen overflow-hidden bg-[#fafaf9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100"
    >
      <Navbar />

      <div className="relative flex flex-1 overflow-hidden pt-14">
        {/* Left Sidebar */}
        <div
          className={[
            'fixed inset-y-14 left-0 z-40 w-[275px] border-r border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121215] transition-transform duration-200 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          ].join(' ')}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  Course Context
                </span>
                <button
                  type="button"
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 p-1.5 text-zinc-500 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTimes size={12} />
                </button>
              </div>

              <div aria-label="Select a module">
                <CustomSelect
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100"
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
                          label: (mod.moduleCode ? `${mod.moduleCode} · ` : '') + mod.moduleName,
                        }))
                  }
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-2.5 flex items-center justify-between px-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Threads</span>
                <span className="font-mono text-[10px] text-zinc-400">{sessions.length}</span>
              </div>

              <div className="space-y-1">
                {sessions.map((s) => {
                  const active = selectedSession?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`group flex items-center justify-between rounded-lg border transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSession(s)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left text-xs font-medium outline-none"
                      >
                        <FaComments size={11} className={active ? 'text-blue-200 shrink-0' : 'text-zinc-400 shrink-0'} />
                        <span className="truncate">{s.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className={`mr-1.5 rounded p-1 opacity-0 transition group-hover:opacity-100 ${
                          active ? 'text-blue-200 hover:text-red-200' : 'text-zinc-400 hover:text-red-600'
                        }`}
                        title="Delete thread"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  );
                })}

                {sessions.length === 0 && selectedModule && (
                  <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-center text-xs text-zinc-400">
                    No threads yet
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 p-3">
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                disabled={!selectedModule}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
              >
                <FaPlus size={10} /> New Thread
              </button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#fafaf9] dark:bg-[#09090b]">
          <header className="flex h-14 items-center justify-between border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121215] px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="rounded-md border border-zinc-200 dark:border-zinc-700 p-1.5 text-zinc-600 dark:text-zinc-300 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <FaBars size={12} />
              </button>

              {selectedSession ? (
                <div className="flex items-center gap-3 truncate">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{selectedSession.title}</h2>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {selectedSession.documentIds?.length ? `${selectedSession.documentIds.length} PDF(s) scoped` : 'All module PDFs'}
                  </span>
                </div>
              ) : (
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Document-Grounded Course Assistant</h2>
                </div>
              )}
            </div>

            {selectedModule && dept && (
              <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded border hidden sm:inline-block ${dept.codeBadge}`}>
                {selectedModule.moduleCode}
              </span>
            )}
          </header>

          {error && (
            <div className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-3xl rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-700 dark:text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold ml-3">✕</button>
            </div>
          )}

          <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {messages.length === 0 && !isLoading ? (
                <div className="flex h-[58vh] flex-col items-center justify-center text-center">
                  <img
                    src={AI_AVATAR_URL}
                    alt="AI Assistant"
                    className="w-14 h-14 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm mb-4 bg-blue-600 p-1"
                  />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {!selectedSession ? 'Select or start a study thread' : 'Query your lecture notes'}
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {!selectedSession
                      ? 'Create a thread for your module to ask questions, summarize chapters, or generate practice quizzes from uploaded PDFs.'
                      : 'Responses are grounded in your uploaded PDFs with page-level citations.'}
                  </p>
                  {!selectedSession && selectedModule && (
                    <button
                      type="button"
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition shadow-xs"
                    >
                      Start New Thread
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 pb-6">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id ?? `${msg.role}-${msg.content}`}
                      message={msg}
                      userAvatar={userAvatar}
                      onEdit={handleEditMessage}
                      onRegenerate={handleRegenerateMessage}
                    />
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-3 py-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Retrieving citations & generating response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121215] px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedSession ? 'Ask a question or request a quiz from your lecture PDFs...' : 'Select or create a thread first...'}
                  rows={1}
                  disabled={isLoading || !selectedSession}
                  className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border-0 bg-transparent px-3.5 py-3 pr-12 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !selectedSession}
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FaPaperPlane size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">New Study Thread</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Scope this thread to specific lecture PDFs</p>
              </div>
              <button type="button" onClick={() => setShowNewChatModal(false)} className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <FaTimes size={13} />
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="chat-title-input" className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Thread Title</label>
              <input
                id="chat-title-input"
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="glass-input w-full rounded-lg px-3 py-2 text-xs"
                placeholder="e.g. Midterm Review — Chapter 1-3"
              />
            </div>

            <div className="mb-5">
              <span className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Reference Documents</span>
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2">
                {selectedModule?.documents?.length === 0 ? (
                  <p className="p-2 text-xs text-zinc-500 dark:text-zinc-400">No PDFs uploaded for this module yet.</p>
                ) : (
                  selectedModule?.documents?.map((doc) => (
                    <label key={doc.id} className="flex cursor-pointer items-center gap-2.5 rounded-md bg-white dark:bg-zinc-900 px-2.5 py-2 border border-zinc-200/70 dark:border-zinc-800 hover:border-blue-500 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDocs((prev) => [...prev, doc.id]);
                          else setSelectedDocs((prev) => prev.filter((id) => id !== doc.id));
                        }}
                        className="h-3.5 w-3.5 rounded border-zinc-300 accent-blue-600"
                      />
                      <span className="truncate text-zinc-700 dark:text-zinc-200" title={doc.name}>{doc.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-400">Leave unchecked to search across all module PDFs.</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatTitle('');
                  setSelectedDocs([]);
                }}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSession}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white"
              >
                Create Thread
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!sessionToDelete}
        title="Delete study thread"
        message="Are you sure you want to delete this thread and its conversation history?"
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
        <div className="my-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-xs">
          <p className="font-bold">Error parsing quiz:</p>
          <pre className="mt-1 overflow-x-auto">{e.message}</pre>
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

function MessageBubble({ message, userAvatar, onEdit, onRegenerate }) {
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
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <img
          src={AI_AVATAR_URL}
          alt="AI"
          className="h-7 w-7 shrink-0 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-600 p-0.5 mt-0.5 object-cover"
        />
      )}

      <div className={`relative max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={[
            'rounded-xl border px-4 py-3',
            isUser
              ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
              : 'border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
          ].join(' ')}
        >
          {isEditing ? (
            <div className="flex min-w-[260px] flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] w-full resize-none rounded-lg border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="rounded px-2.5 py-1 text-xs font-medium text-blue-100 hover:text-white">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEdit} className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Resubmit
                </button>
              </div>
            </div>
          ) : (
            <div className={`prose prose-sm max-w-none break-words prose-p:leading-relaxed prose-pre:rounded-lg prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900 prose-code:text-current text-xs sm:text-sm ${isUser ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white' : 'dark:prose-invert'}`}>
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
          <div className={`mt-1.5 flex gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {isUser ? (
              <button type="button" onClick={() => { setIsEditing(true); setEditContent(message.content); }} className="rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition" title="Edit prompt">
                <FaEdit size={10} />
              </button>
            ) : (
              <button type="button" onClick={() => onRegenerate(message.id)} className="rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition" title="Regenerate response">
                <FaRedo size={10} />
              </button>
            )}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:border-blue-400 transition"
            >
              {showSources ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
              {message.sources.length} Citation{message.sources.length !== 1 ? 's' : ''}
            </button>

            {showSources && (
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                {message.sources.map((source) => (
                  <div key={`${source.document_name}-${source.page_number}-${source.text_preview}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                      <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        <FaFileAlt className="text-blue-500 shrink-0" size={10} />
                        <span className="truncate" title={source.document_name}>{source.document_name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded shrink-0">
                        p.{source.page_number}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">"{source.text_preview}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && userAvatar && (
        <img
          src={userAvatar}
          alt="You"
          className="h-7 w-7 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 mt-0.5 object-cover"
        />
      )}
    </div>
  );
}

export default Chat;
