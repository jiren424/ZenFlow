import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Settings2, Image as ImageIcon } from 'lucide-react';
import { TimerMode, Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

/**
 * Composant SettingsModal
 * Permet aux utilisateurs de personnaliser les durées du minuteur.
 */
export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [workMinutes, setWorkMinutes] = useState(settings[TimerMode.WORK] / 60);
  const [breakMinutes, setBreakMinutes] = useState(settings[TimerMode.SHORT_BREAK] / 60);

  /**
   * Sauvegarde les nouveaux paramètres et ferme le modal.
   */
  const handleSave = () => {
    onSave({
      [TimerMode.WORK]: Math.max(1, Math.min(60, workMinutes)) * 60,
      [TimerMode.SHORT_BREAK]: Math.max(1, Math.min(30, breakMinutes)) * 60,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-notion-bg/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-notion-sidebar border border-notion-border shadow-2xl rounded-3xl p-8 max-w-sm w-full transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-icon-bg text-icon-text rounded-xl transition-colors">
                  <Settings2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-notion-text">Réglages</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-nav-text hover:text-nav-active hover:bg-notion-border rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-nav-text mb-3">
                  <Clock size={12} />
                  <span>Concentration (Min)</span>
                </label>
                <input
                  type="number"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 1)}
                  min="1"
                  max="60"
                  className="w-full bg-notion-bg border border-notion-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nav-active/20 transition-all text-notion-text"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-nav-text mb-3">
                  <Clock size={12} />
                  <span>Pause (Min)</span>
                </label>
                <input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 1)}
                  min="1"
                  max="30"
                  className="w-full bg-notion-bg border border-notion-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nav-active/20 transition-all text-notion-text"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-10 bg-icon-bg text-icon-text py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Enregistrer
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
