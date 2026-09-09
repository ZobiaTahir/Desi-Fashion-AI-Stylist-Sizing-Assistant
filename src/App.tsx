import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Plus, 
  Ruler, 
  Sparkles, 
  Trash2, 
  ShoppingBag, 
  User, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SizingModal } from './components/SizingModal';
import { TrendsModal } from './components/TrendsModal';
import { ProfileModal } from './components/ProfileModal';
import { ChatSession, Message, CustomerProfile, SizingResult } from './types';

const INITIAL_PROFILE: CustomerProfile = {
  name: '',
  bust: '',
  waist: '',
  hips: '',
  height: '',
  fitPreference: 'regular',
  preferredOccasion: '',
  gender: 'female',
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('desi_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading sessions:', e);
    }
    const initialId = Date.now().toString();
    return [{
      id: initialId,
      title: 'New Styling Consultation',
      createdAt: Date.now(),
      messages: [],
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('desi_current_session_id');
      if (savedId) return savedId;
    } catch (e) {
      console.error(e);
    }
    return sessions[0]?.id || Date.now().toString();
  });

  const [profile, setProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem('desi_customer_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROFILE;
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSizingOpen, setIsSizingOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('desi_chat_sessions', JSON.stringify(sessions));
      localStorage.setItem('desi_current_session_id', currentSessionId);
    } catch (e) {
      console.error('Error saving sessions:', e);
    }
  }, [sessions, currentSessionId]);

  // Sync profile to localStorage
  const handleSaveProfile = (newProfile: CustomerProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('desi_customer_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isStreaming]);

  // Keyboard shortcut: Cmd/Ctrl + K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewChat = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Consultation',
      createdAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: Date.now().toString(),
          title: 'New Consultation',
          createdAt: Date.now(),
          messages: [],
        };
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearCurrentChat = () => {
    if (confirm('Clear the conversation history for this consultation?')) {
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [] } : s))
      );
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleSendMessage = async (customPrompt?: string, sizingData?: SizingResult) => {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend) return;

    if (!customPrompt) {
      setInput('');
    }

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
      sizingData: sizingData || null,
    };

    const assistantMessageId = `ast_${Date.now() + 1}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    // Update active session with user message and placeholder assistant message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const isFirstMessage = s.messages.length === 0;
          let newTitle = s.title;
          if (isFirstMessage) {
            newTitle = promptToSend.slice(0, 32) + (promptToSend.length > 32 ? '...' : '');
          }
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage, initialAssistantMessage],
          };
        }
        return s;
      })
    );

    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const conversationHistory = [
      ...currentSession.messages,
      userMessage,
    ].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: conversationHistory,
          customerContext: {
            name: profile.name,
            occasion: profile.preferredOccasion,
            measurements: {
              bust: profile.bust,
              waist: profile.waist,
              hips: profile.hips,
              height: profile.height,
            },
            stylePreference: profile.fitPreference,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                assistantText += parsed.text;
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === currentSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantMessageId ? { ...m, content: assistantText } : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore partial JSON parse errors in stream
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chat error:', err);
        let humanError = err.message || 'Unable to connect to Noor right now.';
        if (
          humanError.includes('429') || 
          humanError.toLowerCase().includes('quota') || 
          humanError.toLowerCase().includes('resource_exhausted') ||
          humanError.toLowerCase().includes('rate limit')
        ) {
          humanError = 'The atelier is currently receiving high consultation traffic. Our in-house styling team is adjusting capacity. Please click retry or ask another question in a few moments.';
        }

        const errorMsg = `**Styling Consultant Notice:**\n${humanError}`;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: m.content ? `${m.content}\n\n${errorMsg}` : errorMsg }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const starterCards = [
    {
      title: 'Summer Sangeet Styling',
      desc: 'Flared sharara vs lightweight lehenga recommendations with dancing comfort in mind.',
      prompt: 'I am attending a summer evening Sangeet wedding as a close friend of the bride. What silhouettes, fabrics, and jewelry pairing would you recommend that feel glam yet comfortable for dancing?',
    },
    {
      title: 'Desi Sizing & Ease Consultation',
      desc: 'How ready-to-wear kurta sizing works for a 38-inch bust and how much ease is needed.',
      prompt: 'My bust measures 38 inches. What size stitched South Asian ready-to-wear kurta should I order? How much ease margin should be in the chest and waist, and what seam margins do you include?',
    },
    {
      title: 'Banarasi Saree Blouse Cut',
      desc: 'Flattering necklines, back cutouts, and sleeve lengths for a heavy heirloom silk.',
      prompt: 'I have a heavy royal blue and gold Banarasi silk saree. What blouse cut, neckline (sweetheart, boat, or deep V), sleeve length, and fabric should I pair with it for a timeless look?',
    },
    {
      title: 'Non-Traditional Haldi Fits',
      desc: 'Subtle citrus, lime sorbet, and mint palettes replacing loud marigold yellows.',
      prompt: 'I want a chic, modern Haldi outfit that is not typical bright yellow. What pastel hues, mirror work, or chikankari styles are trending for daytime pre-wedding rituals?',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-stone-950 text-stone-100 overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSizing={() => setIsSizingOpen(true)}
        onOpenTrends={() => setIsTrendsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        profile={profile}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-stone-900/30">
        {/* Top Header Bar */}
        <header 
          id="chat-header"
          className="h-14 border-b border-stone-800/80 bg-stone-950/70 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-10 shrink-0"
        >
          <div className="flex items-center space-x-3">
            <button
              id="toggle-sidebar-mobile-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 rounded-lg transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold text-stone-100 font-brand tracking-wide truncate">
                  {currentSession?.title || 'Zari & Silk Stylist'}
                </div>
                <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Noor (AI Stylist)</span>
                  <span className="text-stone-400">•</span>
                  <span>Cultural Trends & Sizing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              id="header-open-sizing-btn"
              onClick={() => setIsSizingOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700/60 rounded-lg text-xs transition-colors"
              title="Open Sizing Guide & Calculator"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-medium">Sizing Guide</span>
            </button>

            <button
              id="header-open-trends-btn"
              onClick={() => setIsTrendsOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-emerald-300 border border-stone-700/60 rounded-lg text-xs transition-colors"
              title="View Latest Cultural Trends"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-medium">Trend Compass</span>
            </button>

            {currentSession?.messages?.length > 0 && (
              <button
                id="clear-chat-btn"
                onClick={handleClearCurrentChat}
                className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800/80 rounded-lg transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Message Thread or Welcome Screen */}
        <div 
          id="messages-scroll-area"
          className="flex-1 overflow-y-auto overflow-x-hidden select-text"
        >
          {currentSession?.messages?.length === 0 ? (
            /* Welcome / Empty State */
            <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-full">
              {/* Atelier Crest */}
              <div className="text-center space-y-3 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/40 shadow-xl shadow-amber-950/60 mb-2">
                  <ShoppingBag className="w-8 h-8 text-amber-100" />
                </div>
                <div className="font-brand tracking-widest text-xs uppercase text-amber-400 font-semibold">
                  ZARI & SILK ATELIER
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-100">
                  Desi Styling & Sizing Consultation
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  Welcome! I am <strong>Noor</strong>, your virtual South Asian atelier stylist. Ask me for bespoke outfit coordination, festive wedding trends, fabric pairings, and precise sizing advice for lehengas, sarees, and kurtas.
                </p>

                {/* Profile status pill */}
                {profile.bust ? (
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Client Profile Active: <strong>{profile.name || 'Guest'}</strong> (Bust: {profile.bust}")</span>
                    <button 
                      onClick={() => setIsProfileOpen(true)}
                      className="underline ml-1 hover:text-amber-200"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    id="welcome-set-profile-btn"
                    onClick={() => setIsProfileOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-rose-400" />
                    <span>Set your measurements for tailored advice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Starter Consultation Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {starterCards.map((card, idx) => (
                  <div
                    key={idx}
                    id={`starter-card-${idx}`}
                    onClick={() => handleSendMessage(card.prompt)}
                    className="p-4 rounded-xl bg-stone-900/80 hover:bg-stone-800/90 border border-stone-800/80 hover:border-amber-600/40 text-left cursor-pointer transition-all duration-200 group shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors font-serif-heading">
                        {card.title}
                      </div>
                      <div className="text-[11px] text-stone-400 leading-relaxed">
                        {card.desc}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end text-[11px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ask Noor</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Atelier Pillars */}
              <div className="grid grid-cols-3 gap-3 w-full text-center text-stone-400 text-[11px] border-t border-stone-800/80 pt-5">
                <div>
                  <div className="text-amber-300 font-semibold mb-0.5">👗 Cultural Trend Radar</div>
                  <div>2025/2026 pastel lehengas, organza dupattas, & mukaish</div>
                </div>
                <div>
                  <div className="text-amber-300 font-semibold mb-0.5">📏 Bespoke Desi Sizing</div>
                  <div>Ease allowances, blouse cups, and lehenga heel length</div>
                </div>
                <div>
                  <div className="text-amber-300 font-semibold mb-0.5">✂️ Tailoring Tolerances</div>
                  <div>2-inch internal seam margins for easy alterations</div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Message Thread */
            <div className="py-2">
              {currentSession.messages.map((msg, index) => {
                const isLast = index === currentSession.messages.length - 1;
                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isStreaming && isLast && msg.role === 'assistant'}
                    onAskFollowup={(q) => handleSendMessage(q)}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Floating Chat Input */}
        <footer className="shrink-0 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent pt-3">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={() => handleSendMessage()}
            onStop={handleStopStreaming}
            isStreaming={isStreaming}
            onOpenSizing={() => setIsSizingOpen(true)}
            onOpenTrends={() => setIsTrendsOpen(true)}
            profile={profile}
          />
        </footer>
      </main>

      {/* Modals */}
      <SizingModal
        isOpen={isSizingOpen}
        onClose={() => setIsSizingOpen(false)}
        onConsultStylist={(prompt, sizingData) => handleSendMessage(prompt, sizingData)}
      />

      <TrendsModal
        isOpen={isTrendsOpen}
        onClose={() => setIsTrendsOpen(false)}
        onSelectTrend={(prompt) => handleSendMessage(prompt)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
