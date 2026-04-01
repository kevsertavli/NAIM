import { Task, DayRecord, UserConfig, generateInitialRoutine } from './types';
import { format, parse, addMinutes, subMinutes } from 'date-fns';

export interface Insight {
  id: string;
  type: 'move' | 'split' | 'shorten' | 'lengthen' | 'habit';
  message: string;
  affectedTask: string;
  suggestion: any;
}

export function analyzeHistory(history: DayRecord[]): Insight[] {
  if (history.length === 0) return [];

  const insights: Insight[] = [];
  const recentDays = history.slice(-7); // Last 7 days

  // 1. Check for skipped morning tasks (e.g., fitness)
  const morningSkips = recentDays.filter(day => 
    day.tasks.some(t => {
      const hour = parseInt(t.startTime.split(':')[0]);
      return hour < 10 && t.status === 'skipped' && t.category === 'fitness';
    })
  );

  if (morningSkips.length >= 2) {
    insights.push({
      id: 'move-fitness-afternoon',
      type: 'move',
      message: "You've been skipping morning workouts. Let's try moving them to the afternoon when your energy might be higher.",
      affectedTask: 'fitness',
      suggestion: { newTime: '16:00' }
    });
  }

  // 2. Check for delayed study/work tasks
  const delayedWork = recentDays.filter(day => 
    day.tasks.some(t => (t.category === 'work' || t.category === 'study') && t.status === 'delayed')
  );

  if (delayedWork.length >= 3) {
    insights.push({
      id: 'split-work-blocks',
      type: 'split',
      message: "Long work blocks seem difficult to start on time. Breaking them into smaller 45-minute sessions might help.",
      affectedTask: 'work',
      suggestion: { splitCount: 2 }
    });
  }

  // 3. Check for high productivity times
  // (Simulated: if tasks between 10 AM - 12 PM are always completed, mark as 'peak')
  const peakTimeSuccess = recentDays.every(day => 
    day.tasks.filter(t => {
      const h = parseInt(t.startTime.split(':')[0]);
      return h >= 10 && h <= 12;
    }).every(t => t.status === 'completed')
  );

  if (peakTimeSuccess && recentDays.length >= 3) {
    insights.push({
      id: 'peak-productivity-morning',
      type: 'habit',
      message: "You are most consistent between 10 AM and 12 PM. We've scheduled your highest priority tasks here.",
      affectedTask: 'all',
      suggestion: {}
    });
  }

  return insights;
}

export function adaptRoutine(currentTasks: Task[], insights: Insight[]): Task[] {
  let newTasks = [...currentTasks];

  insights.forEach(insight => {
    if (insight.type === 'move') {
      newTasks = newTasks.map(t => {
        if (t.category === insight.affectedTask) {
          return { ...t, startTime: insight.suggestion.newTime, status: 'pending' };
        }
        return { ...t, status: 'pending' };
      });
    }

    if (insight.type === 'split') {
      const taskToSplit = newTasks.find(t => t.category === insight.affectedTask);
      if (taskToSplit) {
        const splitDuration = Math.floor(taskToSplit.duration / 2);
        const firstPart: Task = {
          ...taskToSplit,
          id: `${taskToSplit.id}-1`,
          title: `${taskToSplit.title} (Part 1)`,
          duration: splitDuration,
          status: 'pending'
        };
        const breakTask: Task = {
          id: `break-split-${taskToSplit.id}`,
          title: 'Quick Recharge',
          startTime: format(addMinutes(parse(taskToSplit.startTime, 'HH:mm', new Date()), splitDuration), 'HH:mm'),
          duration: 15,
          category: 'break',
          priority: 'low',
          status: 'pending'
        };
        const secondPart: Task = {
          ...taskToSplit,
          id: `${taskToSplit.id}-2`,
          title: `${taskToSplit.title} (Part 2)`,
          startTime: format(addMinutes(parse(breakTask.startTime, 'HH:mm', new Date()), 15), 'HH:mm'),
          duration: splitDuration,
          status: 'pending'
        };

        newTasks = newTasks.filter(t => t.id !== taskToSplit.id);
        newTasks.push(firstPart, breakTask, secondPart);
      }
    }
  });

  // Sort by start time
  return newTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function calculateProductivityScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  return Math.round((completed / total) * 100);
}
