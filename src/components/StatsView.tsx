import { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { format, subDays, startOfDay, isSameDay, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, CheckCircle, Clock, Calendar, Trees, ListFilter, ClipboardList, CalendarClock } from 'lucide-react';
import { Task, SessionRecord } from '../types';
import ProductivityGarden from './ProductivityGarden';

interface StatsViewProps {
  tasks: Task[];
  history: SessionRecord[];
}

/**
 * Composant StatsView
 * Visualise les statistiques de productivité à l'aide de recharts.
 */
export default function StatsView({ tasks, history }: StatsViewProps) {
  // --- Préparation des données pour le graphique des sessions (7 derniers jours) ---
  const dailyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(startOfDay(new Date()), 6 - i));
    
    return days.map(day => {
      const count = history.filter(session => isSameDay(new Date(session.timestamp), day)).length;
      return {
        date: format(day, 'EEE', { locale: fr }),
        sessions: count
      };
    });
  }, [history]);

  // --- Préparation des données pour le taux de complétion ---
  const completionData = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    
    return [
      { name: 'Complétées', value: completed, color: '#10b981' },
      { name: 'En cours', value: pending, color: '#6366f1' }
    ];
  }, [tasks]);

  // --- Statistiques Globales ---
  const totalSessions = history.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  const totalFocusTimeMinutes = useMemo(() => {
    const totalSeconds = history.reduce((acc, session) => {
      // duration est en secondes, s'il n'existe pas (ancienne session) on prend 25 min par défaut (1500 s)
      return acc + (session.duration !== undefined ? session.duration : 25 * 60);
    }, 0);
    return Math.floor(totalSeconds / 60);
  }, [history]);

  // État pour filtrer l'historique
  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');
  
  // Limite par défaut des éléments à afficher avant de proposer de "charger plus"
  const [displayCount, setDisplayCount] = useState<number>(5);

  // Map des tâches pour une recherche immédiate O(1)
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach(task => map.set(task.id, task));
    return map;
  }, [tasks]);

  // Options du filtre générées dynamiquement
  const filterOptions = useMemo(() => {
    const options = [
      { id: 'all', text: 'Toutes les sessions' },
      { id: 'free', text: 'Sessions sans tâche (libre)' }
    ];
    
    // Ajouter les tâches présentes de l'appli
    tasks.forEach(task => {
      options.push({ id: task.id, text: task.text });
    });

    // Ajouter les anciennes tâches supprimées mais existantes dans l'historique
    const knownIds = new Set(tasks.map(t => t.id));
    history.forEach(session => {
      if (session.taskId && !knownIds.has(session.taskId)) {
        knownIds.add(session.taskId);
        options.push({ id: session.taskId, text: `Tâche supprimée (ID: ${session.taskId.slice(0, 4)})` });
      }
    });

    return options;
  }, [tasks, history]);

  // Filtrage effectif des sessions
  const filteredSessions = useMemo(() => {
    return history.filter(session => {
      if (selectedTaskId === 'all') return true;
      if (selectedTaskId === 'free') return !session.taskId;
      return session.taskId === selectedTaskId;
    });
  }, [history, selectedTaskId]);

  // Formater la date de la session de manière élégante
  const formatSessionDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeStr = format(date, 'HH:mm');
    if (isToday(date)) {
      return `Aujourd'hui à ${timeStr}`;
    }
    if (isYesterday(date)) {
      return `Hier à ${timeStr}`;
    }
    return format(date, "d MMMM 'à' HH:mm", { locale: fr });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl"
        >
          <div className="flex items-center space-x-3 text-emerald-500 mb-2 font-bold text-xs uppercase tracking-widest">
            <CheckCircle size={16} />
            <span>Tâches Finies</span>
          </div>
          <div className="text-4xl font-bold text-notion-text">{completedTasksCount}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-3xl"
        >
          <div className="flex items-center space-x-3 text-blue-500 mb-2 font-bold text-xs uppercase tracking-widest">
            <TrendingUp size={16} />
            <span>Sessions Pomodoro</span>
          </div>
          <div className="text-4xl font-bold text-notion-text">{totalSessions}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-3xl"
        >
          <div className="flex items-center space-x-3 text-orange-500 mb-2 font-bold text-xs uppercase tracking-widest">
            <Clock size={16} />
            <span>Temps de Focus</span>
          </div>
          <div className="text-4xl font-bold text-notion-text">
            {Math.floor(totalFocusTimeMinutes / 60)}h {totalFocusTimeMinutes % 60}m
          </div>
        </motion.div>
      </div>

      {/* Jardin de Productivité Arborescente */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 rounded-[2.5rem]"
      >
        <ProductivityGarden history={history} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des sessions */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-[2rem]"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-nav-text mb-8 flex items-center space-x-2">
            <Calendar size={16} />
            <span>Activité des 7 derniers jours</span>
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--nav-text)' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--notion-border)',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="var(--icon-bg)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Graphique de complétion */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-[2.25rem]"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-nav-text mb-8 flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>Répartition des tâches</span>
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--notion-border)',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                   verticalAlign="bottom" 
                   align="center"
                   iconType="circle"
                   wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Historique détaillé des sessions Pomodoro */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-8 rounded-[2rem] space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-notion-border/30 pb-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-notion-text flex items-center gap-2">
              <CalendarClock size={16} className="text-icon-bg" />
              <span>Historique détaillé des sessions</span>
            </h3>
            <p className="text-xs text-nav-text">Consultez l'historique de vos sessions de travail et vos accomplissements.</p>
          </div>

          {/* Filtre de tâches */}
          <div className="flex items-center space-x-2">
            <ListFilter size={14} className="text-nav-text" />
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setDisplayCount(5); // Réinitialise l'affichage à 5 à chaque changement de filtre
              }}
              className="bg-notion-bg text-notion-text border border-notion-border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-icon-bg/50 transition cursor-pointer"
            >
              {filterOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des sessions */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredSessions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="p-3 bg-notion-border/20 rounded-full mb-3 text-nav-text">
                  <ClipboardList size={24} />
                </div>
                <p className="text-xs font-semibold text-notion-text">Aucune session trouvée</p>
                <p className="text-[11px] text-nav-text/80 mt-1 max-w-xs">
                  {selectedTaskId === 'all' 
                    ? "Vous n'avez pas encore complété de session de concentration." 
                    : "Aucune session ne correspond à cette tâche."}
                </p>
              </motion.div>
            ) : (
              filteredSessions.slice(0, displayCount).map((session, index) => {
                const task = session.taskId ? taskMap.get(session.taskId) : null;
                const durationMinutes = Math.floor((session.duration || 25 * 60) / 60);

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-notion-border/10 border border-notion-border/20 transition-all bg-notion-bg/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl text-xs font-bold font-mono tracking-wider ${
                        session.taskId 
                          ? 'bg-icon-bg/20 text-icon-bg' 
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {durationMinutes}m
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-notion-text">
                          {session.taskId 
                            ? (task ? task.text : 'Tâche supprimée/archivée')
                            : 'Concentration Libre'}
                        </p>
                        <p className="text-[10px] text-nav-text flex items-center gap-1">
                          <Clock size={10} />
                          <span>{formatSessionDate(session.timestamp)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {session.taskId ? (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${
                          task?.completed 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {task?.completed ? 'Complétée' : 'En cours'}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-neutral-500/10 text-nav-text">
                          Libre
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Bouton pour charger plus */}
        {filteredSessions.length > displayCount && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setDisplayCount(prev => prev + 5)}
              className="text-xs font-semibold text-nav-text hover:text-nav-active border border-notion-border bg-notion-bg/30 px-4 py-2 rounded-xl hover:bg-notion-border/40 transition cursor-pointer"
            >
              Afficher plus de sessions ({filteredSessions.length - displayCount} restantes)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
