/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, CheckCircle, Moon, Sun, TrendingUp } from 'lucide-react';
import PomodoroTimer from './components/PomodoroTimer';
import TodoList from './components/TodoList';
import SettingsModal from './components/SettingsModal';
import StatsView from './components/StatsView';
import GenerativeBackground from './components/GenerativeBackground';
import AiCoach from './components/AiCoach';
import { Task, Priority, LOCAL_STORAGE_KEY, HISTORY_STORAGE_KEY, TimerMode, SessionRecord, Settings, DEFAULT_SETTINGS } from './types';

/**
 * Racine de l'application ZenFlow
 * Orchestre l'état de l'application : liste des tâches, sélection active,
 * et persistance via LocalStorage.
 */
 export default function App() {
  // --- Initialisation de l'État ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<SessionRecord[]>(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('zenflow_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'stats'>('dashboard');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('zenflow_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Appliquer le thème au corps du document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenflow_theme', theme);
  }, [theme]);

  // Gérer le plein écran pour le mode focus
  useEffect(() => {
    const handleFullscreen = async () => {
      if (isFocusMode) {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (err) {
          console.error(`Error attempting to enable full-screen mode: ${err}`);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      }
    };

    handleFullscreen();

    // Nettoyage au cas où l'utilisateur quitte le plein écran manuellement (touche Echap)
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [isFocusMode]);

  // Charger les paramètres depuis le stockage local
  useEffect(() => {
    const savedSettings = localStorage.getItem('zenflow_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // --- Persistance ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('zenflow_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Gestionnaires de Tâches ---

  /**
   * Ajoute une nouvelle tâche à la liste.
   * @param text - Le contenu de la tâche.
   * @param priority - La priorité de la tâche.
   */
  const handleAddTask = (text: string, priority: Priority) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      pomodoros: 0,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    // Sélectionne automatiquement la nouvelle tâche si aucune n'est active
    if (!activeTaskId) setActiveTaskId(newTask.id);
  };

  /**
   * Supprime une tâche par ID.
   * @param id - L'identifiant unique de la tâche.
   */
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  /**
   * Alterne le statut de complétion d'une tâche.
   * @param id - L'identifiant unique de la tâche.
   */
  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  /**
   * Incrémente le compteur de pomodoros pour la tâche active et enregistre la session.
   * Appelée lorsqu'une session de Travail se termine.
   */
  const handleTimerComplete = (durationInSeconds?: number) => {
    // Enregistrer la session dans l'historique
    const newSession: SessionRecord = {
      id: crypto.randomUUID(),
      taskId: activeTaskId,
      timestamp: Date.now(),
      duration: durationInSeconds || settings[TimerMode.WORK]
    };
    setHistory(prev => [newSession, ...prev]);

    // Incrémenter le compteur de la tâche
    if (activeTaskId) {
      setTasks(tasks.map((t) => 
        t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t
      ));
    }
  };

  // Trouver le texte de la tâche actuellement active pour l'affichage
  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Trier les tâches par priorité (Haute > Moyenne > Basse) puis par date de création
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityMap = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
    if (priorityMap[a.priority] !== priorityMap[b.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    return b.createdAt - a.createdAt;
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen font-sans text-notion-text pb-20 transition-colors duration-300 relative">
      {/* Arrière-plan Génératif */}
      <GenerativeBackground />
      
      <div className="relative z-10">
        {/* En-tête Minimaliste */}
        {!isFocusMode && (
          <header className="px-8 py-6 flex items-center justify-between border-b border-notion-border fixed top-0 w-full bg-header-bg backdrop-blur-md z-50 transition-colors duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-icon-bg rounded-lg flex items-center justify-center transition-colors">
              <CheckCircle className="text-icon-text w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-nav-active">ZenFlow</h1>
          </div>
          
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-nav-text">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`inline-flex items-center gap-2 cursor-pointer transition-colors ${currentView === 'dashboard' ? 'text-nav-active' : 'hover:text-nav-active'}`}
              >
                <LayoutGrid size={16} /> Tableau de bord
              </button>
              <button 
                onClick={() => setCurrentView('stats')}
                className={`inline-flex items-center gap-2 cursor-pointer transition-colors ${currentView === 'stats' ? 'text-nav-active' : 'hover:text-nav-active'}`}
              >
                <TrendingUp size={16} /> Statistiques
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-nav-active cursor-pointer transition-colors"
              >
                Paramètres
              </button>
            </nav>

            <button
              onClick={toggleTheme}
              className="p-2 text-nav-text hover:text-nav-active hover:bg-notion-sidebar rounded-xl transition-all"
              title={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings} 
        onSave={setSettings} 
      />

      {/* Contenu Principal */}
      <main className={`transition-all duration-700 ${
        isFocusMode 
          ? 'fixed inset-0 z-[100] flex items-center justify-center' 
          : 'max-w-7xl mx-auto px-4 md:px-8 pt-32'
      }`}>
        
        {currentView === 'stats' && !isFocusMode ? (
          <StatsView tasks={tasks} history={history} />
        ) : (
          <div className={isFocusMode ? 'w-full flex justify-center' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'}>
            
            {/* Titre / Hero (Bento Tile 1) */}
            {!isFocusMode && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 lg:row-span-1 p-8 rounded-[2.5rem] flex flex-col justify-center"
              >
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-notion-text">Concentrez-vous sur l'essentiel.</h2>
                <p className="text-nav-text text-lg max-w-lg">
                  Un rituel simple pour maintenir votre productivité élevée et votre esprit calme.
                </p>
              </motion.section>
            )}

            {/* Timer (Bento Tile 2) */}
            <motion.section 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col items-center justify-center ${isFocusMode ? 'w-full max-w-xl' : 'lg:col-span-2 lg:row-span-2'}`}
            >
              <PomodoroTimer 
                onComplete={handleTimerComplete} 
                activeTaskText={activeTask?.text}
                config={settings}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
              />
            </motion.section>

            {/* Tâches (Bento Tile 3) */}
            {!isFocusMode && (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-1 lg:row-span-3 h-full"
              >
                <div className="glass-card p-2 rounded-[2.5rem] h-full">
                  <TodoList
                    tasks={sortedTasks}
                    activeTaskId={activeTaskId}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleTask={handleToggleTask}
                    onSelectTask={setActiveTaskId}
                  />
                </div>
              </motion.section>
            )}
          </div>
        )}

      </main>

      {/* Pied de page */}
        {!isFocusMode && (
          <footer className="fixed bottom-0 left-0 w-full p-6 text-center text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold pointer-events-none">
            Conçu avec sérénité et intention
          </footer>
        )}
        
        {/* IA Coach */}
        <AiCoach tasks={tasks} activeTask={activeTask?.id} timerMode={settings.timerMode || 'work'} />
      </div>
    </div>
  );
}
