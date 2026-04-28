/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Interface représentant une Tâche (Item de la liste).
 */
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  pomodoros: number; // Nombre de sessions pomodoro effectuées sur cette tâche
  createdAt: number;
}

/**
 * Enumération pour les modes du Timer.
 */
export enum TimerMode {
  WORK = 'Travail',
  SHORT_BREAK = 'Pause',
}

/**
 * Configuration du Timer.
 */
export const TIMER_CONFIG = {
  [TimerMode.WORK]: 25 * 60, // 25 minutes
  [TimerMode.SHORT_BREAK]: 5 * 60, // 5 minutes
};

export const LOCAL_STORAGE_KEY = 'zenflow_tasks';
