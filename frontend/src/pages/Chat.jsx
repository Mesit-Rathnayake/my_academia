import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/sidebar';
import { FaGraduationCap, FaPaperPlane, FaRobot, FaUser, FaChevronDown, FaChevronRight, FaFileAlt } from 'react-icons/fa';

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

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
            setSelectedSession(data[0]);
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
    const fetchHistory = async () => {
      if (!selectedModule || !selectedSession) {
        setMessages([]);
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

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    if (!selectedModule) {
      setError('Please select a module first.');
      return;
    }

    if (!selectedSession) {
      setError('Please create a chat session first.');
      return;
    }

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
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
      }).catch(err => console.error('Failed to save user message:', err));

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
          top_k: 5,
          document_ids: selectedSession.documentIds || null,
          conversation_history: conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${response.status})`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save AI message to backend
      fetch(`${apiBaseUrl}/api/modules/${selectedModule._id}/sessions/${selectedSession.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'assistant', content: data.answer, sources: data.sources || [] })
      }).catch(err => console.error('Failed to save AI message:', err));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col relative bg-slate-900/50">
        
        {/* Header */}
        <header className="h-20 glass-panel border-b border-slate-600/50 shadow-md shadow-black/20 flex justify-between items-center px-8 z-10 shrink-0 relative">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-2.5 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <FaGraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
                AI Tutor
              </h2>
              <p className="text-xs text-slate-400 font-medium">Chat with your lecture notes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="module-select" className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Module
            </label>
            <select
              id="module-select"
              className="glass-input px-4 py-2 rounded-xl text-sm font-bold min-w-[150px] border-slate-600/50 shadow-sm shadow-black/20 focus:border-primary/50"
              value={selectedModule?._id || ''}
              onChange={(e) => {
                const mod = modules.find(m => m._id === e.target.value);
                setSelectedModule(mod || null);
                setSelectedSession(null);
              }}
            >
              {modules.length === 0 && <option value="">No modules</option>}
              {modules.map(mod => (
                <option key={mod._id} value={mod._id}>
                  {mod.moduleCode ? `${mod.moduleCode} - ` : ''}{mod.moduleName}
                </option>
              ))}
            </select>

            {selectedModule && (
              <>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-4">
                  Chat
                </label>
                <select
                  className="glass-input px-4 py-2 rounded-xl text-sm font-bold min-w-[150px] max-w-[200px] border-slate-600/50 shadow-sm shadow-black/20 focus:border-primary/50"
                  value={selectedSession?.id || ''}
                  onChange={(e) => {
                    const sess = sessions.find(s => s.id === e.target.value);
                    setSelectedSession(sess || null);
                  }}
                >
                  {sessions.length === 0 && <option value="">No chats yet</option>}
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="ml-2 bg-primary/20 text-primary hover:bg-primary/40 px-3 py-2 rounded-xl text-sm font-bold border border-primary/30 transition-colors whitespace-nowrap shadow-sm shadow-primary/10"
                >
                  + New
                </button>
              </>
            )}
          </div>
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
                    ? 'Click "+ New" in the header to start a conversation and select your PDFs.' 
                    : 'Ask questions based on your selected PDFs. I will cite my sources!'}
                </p>
                {!selectedSession && (
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
                <MessageBubble key={index} message={msg} />
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
              className="w-full glass-input rounded-2xl pl-6 pr-16 py-4 resize-none custom-scrollbar leading-relaxed border-2 border-slate-600/50 shadow-inner shadow-black/20 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all font-medium disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !selectedSession}
              className="absolute right-3 bottom-3 p-3 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] active:scale-95"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
          <div className="text-center text-xs text-slate-500 font-bold mt-4 tracking-wide uppercase">
            AI can make mistakes. Always double-check your lecture notes.
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
    </div>
  );
}


/* ── Message Bubble Sub-component ──────────────────────── */

function MessageBubble({ message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
        isUser ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-gradient-to-br from-primary to-secondary shadow-[0_0_15px_rgba(14,165,233,0.3)] text-white'
      }`}>
        {isUser ? <FaUser className="text-lg" /> : <FaRobot className="text-lg" />}
      </div>
      
      <div className="flex flex-col max-w-[85%]">
        <div 
          className={`py-4 px-6 shadow-xl text-[15px] leading-relaxed border border-slate-600/50 ${
            isUser 
              ? 'bg-slate-700/80 rounded-3xl rounded-tr-sm text-white shadow-black/20' 
              : 'glass-panel rounded-3xl rounded-tl-sm text-slate-100 shadow-black/30'
          }`}
          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
        />

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
                  <div key={i} className="bg-slate-800/80 p-4 rounded-xl border-2 border-slate-600/50 text-sm shadow-lg shadow-black/20 hover:border-primary/40 transition-colors">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-2 text-slate-200 font-bold truncate">
                        <FaFileAlt className="text-primary shrink-0 text-base" />
                        <span className="truncate" title={source.document_name}>{source.document_name}</span>
                      </div>
                      <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold whitespace-nowrap border border-primary/20">
                        Pg {source.page_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-4">"{source.text_preview}"</p>
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


/* ── Simple Markdown Formatter ──────────────────────────── */

function formatMarkdown(text) {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-900/80 px-1.5 py-0.5 rounded text-primary text-sm font-mono border border-slate-700/50">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-extrabold text-white mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-extrabold text-white mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-extrabold text-white mt-8 mb-4">$1</h1>')
    .replace(/\n/g, '<br/>');

  // Simple bullet lists
  html = html.replace(/((?:<br\/>)?- .+(?:<br\/>- .+)*)/g, (match) => {
    const items = match
      .split('<br/>')
      .filter(line => line.startsWith('- '))
      .map(line => `<li class="ml-4 mb-1.5 border-l-2 border-primary/50 pl-3">${line.substring(2)}</li>`)
      .join('');
    return `<ul class="my-4 space-y-1">${items}</ul>`;
  });

  return html;
}

export default Chat;
