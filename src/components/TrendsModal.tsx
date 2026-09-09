import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Palette, 
  Layers,
  Calendar
} from 'lucide-react';
import { TrendItem } from '../types';

interface TrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrend: (prompt: string) => void;
}

export const TrendsModal: React.FC<TrendsModalProps> = ({
  isOpen,
  onClose,
  onSelectTrend,
}) => {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/trends')
      .then((res) => res.json())
      .then((data) => {
        if (data.trends) {
          setTrends(data.trends);
        }
      })
      .catch((err) => console.error('Failed to load trends:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConsultTrend = (trend: TrendItem) => {
    const prompt = `I would love styling advice on the latest trend: "${trend.title}" (${trend.category}).
- Preferred Colors: ${trend.colors.join(', ')}
- Fabrics: ${trend.fabrics.join(', ')}
- Suitable For: ${trend.recommendedFor}

Could you style a complete look for me around this trend, including:
1. Recommended silhouette & cut
2. Dupatta draping style
3. Jewelry & accessory pairing (Polki, Kundan, Pearls, or Temple gold)
4. Footwear & makeup mood?`;

    onSelectTrend(prompt);
    onClose();
  };

  return (
    <div 
      id="trends-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        id="trends-modal-card"
        className="bg-stone-900 border border-stone-800 w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-100 font-serif-heading">
                  2025/2026 South Asian Fashion Trend Compass
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live Atelier Report
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Curated aesthetic trends from South Asian couture runways, festive weddings, and celebrity bridal wear
              </p>
            </div>
          </div>
          <button
            id="close-trends-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-stone-400 space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-sm font-mono">Gathering latest cultural trend reports...</span>
            </div>
          ) : (
            trends.map((t) => (
              <div
                key={t.id}
                id={`trend-card-${t.id}`}
                className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-600/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      {t.category}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      Best for: <strong className="text-stone-300 font-medium">{t.recommendedFor}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-stone-100 font-serif-heading group-hover:text-amber-200 transition-colors">
                    {t.title}
                  </h3>

                  <p className="text-xs text-stone-400 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-400">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-stone-400" />
                      <span>Fabrics: <span className="text-stone-300">{t.fabrics.join(', ')}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-stone-400" />
                      <span>Palette: <span className="text-amber-300/90">{t.colors.join(', ')}</span></span>
                    </div>
                  </div>
                </div>

                <button
                  id={`consult-trend-${t.id}-btn`}
                  onClick={() => handleConsultTrend(t)}
                  className="sm:self-center shrink-0 flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 text-xs font-semibold transition-all border border-stone-700/80 hover:border-amber-500 cursor-pointer shadow-xs"
                >
                  <span>Style this Fit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between bg-stone-950/80">
          <span className="text-xs text-stone-400 italic">
            Select any trend above to have Noor style an ensemble tailored to your silhouette.
          </span>
          <button
            id="close-trends-modal-bottom-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
