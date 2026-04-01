import { format, addMinutes, parse, isAfter, isBefore } from 'date-fns';

export type TaskCategory = 'work' | 'study' | 'fitness' | 'personal' | 'break' | 'sleep' | 'morning_routine';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'delayed';
export type ProductivityStyle = 'focused' | 'flexible';

export interface Task {
  id: string;
  title: string;
  startTime: string; // HH:mm
  duration: number; // minutes
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  actualStartTime?: string;
  actualDuration?: number;
}

export interface UserConfig {
  wakeTime: string;
  sleepTime: string;
  goals: string[];
  responsibilities: string[];
  productivityStyle: ProductivityStyle;
  onboarded: boolean;
}

export interface DayRecord {
  date: string;
  tasks: Task[];
  productivityScore: number;
  insights: string[];
}

export interface AppState {
  userConfig: UserConfig;
  dailyTasks: Task[];
  history: DayRecord[];
  currentDate: string;
}

// Initial template generator
export function generateInitialRoutine(config: UserConfig): Task[] {
  const tasks: Task[] = [];
  let currentTime = parse(config.wakeTime, 'HH:mm', new Date());

  // Morning Routine
  tasks.push({
    id: 'morning-1',
    title: 'Morning Routine',
    startTime: format(currentTime, 'HH:mm'),
    duration: 45,
    category: 'morning_routine',
    priority: 'medium',
    status: 'pending'
  });
  currentTime = addMinutes(currentTime, 45);

  // Deep Work / Study Block
  tasks.push({
    id: 'work-1',
    title: config.productivityStyle === 'focused' ? 'Deep Work Session' : 'Work/Study Block',
    startTime: format(currentTime, 'HH:mm'),
    duration: 120,
    category: config.goals.includes('study') ? 'study' : 'work',
    priority: 'high',
    status: 'pending'
  });
  currentTime = addMinutes(currentTime, 120);

  // Break
  tasks.push({
    id: 'break-1',
    title: 'Lunch Break',
    startTime: format(currentTime, 'HH:mm'),
    duration: 60,
    category: 'break',
    priority: 'low',
    status: 'pending'
  });
  currentTime = addMinutes(currentTime, 60);

  // Afternoon Session
  tasks.push({
    id: 'work-2',
    title: 'Afternoon Focus',
    startTime: format(currentTime, 'HH:mm'),
    duration: 90,
    category: 'work',
    priority: 'medium',
    status: 'pending'
  });
  currentTime = addMinutes(currentTime, 90);

  // Fitness
  if (config.goals.includes('fitness')) {
    tasks.push({
      id: 'fitness-1',
      title: 'Workout / Movement',
      startTime: format(currentTime, 'HH:mm'),
      duration: 45,
      category: 'fitness',
      priority: 'medium',
      status: 'pending'
    });
    currentTime = addMinutes(currentTime, 45);
  }

  // Personal Time
  tasks.push({
    id: 'personal-1',
    title: 'Personal Time / Goals',
    startTime: format(currentTime, 'HH:mm'),
    duration: 60,
    category: 'personal',
    priority: 'low',
    status: 'pending'
  });

  return tasks;
}
