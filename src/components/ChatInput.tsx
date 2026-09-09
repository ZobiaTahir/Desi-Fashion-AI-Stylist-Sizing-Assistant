import React, { useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Ruler, 
  Sparkles, 
  UserCheck 
} from 'lucide-react';
import { CustomerProfile } from '../types';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  onOpenSizing: () => void;
  onOpenTrends: () => void;
  profile: CustomerProfile;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  onOpenSizing,
  onOpenTrends,
  profile,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) {
        return;
      }
      if (input.trim()) {
        onSend();
      }
    }
  };

  const quickChips = [
    { label: '👗 Summer Sangeet outfit', prompt: 'What are the best trending silhouettes for a summer Sangeet wedding guest that are comfortable for dancing?' },
    { label: '📏 Size check: 38" bust', prompt: 'My bust measures 38 inches. What size stitched kurta should I buy, and how much ease will it have?' },
    { label: '🌿 Pastel Haldi looks', prompt: 'I want a modern Haldi outfit that is not typical bright yellow. What pastel or citrus hues and fabrics are trending right now?' },
    { label: '🥻 Saree blouse cuts', prompt: 'What are the most flattering blouse necklines and sleeve lengths for a heavy Banarasi silk saree?' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            id={`quick-chip-${idx}`}
            onClick={() => {
              setInput(chip.prompt);
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
            className="shrink-0 px-2.5 py-1 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 hover:border-amber-600/40 transition-colors shadow-2xs"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Input Container */}
      <div className="relative rounded-2xl bg-stone-900 border border-stone-800 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/40 shadow-xl transition-all">
        {/* Profile active hint if set */}
        {profile.bust && (
          <div className="px-3.5 pt-2 text-[10px] text-amber-300/80 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-amber-400" />
            <span>
              Consulting for {profile.name || 'you'} (Bust: {profile.bust}", {profile.fitPreference} fit)
            </span>
          </div>
        )}

        <textarea
          id="chat-textarea"
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Noor for South Asian styling advice, wedding guest ideas, or sizing consultations..."
          className="w-full bg-transparent text-stone-100 placeholder-stone-400 text-sm px-4 pt-3 pb-10 resize-none focus:outline-none min-h-[50px] max-h-[180px] leading-relaxed"
        />

        {/* Bottom toolbar inside input box */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* Quick Tools */}
          <div className="flex items-center space-x-1 pointer-events-auto">
            <button
              id="input-sizing-tool-btn"
              type="button"
              onClick={onOpenSizing}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 text-xs transition-colors"
              title="Open Sizing Calculator"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Sizing Calculator</span>
            </button>

            <button
              id="input-trends-tool-btn"
              type="button"
              onClick={onOpenTrends}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-stone-400 hover:text-emerald-300 hover:bg-stone-800/80 text-xs transition-colors"
              title="View Cultural Trends"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">Latest Trends</span>
            </button>
          </div>

          {/* Send or Stop button */}
          <div className="pointer-events-auto">
            {isStreaming ? (
              <button
                id="stop-streaming-btn"
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors shadow-xs"
                title="Stop response"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="button"
                disabled={!input.trim()}
                onClick={onSend}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-xs ${
                  input.trim()
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-bold cursor-pointer shadow-amber-950/40'
                    : 'bg-stone-800 text-stone-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-2 text-[10px] text-stone-400">
        Noor advises on South Asian boutique couture, fabrics, and tailoring tolerances. Always verify custom stitch measurements before final tailoring.
      </div>
    </div>
  );
};
