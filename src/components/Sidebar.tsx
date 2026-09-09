import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Ruler, 
  Sparkles, 
  User, 
  X, 
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ChatSession, CustomerProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenSizing: () => void;
  onOpenTrends: () => void;
  onOpenProfile: () => void;
  profile: CustomerProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSizing,
  onOpenTrends,
  onOpenProfile,
  profile,
}) => {
  const hasMeasurements = Boolean(profile.bust);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-stone-950 border-r border-stone-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-inner shadow-amber-400/20 text-stone-950 font-bold">
              <ShoppingBag className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="font-brand text-stone-100 font-bold text-sm tracking-wider flex items-center gap-1.5">
                <span>ZARI & SILK</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans font-medium">Atelier</span>
              </div>
              <p className="text-xs text-stone-400">Desi Styling & Fit Stylist</p>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={onClose}
            className="md:hidden p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-900 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800/90 text-stone-200 border border-stone-800 rounded-xl text-sm font-medium transition-colors shadow-xs group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded-md bg-amber-500/15 text-amber-300 group-hover:bg-amber-500/25 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span>New Consultation</span>
            </div>
            <span className="text-[11px] text-stone-400 border border-stone-700/60 rounded px-1.5 py-0.5 font-mono">⌘K</span>
          </button>
        </div>

        {/* Quick Stylist Tools */}
        <div className="px-3 py-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-2 mb-1.5">
            Boutique Services
          </div>
          <div className="space-y-1">
            <button
              id="sidebar-sizing-guide-btn"
              onClick={() => {
                onOpenSizing();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-300 hover:bg-stone-900 hover:text-amber-200 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <Ruler className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Sizing Guide & Calculator</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-300" />
            </button>

            <button
              id="sidebar-trends-btn"
              onClick={() => {
                onOpenTrends();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-300 hover:bg-stone-900 hover:text-amber-200 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>2025/2026 Trend Compass</span>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded font-medium">Latest</span>
            </button>

            <button
              id="sidebar-profile-btn"
              onClick={() => {
                onOpenProfile();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-300 hover:bg-stone-900 hover:text-amber-200 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Measurement Profile</span>
              </div>
              {hasMeasurements ? (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Profile saved" />
              ) : (
                <span className="text-[10px] text-stone-400">Set</span>
              )}
            </button>
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-2 py-1 flex items-center justify-between">
            <span>Recent Sessions</span>
            <span className="text-[10px] text-stone-400 font-mono">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400 italic">
              No previous consultations yet. Start a new chat with Noor!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-amber-950/40 text-amber-200 border border-amber-800/40 font-medium'
                      : 'text-stone-300 hover:bg-stone-900/90 hover:text-stone-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span className="truncate">{session.title || 'Styling Advice'}</span>
                  </div>
                  <button
                    id={`delete-session-${session.id}`}
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Customer Profile Status / Footer */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-950/60">
          <div 
            onClick={onOpenProfile}
            className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/60 hover:bg-stone-900 border border-stone-800/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-rose-700 flex items-center justify-center text-stone-100 font-semibold text-xs shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-medium text-stone-200 truncate">
                  {profile.name || 'Boutique Guest'}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {profile.bust ? `Bust: ${profile.bust}" • Fit: ${profile.fitPreference}` : 'No measurements set'}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-amber-400 hover:underline shrink-0">Edit</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stylist Online
            </span>
            <span className="text-stone-400 font-mono text-[10px]">Gemini 3.8</span>
          </div>
        </div>
      </aside>
    </>
  );
};
