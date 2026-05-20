import { useState, useRef, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Target, AlertCircle } from 'lucide-react';
import { Task, Priority, SOUNDS } from '../types';

interface TodoListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (text: string, priority: Priority) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onSelectTask: (id: string) => void;
}

/**
 * Composant TodoList
 * Affiche une liste de tâches avec un accent sur la typographie et des interactions minimalistes.
 * Permet d'ajouter, supprimer et sélectionner une tâche pour le minuteur.
 */
export default function TodoList({
  tasks,
  activeTaskId,
  onAddTask,
  onDeleteTask,
  onToggleTask,
  onSelectTask,
}: TodoListProps) {
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Joue le son de complétion.
   */
  const playCompleteSound = useCallback(() => {
    const audio = new Audio(SOUNDS.COMPLETE);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, []);

  /**
   * Gère la création d'une tâche à partir de l'input.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue.trim(), priority);
      setInputValue('');
      setPriority(Priority.MEDIUM); // Reset to default
    }
  };

  /**
   * Alterne l'état d'une tâche et joue un son si complétée.
   */
  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      playCompleteSound();
    }
    onToggleTask(id);
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-red-500 bg-red-500/10';
      case Priority.MEDIUM: return 'text-blue-500 bg-blue-500/10';
      case Priority.LOW: return 'text-gray-500 bg-gray-500/10';
      default: return 'text-nav-text bg-notion-border';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 transition-colors duration-300">
      <AnimatePresence>
        {taskToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-notion-bg/60 backdrop-blur-3xl z-[1000] flex items-center justify-center p-6 transition-colors"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 max-w-sm w-full text-center rounded-[2rem]"
            >
              <div className="w-12 h-12 bg-red-400/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-notion-text">Supprimer la tâche ?</h3>
              <p className="text-nav-text text-sm mb-8 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-3 rounded-xl bg-white/10 text-nav-text font-semibold text-sm hover:bg-notion-border transition-colors border border-notion-border"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    onDeleteTask(taskToDelete);
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-nav-text flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-500" />
          Focus List
        </h2>
        <span className="text-[10px] bg-icon-bg/10 text-icon-bg p-1 px-2 rounded-full font-bold">
          {tasks.filter(t => !t.completed).length} actives
        </span>
      </div>

      {/* Input de Tâche */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-8 bg-white/20 dark:bg-black/20 p-4 rounded-3xl border border-notion-border transition-colors">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Quelle est la suite ?"
            className="w-full bg-notion-bg border border-notion-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nav-active/20 transition-all placeholder:text-nav-text/50 shadow-sm text-notion-text"
          />
          <button
            type="submit"
            className={`absolute right-2 top-1.5 p-1.5 rounded-lg transition-colors ${
              inputValue.trim() ? 'bg-icon-bg text-icon-text' : 'text-nav-text'
            }`}
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-wider text-nav-text font-bold ml-1">Priorité :</span>
          {(Object.values(Priority) as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                priority === p 
                  ? getPriorityColor(p) + ' ring-1 ring-current' 
                  : 'text-nav-text hover:text-nav-active bg-transparent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </form>

      {/* Rendu des Tâches */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center p-4 rounded-3xl transition-all cursor-pointer border ${
                activeTaskId === task.id ? 'bg-white/40 dark:bg-black/20 border-notion-border shadow-sm' : 'border-transparent hover:bg-notion-sidebar/30'
              }`}
              onClick={() => onSelectTask(task.id)}
            >
              {/* Case à cocher */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(task.id, task.completed);
                }}
                className={`flex-shrink-0 transition-colors ${
                  task.completed ? 'text-emerald-500' : 'text-nav-text/40 hover:text-nav-active'
                }`}
              >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>

              {/* Texte de la Tâche */}
              <div className="flex-grow flex flex-col mx-3">
                <span
                  className={`text-sm transition-all ${
                    task.completed ? 'text-nav-text line-through' : 'text-notion-text font-medium'
                  }`}
                >
                  {task.text}
                </span>
                {!task.completed && (
                  <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
                    task.priority === Priority.HIGH ? 'text-red-400' : 
                    task.priority === Priority.MEDIUM ? 'text-blue-400' : 'text-nav-text'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Compteur Pomodoro & Suppression */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.pomodoros > 0 && (
                  <div className="flex items-center text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider" title={`${task.pomodoros} sessions accomplies`}>
                    {task.pomodoros}
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToDelete(task.id);
                  }}
                  className="p-1.5 text-nav-text/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
                
                <div 
                  className={`${activeTaskId === task.id ? 'text-notion-text' : 'text-notion-border'}`}
                  title={activeTaskId === task.id ? "Tâche active" : "Sélectionner pour le timer"}
                >
                  <Target size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-nav-text text-sm font-medium"
          >
            Votre liste est vide.<br/>
            <span className="text-[10px] uppercase tracking-widest opacity-50 mt-2 block">Allez-y doucement.</span>
          </motion.p>
        )}
      </div>
    </div>
  );
}
