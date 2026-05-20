import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { SessionRecord } from '../types';
import { Sprout, Flower, Leaf, Trees } from 'lucide-react';

interface ProductivityGardenProps {
  history: SessionRecord[];
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function ProductivityGarden({ history }: ProductivityGardenProps) {
  // Calculer les sessions par jour pour la semaine glissante
  const gardenData = useMemo(() => {
    const data = new Array(7).fill(0);
    const now = new Date();
    
    // On veut les 7 derniers jours finissant aujourd'hui
    history.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        // L'index 6 est aujourd'hui, 0 est il y a 6 jours
        data[6 - diffDays]++;
      }
    });
    
    return data;
  }, [history]);

  const getPlantStage = (sessions: number) => {
    if (sessions === 0) return { component: null, label: 'Terre vide', color: 'text-neutral-300' };
    if (sessions <= 1) return { component: <Sprout className="w-6 h-6" />, label: 'Germe', color: 'text-emerald-300' };
    if (sessions <= 3) return { component: <Leaf className="w-8 h-8" />, label: 'Jeune pousse', color: 'text-emerald-400' };
    if (sessions <= 5) return { component: <Flower className="w-10 h-10" />, label: 'Floraison', color: 'text-emerald-500' };
    return { component: <Trees className="w-12 h-12" />, label: 'Arbre mature', color: 'text-emerald-600' };
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-nav-text flex items-center gap-2">
          <Trees size={14} className="text-emerald-500" />
          Votre Jardin de Focus
        </h3>
        <p className="text-[10px] text-nav-text italic">La régularité nourrit la croissance</p>
      </div>

      <div className="grid grid-cols-7 gap-4 items-end min-h-[160px] pb-4">
        {gardenData.map((sessions, i) => {
          const { component, color } = getPlantStage(sessions);
          const dayIndex = (new Date().getDay() + 6 - (6 - i)) % 7;
          const dayLabel = DAYS[dayIndex === 0 ? 6 : dayIndex - 1]; // Ajustement jour (0=dimanche pour JS)

          return (
            <div key={i} className="flex flex-col items-center group">
              {/* Le "Sol" et la "Plante" */}
              <div className="relative mb-4 flex flex-col items-center justify-end h-28 w-full">
                {/* Sol fertile */}
                <div className="absolute bottom-0 w-12 h-1 bg-notion-border rounded-full opacity-50" />
                
                {/* Plante animée */}
                <motion.div
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 10,
                    delay: i * 0.1 
                  }}
                  className={`${color} filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.2)]`}
                >
                  {component}
                </motion.div>

                {/* Bulle d'info au hover */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-icon-bg text-icon-text text-[9px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap shadow-xl">
                  {sessions} sessions
                </div>
              </div>

              <span className={`text-[10px] font-bold uppercase tracking-widest ${i === 6 ? 'text-apple-blue' : 'text-nav-text'}`}>
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
        <div className="p-2 bg-emerald-500/20 rounded-xl">
          <Trees size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Esprit de la Forêt</p>
          <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/60 leading-relaxed">
            Votre jardin reflète votre discipline. Chaque session de travail complétée est une graine que vous plantez.
          </p>
        </div>
      </div>
    </div>
  );
}
