/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enumération pour les priorités de tâche.
 */
export enum Priority {
  HIGH = 'Haute',
  MEDIUM = 'Moyenne',
  LOW = 'Basse',
}

/**
 * Interface représentant une Tâche (Item de la liste).
 */
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
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

export interface SessionRecord {
  id: string;
  taskId: string | null;
  timestamp: number;
  duration?: number; // duration in seconds
}

export interface Settings {
  [TimerMode.WORK]: number;
  [TimerMode.SHORT_BREAK]: number;
}

export const DEFAULT_SETTINGS: Settings = {
  [TimerMode.WORK]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
};

export const LOCAL_STORAGE_KEY = 'zenflow_tasks';
export const HISTORY_STORAGE_KEY = 'zenflow_history';

/**
 * URLs des sons pour les notifications.
 * Utilisation de sons UI plus standards et robustes.
 */
export const SOUNDS = {
  START: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Pop subtile
  COMPLETE: 'https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3', // Succès/Cloche
  BTN: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Clic léger
};
