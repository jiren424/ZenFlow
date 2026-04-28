import { useState, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Target } from 'lucide-react';
import { Task } from '../types';

interface TodoListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (text: string) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Gère la création d'une tâche à partir de l'input.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 px-2">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 mb-6">
        Liste de Focus
      </h2>

      {/* Input de Tâche */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Quelle est la suite ?"
          className="w-full bg-notion-sidebar border border-notion-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1.5 p-1.5 text-gray-400 hover:text-black transition-colors"
        >
          <Plus size={20} />
        </button>
      </form>

      {/* Rendu des Tâches */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center p-3 rounded-xl transition-all cursor-pointer ${
                activeTaskId === task.id ? 'bg-black/[0.03] ring-1 ring-notion-border' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectTask(task.id)}
            >
              {/* Case à cocher */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTask(task.id);
                }}
                className={`flex-shrink-0 transition-colors ${
                  task.completed ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>

              {/* Texte de la Tâche */}
              <span
                className={`flex-grow mx-3 text-sm transition-all ${
                  task.completed ? 'text-gray-400 line-through' : 'text-notion-text'
                }`}
              >
                {task.text}
              </span>

              {/* Compteur Pomodoro & Suppression */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.pomodoros > 0 && (
                  <div className="flex items-center text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider" title={`${task.pomodoros} sessions accomplies`}>
                    {task.pomodoros}
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
                
                <div 
                  className={`${activeTaskId === task.id ? 'text-black' : 'text-gray-200'}`}
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
            className="text-center py-12 text-gray-400 text-sm font-medium"
          >
            Votre liste est vide.<br/>
            <span className="text-[10px] uppercase tracking-widest opacity-50 mt-2 block">Allez-y doucement.</span>
          </motion.p>
        )}
      </div>
    </div>
  );
}
