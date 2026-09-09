import React, { useState } from 'react';
import { 
  X, 
  Ruler, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { SizingResult } from '../types';

interface SizingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsultStylist: (fitPrompt: string, sizingData?: SizingResult) => void;
}

export const SizingModal: React.FC<SizingModalProps> = ({
  isOpen,
  onClose,
  onConsultStylist,
}) => {
  const [garmentType, setGarmentType] = useState<'kurta' | 'lehenga' | 'blouse' | 'mens'>('kurta');
  const [bust, setBust] = useState<number>(36);
  const [waist, setWaist] = useState<number>(30);
  const [hips, setHips] = useState<number>(40);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(4);
  const [heelHeight, setHeelHeight] = useState<number>(2.5);
  const [fitPreference, setFitPreference] = useState<'fitted' | 'regular' | 'modest'>('regular');
  const [activeTab, setActiveTab] = useState<'calculator' | 'guide'>('calculator');

  if (!isOpen) return null;

  // Calculate sizes
  const totalHeightInches = heightFeet * 12 + heightInches;
  let standardSize = 'Size 38 (M)';
  let sizeCode = 'M';
  let ease = fitPreference === 'fitted' ? 1.5 : fitPreference === 'modest' ? 3.5 : 2.5;

  if (garmentType === 'mens') {
    if (bust < 37) { standardSize = 'Size 36 (S)'; sizeCode = 'S'; }
    else if (bust <= 39) { standardSize = 'Size 38 (M)'; sizeCode = 'M'; }
    else if (bust <= 41) { standardSize = 'Size 40 (L)'; sizeCode = 'L'; }
    else if (bust <= 43) { standardSize = 'Size 42 (XL)'; sizeCode = 'XL'; }
    else if (bust <= 46) { standardSize = 'Size 44 (XXL)'; sizeCode = 'XXL'; }
    else { standardSize = 'Size 46+ (Custom)'; sizeCode = 'Custom'; }
  } else {
    if (bust < 33) { standardSize = 'Size 32-34 (XS)'; sizeCode = 'XS'; }
    else if (bust <= 35) { standardSize = 'Size 36 (S)'; sizeCode = 'S'; }
    else if (bust <= 37) { standardSize = 'Size 38 (M)'; sizeCode = 'M'; }
    else if (bust <= 39) { standardSize = 'Size 40 (L)'; sizeCode = 'L'; }
    else if (bust <= 41) { standardSize = 'Size 42 (XL)'; sizeCode = 'XL'; }
    else if (bust <= 44) { standardSize = 'Size 44 (XXL)'; sizeCode = 'XXL'; }
    else if (bust <= 47) { standardSize = 'Size 46 (3XL)'; sizeCode = '3XL'; }
    else { standardSize = 'Custom Bespoke Made-to-Measure'; sizeCode = 'Bespoke'; }
  }

  const finishedBust = bust + ease;
  const lehengaLength = Math.round((totalHeightInches * 0.60) + heelHeight);

  const handleAskStylist = () => {
    const sizingData: SizingResult = {
      recommendedSize: sizeCode,
      sizeNumber: standardSize,
      userMeasurements: { bust, waist, hips },
      finishedGarmentBust: `${finishedBust.toFixed(1)}"`,
      fitEase: `+${ease}" ease for ${fitPreference} fit`,
      seamAllowance: '2-inch internal boutique seam margin included for alterations',
      lehengaLengthEstimate: `${lehengaLength}" including ${heelHeight}" heels`,
      choliBlouseTip: 'Ensure measuring across fullest part of bust with your chosen undergarments.',
    };

    const promptText = `I just ran the Sizing Calculator for a ${garmentType.toUpperCase()} with:
- Bust/Chest: ${bust}"
- Waist: ${waist}"
- Hips: ${hips}"
- Height: ${heightFeet}'${heightInches}" (with ${heelHeight}" heels)
- Fit Preference: ${fitPreference} (Recommended ${standardSize})

Can you consult me on this size? Specifically:
1. How will this fit drape around the shoulders, armholes, and hips?
2. If between sizes, should I size up or down for South Asian boutique ready-to-wear?
3. How much alteration margin do I have inside the seams?`;

    onConsultStylist(promptText, sizingData);
    onClose();
  };

  return (
    <div 
      id="sizing-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        id="sizing-modal-card"
        className="bg-stone-900 border border-stone-800 w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100 font-serif-heading">
                Desi Sizing & Tailoring Consultation
              </h2>
              <p className="text-xs text-stone-400">
                South Asian garment conversion, ease allowance & fit calculations
              </p>
            </div>
          </div>
          <button
            id="close-sizing-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/30 px-5 pt-2">
          <button
            id="tab-calculator-btn"
            onClick={() => setActiveTab('calculator')}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'calculator'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Fit & Size Calculator
          </button>
          <button
            id="tab-guide-btn"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            How to Measure Desi Fits
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'calculator' ? (
            <>
              {/* Garment Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Select Garment Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'kurta', label: 'Kurta / Kameez' },
                    { id: 'lehenga', label: 'Lehenga & Choli' },
                    { id: 'blouse', label: 'Saree Blouse' },
                    { id: 'mens', label: "Men's Sherwani/Kurta" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      id={`select-garment-${g.id}`}
                      onClick={() => setGarmentType(g.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        garmentType === g.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-xs'
                          : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Measurements Sliders / Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bust */}
                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-stone-300">
                      {garmentType === 'mens' ? 'Chest Measurement' : 'Bust (Fullest Apex)'}
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-mono">{bust} inches</span>
                  </div>
                  <input
                    id="slider-bust"
                    type="range"
                    min={30}
                    max={54}
                    step={0.5}
                    value={bust}
                    onChange={(e) => setBust(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                    <span>30" (XS)</span>
                    <span>38" (M)</span>
                    <span>54" (4XL+)</span>
                  </div>
                </div>

                {/* Waist */}
                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-stone-300">
                      {garmentType === 'lehenga' ? 'High Waist (at Navel)' : 'Natural Waist'}
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-mono">{waist} inches</span>
                  </div>
                  <input
                    id="slider-waist"
                    type="range"
                    min={24}
                    max={50}
                    step={0.5}
                    value={waist}
                    onChange={(e) => setWaist(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                    <span>24"</span>
                    <span>32"</span>
                    <span>50"</span>
                  </div>
                </div>

                {/* Hips */}
                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-stone-300">Hips (Fullest Part)</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">{hips} inches</span>
                  </div>
                  <input
                    id="slider-hips"
                    type="range"
                    min={32}
                    max={58}
                    step={0.5}
                    value={hips}
                    onChange={(e) => setHips(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                    <span>32"</span>
                    <span>40"</span>
                    <span>58"</span>
                  </div>
                </div>

                {/* Height & Heels */}
                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-stone-300">Height & Footwear</span>
                    <span className="text-xs font-mono text-stone-400">
                      {heightFeet}'{heightInches}" + {heelHeight}" heels
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      id="select-height-feet"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(parseInt(e.target.value))}
                      className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 flex-1"
                    >
                      <option value={4}>4 Feet</option>
                      <option value={5}>5 Feet</option>
                      <option value={6}>6 Feet</option>
                    </select>
                    <select
                      id="select-height-inches"
                      value={heightInches}
                      onChange={(e) => setHeightInches(parseInt(e.target.value))}
                      className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 flex-1"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>{i} Inches</option>
                      ))}
                    </select>
                    <select
                      id="select-heel-height"
                      value={heelHeight}
                      onChange={(e) => setHeelHeight(parseFloat(e.target.value))}
                      className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 flex-1"
                    >
                      <option value={0}>Flats (0")</option>
                      <option value={1.5}>1.5" Heels</option>
                      <option value={2.5}>2.5" Heels</option>
                      <option value={3.5}>3.5" Heels</option>
                      <option value={4.5}>4.5" Platform</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                  Drape & Fit Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fitted', label: 'Tailored / Fitted', desc: '+1.5" Ease' },
                    { id: 'regular', label: 'Standard Atelier', desc: '+2.5" Ease' },
                    { id: 'modest', label: 'Modest / Flowy', desc: '+3.5" Ease' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      id={`fit-pref-${f.id}`}
                      onClick={() => setFitPreference(f.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        fitPreference === f.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="text-xs font-semibold">{f.label}</div>
                      <div className="text-[10px] text-stone-400">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Summary Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/50 to-stone-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-stone-100">Recommended Ready-to-Wear Size:</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-extrabold text-sm shadow-md">
                    {standardSize}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">Finished Stitched Bust</span>
                    <span className="font-semibold text-amber-300">{finishedBust.toFixed(1)} inches</span>
                  </div>
                  {garmentType === 'lehenga' && (
                    <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Lehenga Skirt Length</span>
                      <span className="font-semibold text-amber-300">{lehengaLength} inches</span>
                    </div>
                  )}
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-400 block">Boutique Seam Margin</span>
                    <span className="font-semibold text-emerald-400">+2.0" included for alterations</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-300 leading-relaxed italic border-t border-stone-800/80 pt-2">
                  💡 In South Asian garments, never purchase your exact skin bust measurement for a kameez, otherwise the fabric will pull at the chest and armholes when sitting or raising arms.
                </p>
              </div>
            </>
          ) : (
            /* Measuring Guide Tab */
            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> 1. Bust Apex (For Kurtas, Kameez & Choli)
                </h3>
                <p>
                  Wear the brassiere you plan to wear under your desi outfit. Wrap tailor's tape around the fullest part of your bust, keeping the tape level straight across your back blades. Do not hold your breath.
                </p>
              </div>

              <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> 2. High Waist for Lehengas
                </h3>
                <p>
                  Unlike western jeans that sit at the hip, lehengas are tied at the belly button (navel level) or 1 inch above. Measure snugly around your waist where you prefer your lehenga waistband or drawstring (nada) to rest.
                </p>
              </div>

              <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> 3. Lehenga Skirt Length with Heels
                </h3>
                <p>
                  Put on your intended wedding heels! Measure from your navel straight down to the floor. If you want the lehenga can-can flair to hover slightly above floor (to prevent tripping during dance), deduct 0.5 inches.
                </p>
              </div>

              <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> 4. Men's Sherwani & Kurta Chest
                </h3>
                <p>
                  Measure horizontally across the fullest chest over an undershirt. For tailored bandhgalas and sherwanis, we typically stitch with 3 to 4 inches of total ease across the chest for regal structure.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between bg-stone-950/80">
          <button
            id="close-sizing-modal-bottom-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            id="consult-stylist-with-size-btn"
            onClick={handleAskStylist}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-md shadow-amber-950/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Consult Stylist Noor on this Fit</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
