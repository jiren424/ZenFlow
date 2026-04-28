import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { TimerMode, TIMER_CONFIG } from '../types';

interface PomodoroTimerProps {
  onComplete: () => void;
  activeTaskText?: string;
}

/**
 * Composant PomodoroTimer
 * Gère la logique du compte à rebours et affiche un indicateur de progression circulaire minimaliste.
 * 
 * @param onComplete - Fonction rappel exécutée quand une session pomodoro est terminée.
 * @param activeTaskText - Texte optionnel de la tâche actuellement sélectionnée.
 */
export default function PomodoroTimer({ onComplete, activeTaskText }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG[TimerMode.WORK]);
  const [isActive, setIsActive] = useState(false);

  // Constantes pour les calculs du cercle
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - timeLeft / TIMER_CONFIG[mode];

  /**
   * Alterne l'état du minuteur entre actif et en pause.
   */
  const toggleTimer = () => setIsActive(!isActive);

  /**
   * Réinitialise le minuteur à l'état initial du mode actuel.
   */
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(TIMER_CONFIG[mode]);
  }, [mode]);

  /**
   * Effet pour gérer l'intervalle du compte à rebours.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Déclenche le rappel de complétion si c'était une session de TRAVAIL
      if (mode === TimerMode.WORK) {
        onComplete();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onComplete]);

  /**
   * Formate les secondes en une chaîne lisible MM:SS.
   */
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  /**
   * Change le mode du minuteur manuellement.
   */
  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode]);
    setIsActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-notion-border shadow-sm w-full max-w-md mx-auto">
      {/* Sélecteur de Mode */}
      <div className="flex space-x-2 mb-8 bg-black/5 p-1 rounded-xl">
        <button
          onClick={() => handleModeChange(TimerMode.WORK)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === TimerMode.WORK ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          Concentration
        </button>
        <button
          onClick={() => handleModeChange(TimerMode.SHORT_BREAK)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === TimerMode.SHORT_BREAK ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          Pause
        </button>
      </div>

      {/* Indicateur de Progression Circulaire */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-100"
          />
          <motion.circle
            cx="128"
            cy="128"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 1, ease: "linear" }}
            className={mode === TimerMode.WORK ? "text-black" : "text-emerald-500"}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light tracking-tight tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 mt-2 font-medium">
            {mode === TimerMode.WORK ? 'En Flow' : 'Récupération'}
          </span>
        </div>
      </div>

      {/* Nom de la Tâche Active */}
      <div className="mt-8 h-6 text-center">
        <AnimatePresence mode="wait">
          {activeTaskText && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center space-x-2 text-sm text-gray-500 font-medium"
            >
              <Zap size={14} className="text-orange-400 fill-orange-400" />
              <span>{activeTaskText}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contrôles */}
      <div className="flex items-center space-x-6 mt-8">
        <button
          onClick={resetTimer}
          className="p-3 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
          title="Réinitialiser"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={toggleTimer}
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
        </button>

        <button
          disabled
          className="p-3 text-gray-300 transition-colors rounded-full cursor-not-allowed"
        >
          {mode === TimerMode.WORK ? <Zap size={20} /> : <Coffee size={20} />}
        </button>
      </div>
    </div>
  );
}
