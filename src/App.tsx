/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, CheckCircle } from 'lucide-react';
import PomodoroTimer from './components/PomodoroTimer';
import TodoList from './components/TodoList';
import { Task, LOCAL_STORAGE_KEY } from './types';

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
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // --- Persistance ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // --- Gestionnaires de Tâches ---

  /**
   * Ajoute une nouvelle tâche à la liste.
   * @param text - Le contenu de la tâche.
   */
  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
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
   * Incrémente le compteur de pomodoros pour la tâche active.
   * Appelée lorsqu'une session de Travail se termine.
   */
  const handleTimerComplete = () => {
    if (activeTaskId) {
      setTasks(tasks.map((t) => 
        t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t
      ));
    }
  };

  // Trouver le texte de la tâche actuellement active pour l'affichage
  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-notion-text pb-20">
      {/* En-tête Minimaliste */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-notion-border fixed top-0 w-full bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <CheckCircle className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">ZenFlow</h1>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium text-gray-400">
          <span className="text-black inline-flex items-center gap-2">
            <LayoutGrid size={16} /> Tableau de bord
          </span>
          <span className="hover:text-black cursor-not-allowed">Paramètres</span>
        </nav>
      </header>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto pt-32 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Colonne Gauche : Zone de Focus */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-start lg:sticky lg:top-32 h-fit"
        >
          <div className="w-full">
            <header className="mb-12 text-center lg:text-left">
              <h2 className="text-4xl font-bold tracking-tight mb-3">Concentrez-vous sur l'essentiel.</h2>
              <p className="text-gray-500 max-w-sm mx-auto lg:mx-0">
                Un rituel simple pour maintenir votre productivité élevée et votre esprit calme.
              </p>
            </header>
            
            <PomodoroTimer 
              onComplete={handleTimerComplete} 
              activeTaskText={activeTask?.text}
            />
          </div>
        </motion.section>

        {/* Colonne Droite : Zone de Liste */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full"
        >
          <TodoList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onSelectTask={setActiveTaskId}
          />
        </motion.section>

      </main>

      {/* Pied de page */}
      <footer className="fixed bottom-0 left-0 w-full p-6 text-center text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold pointer-events-none">
        Conçu avec sérénité et intention
      </footer>
    </div>
  );
}
