import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Ruler, 
  Scissors,
  Share2,
  Tag
} from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onAskFollowup?: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onAskFollowup,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = message.content
      .replace(/[#*_`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`w-full py-4 px-4 md:px-6 transition-colors ${
        isAssistant 
          ? 'bg-stone-900/40 border-y border-stone-800/40' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start space-x-3.5 md:space-x-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-amber-200 shadow-md shadow-amber-950/40 border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 border border-stone-700/60">
              <User className="w-4 h-4 text-stone-300" />
            </div>
          )}
        </div>

        {/* Message Content & Header */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold tracking-wide text-stone-300">
                {isAssistant ? 'Noor • Atelier Stylist' : 'You'}
              </span>
              {isAssistant && (
                <span className="text-[10px] uppercase font-sans tracking-wider px-1.5 py-0.5 bg-amber-500/10 text-amber-300/90 rounded border border-amber-500/20 font-medium">
                  Zari & Silk Couture
                </span>
              )}
            </div>

            {/* Actions for Assistant messages */}
            {isAssistant && message.content && (
              <div className="flex items-center space-x-1 opacity-80 hover:opacity-100 transition-opacity">
                <button
                  id={`copy-msg-${message.id}`}
                  onClick={handleCopy}
                  className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 rounded transition-colors"
                  title="Copy advice"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {'speechSynthesis' in window && (
                  <button
                    id={`speak-msg-${message.id}`}
                    onClick={handleSpeech}
                    className={`p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 rounded transition-colors ${
                      speaking ? 'text-amber-400 bg-amber-500/15' : ''
                    }`}
                    title={speaking ? 'Stop listening' : 'Listen to stylist'}
                  >
                    {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="text-stone-200 text-sm leading-relaxed desi-markdown break-words">
            {message.content ? (
              <Markdown>{message.content}</Markdown>
            ) : isStreaming ? (
              <div className="flex items-center space-x-2 text-stone-400 italic py-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-mono">Noor is curating your personalized recommendations...</span>
              </div>
            ) : null}

            {isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
            )}
          </div>

          {/* Sizing Consultation Card if attached */}
          {message.sizingData && (
            <div 
              id={`sizing-card-${message.id}`}
              className="mt-3 p-3.5 rounded-xl bg-stone-950/80 border border-amber-600/30 shadow-lg text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold">
                  <Ruler className="w-4 h-4" />
                  <span>Atelier Fit Consultation Card</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">
                  Recommended: {message.sizingData.recommendedSize} ({message.sizingData.sizeNumber})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 text-stone-300">
                <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase">Customer Bust</div>
                  <div className="text-sm font-semibold text-stone-100">{message.sizingData.userMeasurements.bust}"</div>
                </div>
                <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase">Finished Stitched Bust</div>
                  <div className="text-sm font-semibold text-amber-300">{message.sizingData.finishedGarmentBust}</div>
                </div>
                <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-stone-400 uppercase">Ease Allowance</div>
                  <div className="text-xs font-medium text-emerald-400">{message.sizingData.fitEase}</div>
                </div>
              </div>

              <div className="flex items-start space-x-2 text-stone-400 text-[11px] bg-stone-900/40 p-2 rounded-lg">
                <Scissors className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{message.sizingData.seamAllowance}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
