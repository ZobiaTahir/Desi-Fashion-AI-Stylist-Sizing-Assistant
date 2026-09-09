import React, { useState } from 'react';
import { 
  X, 
  User, 
  Save, 
  Sparkles, 
  Check, 
  Ruler, 
  Calendar 
} from 'lucide-react';
import { CustomerProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile;
  onSaveProfile: (profile: CustomerProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<CustomerProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div 
      id="profile-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        id="profile-modal-card"
        className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100 font-serif-heading">
                Client Style & Measurement Profile
              </h2>
              <p className="text-xs text-stone-400">
                Personalize your consultations with Noor automatically
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Your Name / Nickname
              </label>
              <input
                id="profile-name-input"
                type="text"
                placeholder="e.g., Ayesha, Priya, or Zain"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Upcoming Occasion / Event
              </label>
              <input
                id="profile-occasion-input"
                type="text"
                placeholder="e.g., Best Friend's Sangeet, Eid Milan, Brother's Walima"
                value={formData.preferredOccasion}
                onChange={(e) => setFormData({ ...formData, preferredOccasion: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Bust / Chest (inches)
                </label>
                <input
                  id="profile-bust-input"
                  type="text"
                  placeholder="e.g., 36"
                  value={formData.bust}
                  onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  High Waist (inches)
                </label>
                <input
                  id="profile-waist-input"
                  type="text"
                  placeholder="e.g., 29"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Hips (inches)
                </label>
                <input
                  id="profile-hips-input"
                  type="text"
                  placeholder="e.g., 39"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Height
                </label>
                <input
                  id="profile-height-input"
                  type="text"
                  placeholder="e.g., 5'5&quot;"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Fit Silhouette Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fitted', label: 'Tailored / Fitted' },
                  { id: 'regular', label: 'Regular Atelier' },
                  { id: 'modest', label: 'Modest / Flowy' },
                ].map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    id={`profile-fit-${f.id}`}
                    onClick={() => setFormData({ ...formData, fitPreference: f.id as any })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center ${
                      formData.fitPreference === f.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Once saved, Noor will reference these measurements during styling consultations without you having to retype them.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              id="clear-profile-btn"
              onClick={() => {
                const cleared: CustomerProfile = {
                  name: '',
                  bust: '',
                  waist: '',
                  hips: '',
                  height: '',
                  fitPreference: 'regular',
                  preferredOccasion: '',
                  gender: 'female',
                };
                setFormData(cleared);
                onSaveProfile(cleared);
              }}
              className="text-xs text-stone-400 hover:text-rose-400 transition-colors"
            >
              Clear profile
            </button>

            <button
              type="submit"
              id="save-profile-btn"
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-md shadow-amber-950/50 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-stone-950" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-stone-950" />
                  <span>Save Client Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
