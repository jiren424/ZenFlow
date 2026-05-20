import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Zap, Maximize, Minimize, Lock, Unlock } from 'lucide-react';
import { TimerMode, SOUNDS } from '../types';

interface PomodoroTimerProps {
  onComplete: (durationInSeconds: number) => void;
  activeTaskText?: string;
  config: Record<TimerMode, number>;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

/**
 * Composant PomodoroTimer
 * Gère la logique du compte à rebours et affiche un indicateur de progression circulaire minimaliste.
 * Amélioré avec le support étendu de l'accessibilité ARIA et des annonces sonores/lecteurs d'écran.
 */
export default function PomodoroTimer({ 
  onComplete, 
  activeTaskText, 
  config, 
  isFocusMode, 
  onToggleFocusMode 
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timeLeft, setTimeLeft] = useState(config[TimerMode.WORK]);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');

  // Déverrouiller automatiquement si on quitte le mode focus
  useEffect(() => {
    if (!isFocusMode) {
      setIsLocked(false);
    }
  }, [isFocusMode]);

  // Constantes pour les calculs du cercle
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - timeLeft / config[mode];

  /**
   * Fonction utilitaire pour jouer un son.
   * On crée un nouvel objet Audio pour chaque lecture afin d'éviter les conflits de rechargement.
   */
  const playSound = useCallback((url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, []);

  /**
   * Format vocal compréhensible pour le lecteur d'écran
   */
  const getSpokenTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const minStr = min > 0 ? `${min} minute${min > 1 ? 's' : ''}` : '';
    const secStr = sec > 0 ? `${sec} seconde${sec > 1 ? 's' : ''}` : '';
    return [minStr, secStr].filter(Boolean).join(' et ') || '0 secondes';
  };

  /**
   * Alterne l'état du minuteur entre actif et en pause.
   */
  const toggleTimer = () => {
    if (isLocked) return;
    if (!isActive) {
      playSound(SOUNDS.START);
      setAriaAnnouncement(`Minuteur démarré. Mode ${mode === TimerMode.WORK ? 'Concentration' : 'Pause'} commencé. Temps restant : ${getSpokenTime(timeLeft)}.`);
    } else {
      setAriaAnnouncement(`Minuteur mis en pause. Suspendu à ${getSpokenTime(timeLeft)}.`);
    }
    setIsActive(!isActive);
  };

  /**
   * Réinitialise le minuteur à l'état initial du mode actuel.
   */
  const resetTimer = useCallback(() => {
    if (isLocked) return;
    setIsActive(false);
    setTimeLeft(config[mode]);
    playSound(SOUNDS.BTN);
    setAriaAnnouncement(`Minuteur réinitialisé. Temps restant configuré à ${getSpokenTime(config[mode])}.`);
  }, [mode, playSound, config, isLocked]);

  const currentConfigValRef = useRef(config[mode]);

  /**
   * Effet pour mettre à jour le temps si la config change et que le minuteur n'est pas actif.
   */
  useEffect(() => {
    if (currentConfigValRef.current !== config[mode]) {
      currentConfigValRef.current = config[mode];
      if (!isActive) {
        setTimeLeft(config[mode]);
      }
    }
  }, [config, mode, isActive]);

  /**
   * Effet pour gérer l'intervalle du compte à rebours.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const nextVal = prev - 1;
          // Annoncer poliment le temps restant toutes les minutes, ou quand il reste 30s, 10s pour s'assurer de l'annonce d'accessibilité
          if (nextVal > 0 && nextVal % 60 === 0) {
            setAriaAnnouncement(`${Math.floor(nextVal / 60)} minutes restantes.`);
          } else if (nextVal === 30 || nextVal === 10) {
            setAriaAnnouncement(`${nextVal} secondes restantes.`);
          }
          return nextVal;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound(SOUNDS.COMPLETE);
      setAriaAnnouncement(`Minuteur terminé !`);
      
      if (mode === TimerMode.WORK) {
        onComplete(config[TimerMode.WORK]);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onComplete, playSound]);

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
    if (isLocked) return;
    setMode(newMode);
    setTimeLeft(config[newMode]);
    setIsActive(false);
    playSound(SOUNDS.BTN);
    setAriaAnnouncement(`Mode changé pour ${newMode === TimerMode.WORK ? 'Concentration' : 'Pause'}. Temps restant défini à ${getSpokenTime(config[newMode])}.`);
  };

  const toggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    playSound(SOUNDS.BTN);
    setAriaAnnouncement(nextLocked ? "Écran et contrôles verrouillés pour rester concentré." : "Écran déverrouillé.");
  };

  const handleToggleFocus = () => {
    if (isLocked) return;
    const nextFocus = !isFocusMode;
    onToggleFocusMode();
    setAriaAnnouncement(nextFocus ? "Mode Focus activé. Une interface plein écran calme est affichée." : "Mode Focus désactivé.");
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 backdrop-blur-3xl rounded-[2.5rem] transition-all duration-700 w-full max-w-md mx-auto ${
      isFocusMode 
        ? 'bg-transparent border-none shadow-none md:scale-125' 
        : 'glass-card'
    }`}>
      {/* Région d'annonce pour lecteur d'écran */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </div>

      {/* Sélecteur de Mode */}
      <AnimatePresence>
        {!isLocked && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex space-x-2 mb-8 bg-notion-border/40 p-1 rounded-xl"
            role="tablist"
            aria-label="Modes du minuteur"
          >
            <button
              onClick={() => handleModeChange(TimerMode.WORK)}
              role="tab"
              aria-selected={mode === TimerMode.WORK}
              aria-label="Mode Concentration de 25 minutes"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === TimerMode.WORK ? 'bg-icon-bg shadow-sm text-icon-text' : 'text-nav-text hover:text-nav-active'
              }`}
            >
              Concentration
            </button>
            <button
              onClick={() => handleModeChange(TimerMode.SHORT_BREAK)}
              role="tab"
              aria-selected={mode === TimerMode.SHORT_BREAK}
              aria-label="Mode Pause de 5 minutes"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === TimerMode.SHORT_BREAK ? 'bg-icon-bg shadow-sm text-icon-text' : 'text-nav-text hover:text-nav-active'
              }`}
            >
              Pause
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de Progression Circulaire */}
      <div 
        className="relative w-64 h-64 flex items-center justify-center group"
        role="timer"
        aria-live="off"
        aria-label={`Temps restant : ${getSpokenTime(timeLeft)}`}
      >
        <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
          <circle
            cx="128"
            cy="128"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
            className="text-notion-border/30"
          />
          <motion.circle
            cx="128"
            cy="128"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 1, ease: "linear" }}
            className={mode === TimerMode.WORK ? "text-notion-text" : "text-emerald-500"}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Temps visible normal */}
          <span 
            className={`text-6xl font-extralight tracking-tighter tabular-nums transition-all duration-500 ${isLocked ? 'scale-110' : ''} text-notion-text`}
            aria-hidden="true"
          >
            {formatTime(timeLeft)}
          </span>
          {/* Equivalent accessible pour lecteur d'écran */}
          <span className="sr-only">
            {getSpokenTime(timeLeft)} restants.
          </span>
          <AnimatePresence>
            {!isLocked && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] uppercase tracking-[0.3em] text-nav-text mt-4 font-bold"
                aria-hidden="true"
              >
                {mode === TimerMode.WORK ? 'En Flow' : 'Récupération'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {isLocked && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-0 right-0 p-4"
            aria-hidden="true"
          >
            <Lock size={16} className="text-nav-text opacity-40" />
          </motion.div>
        )}
      </div>

      {/* Nom de la Tâche Active */}
      <div className="mt-8 h-6 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {activeTaskText && !isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center space-x-2 text-xs text-nav-text font-bold uppercase tracking-widest opacity-60"
            >
              <Zap size={12} className="text-orange-400 fill-orange-400" aria-hidden="true" />
              <span>Tâche active : {activeTaskText}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contrôles */}
      <div className="flex items-center space-x-8 mt-12">
        {!isLocked && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={resetTimer}
            className="p-3 text-nav-text hover:text-nav-active transition-colors rounded-full hover:bg-notion-border/30"
            aria-label="Réinitialiser le minuteur"
          >
            <RotateCcw size={20} aria-hidden="true" />
          </motion.button>
        )}

        <motion.button
          onClick={toggleTimer}
          whileHover={isLocked ? {} : { scale: 1.05 }}
          whileTap={isLocked ? {} : { scale: 0.95 }}
          aria-label={isActive ? "Mettre en pause le minuteur" : "Démarrer le minuteur"}
          aria-disabled={isLocked}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
            isLocked 
              ? 'bg-notion-border/20 text-nav-text/30 cursor-not-allowed shadow-none' 
              : 'bg-icon-bg text-icon-text shadow-lg active:shadow-inner'
          }`}
        >
          {isActive ? <Pause size={28} aria-hidden="true" /> : <Play size={28} className="translate-x-0.5" aria-hidden="true" />}
        </motion.button>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleToggleFocus}
            disabled={isLocked}
            aria-label={isFocusMode ? "Quitter le mode Focus" : "Activer le mode Focus plein écran"}
            className={`p-3 transition-all rounded-full hover:bg-notion-border/30 ${
              isLocked ? 'opacity-20 cursor-not-allowed' : 'text-nav-text hover:text-nav-active'
            }`}
          >
            {isFocusMode ? <Minimize size={20} aria-hidden="true" /> : <Maximize size={20} aria-hidden="true" />}
          </button>
          
          {isFocusMode && (
            <button
              onClick={toggleLock}
              aria-label={isLocked ? "Déverrouiller l'écran et les contrôles" : "Verrouiller l'écran et les contrôles"}
              className={`p-3 transition-all rounded-full ${
                isLocked 
                  ? 'bg-emerald-500/20 text-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'text-nav-text hover:bg-notion-border/30'
              }`}
            >
              {isLocked ? <Unlock size={20} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
