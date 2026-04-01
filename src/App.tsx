import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  Plus, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  Zap, 
  TrendingUp,
  Moon,
  Sun,
  Coffee,
  Dumbbell,
  BookOpen,
  Briefcase,
  User,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parse } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { cn, formatTime } from './lib/utils';
import { 
  Task, 
  UserConfig, 
  DayRecord, 
  AppState, 
  generateInitialRoutine,
  TaskStatus,
  ProductivityStyle
} from './lib/types';
import { 
  analyzeHistory, 
  adaptRoutine, 
  calculateProductivityScore,
  Insight
} from './lib/adaptiveEngine';

// --- Components ---

const Onboarding: React.FC<{ onComplete: (config: UserConfig) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<UserConfig>({
    wakeTime: '07:00',
    sleepTime: '23:00',
    goals: [],
    responsibilities: [],
    productivityStyle: 'flexible',
    onboarded: false
  });

  const goalsOptions = [
    { id: 'fitness', label: 'Fitness & Health', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'study', label: 'Learning & Study', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'work', label: 'Career Growth', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'personal', label: 'Personal Projects', icon: <User className="w-4 h-4" /> },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete({ ...config, onboarded: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Welcome to SmartRoutine</h1>
                <p className="text-slate-500 text-lg">Let's build your perfect day. When do you usually wake up and sleep?</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Wake Up</label>
                  <input 
                    type="time" 
                    value={config.wakeTime}
                    onChange={(e) => setConfig({ ...config, wakeTime: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sleep</label>
                  <input 
                    type="time" 
                    value={config.sleepTime}
                    onChange={(e) => setConfig({ ...config, sleepTime: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">What are your goals?</h1>
                <p className="text-slate-500 text-lg">Select what you want to focus on this month.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {goalsOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => {
                      const newGoals = config.goals.includes(goal.id)
                        ? config.goals.filter(g => g !== goal.id)
                        : [...config.goals, goal.id];
                      setConfig({ ...config, goals: newGoals });
                    }}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                      config.goals.includes(goal.id)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      config.goals.includes(goal.id) ? "bg-indigo-100" : "bg-slate-100"
                    )}>
                      {goal.icon}
                    </div>
                    <span className="font-medium text-sm">{goal.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Productivity Style</h1>
                <p className="text-slate-500 text-lg">How do you prefer to work?</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setConfig({ ...config, productivityStyle: 'focused' })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all",
                    config.productivityStyle === 'focused'
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-100 bg-white"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Deep Focus</h3>
                    <p className="text-sm text-slate-500">Longer blocks, fewer breaks, high intensity.</p>
                  </div>
                </button>
                <button
                  onClick={() => setConfig({ ...config, productivityStyle: 'flexible' })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all",
                    config.productivityStyle === 'flexible'
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-100 bg-white"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Flexible Flow</h3>
                    <p className="text-sm text-slate-500">Shorter sessions, more breaks, adaptable pace.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-200">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Ready to Adapt</h1>
                <p className="text-slate-500 text-lg">SmartRoutine will now generate your initial plan and start learning from your habits.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          {step === 4 ? "Generate My Routine" : "Continue"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ 
  task: Task; 
  onStatusChange: (id: string, status: TaskStatus) => void 
}> = ({ 
  task, 
  onStatusChange 
}) => {
  const categoryIcons = {
    work: <Briefcase className="w-4 h-4" />,
    study: <BookOpen className="w-4 h-4" />,
    fitness: <Dumbbell className="w-4 h-4" />,
    personal: <User className="w-4 h-4" />,
    break: <Coffee className="w-4 h-4" />,
    sleep: <Moon className="w-4 h-4" />,
    morning_routine: <Sun className="w-4 h-4" />,
  };

  const categoryColors = {
    work: "bg-blue-50 text-blue-600 border-blue-100",
    study: "bg-indigo-50 text-indigo-600 border-indigo-100",
    fitness: "bg-emerald-50 text-emerald-600 border-emerald-100",
    personal: "bg-purple-50 text-purple-600 border-purple-100",
    break: "bg-amber-50 text-amber-600 border-amber-100",
    sleep: "bg-slate-50 text-slate-600 border-slate-100",
    morning_routine: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all",
      task.status === 'completed' ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 shadow-sm"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", categoryColors[task.category])}>
            {categoryIcons[task.category]}
          </div>
          <div>
            <h4 className={cn("font-bold text-slate-900", task.status === 'completed' && "line-through")}>{task.title}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(task.startTime)} • {task.duration}m</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider",
                task.priority === 'high' ? "bg-red-50 text-red-600" : 
                task.priority === 'medium' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
              )}>
                {task.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          {task.status === 'pending' ? (
            <>
              <button 
                onClick={() => onStatusChange(task.id, 'completed')}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Complete"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onStatusChange(task.id, 'skipped')}
                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                title="Skip"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onStatusChange(task.id, 'pending')}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ 
  state: AppState; 
  onUpdateTasks: (tasks: Task[]) => void;
  onCompleteDay: () => void;
}> = ({ 
  state, 
  onUpdateTasks, 
  onCompleteDay 
}) => {
  const [view, setView] = useState<'timeline' | 'checklist'>('checklist');
  const insights = useMemo(() => analyzeHistory(state.history), [state.history]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const newTasks = state.dailyTasks.map(t => t.id === id ? { ...t, status } : t);
    onUpdateTasks(newTasks);
  };

  const score = calculateProductivityScore(state.dailyTasks);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-slate-500">{format(new Date(), 'EEEE, MMMM do')}</h2>
            <h1 className="text-2xl font-bold text-slate-900">Today's Routine</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
            {score}%
          </div>
        </div>

        {/* Insights Banner */}
        {insights.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 flex gap-4 items-center"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider">AI Insight</p>
              <p className="text-sm font-medium leading-tight">{insights[0].message}</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setView('checklist')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              view === 'checklist' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            Checklist
          </button>
          <button 
            onClick={() => setView('timeline')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              view === 'timeline' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {view === 'checklist' ? (
          <div className="space-y-3">
            {state.dailyTasks.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
            ))}
          </div>
        ) : (
          <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {state.dailyTasks.map((task, idx) => (
              <div key={task.id} className="relative">
                <div className={cn(
                  "absolute -left-8 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10",
                  task.status === 'completed' ? "bg-emerald-500" : "bg-slate-200"
                )} />
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  {formatTime(task.startTime)}
                </div>
                <TaskCard task={task} onStatusChange={handleStatusChange} />
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={onCompleteDay}
          className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          End Day & Analyze
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Analytics: React.FC<{ history: DayRecord[], currentTasks: Task[], currentDate: string }> = ({ history, currentTasks, currentDate }) => {
  const weekData = useMemo(() => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const isToday = isSameDay(day, parse(currentDate, 'yyyy-MM-dd', new Date()));
      let score = 0;
      
      if (isToday) {
        score = calculateProductivityScore(currentTasks);
      } else {
        const record = history.find(h => isSameDay(parse(h.date, 'yyyy-MM-dd', new Date()), day));
        score = record ? record.productivityScore : 0;
      }

      return {
        name: format(day, 'EEE'),
        score: score,
        fullDate: format(day, 'MMM d'),
      };
    });
  }, [history, currentTasks, currentDate]);

  const avgScore = weekData.filter(d => d.score > 0).length > 0 
    ? Math.round(weekData.reduce((acc, d) => acc + d.score, 0) / weekData.filter(d => d.score > 0).length)
    : 0;

  return (
    <div className="pb-24 px-6 pt-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Evolution</h1>
        <p className="text-slate-500">Your productivity patterns over time.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Avg Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{avgScore}%</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Best Day</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Tue</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900">Weekly Performance</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {weekData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#4f46e5' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900">Recent Insights</h3>
        {history.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Complete your first day to see AI insights.</p>
          </div>
        ) : (
          history.slice(-3).reverse().map((day, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMMM do')}</p>
                <p className="text-xs text-slate-500">{day.tasks.filter(t => t.status === 'completed').length} tasks completed</p>
              </div>
              <div className="text-lg font-bold text-indigo-600">{day.productivityScore}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('smartroutine_state');
    if (saved) return JSON.parse(saved);
    return {
      userConfig: {
        wakeTime: '07:00',
        sleepTime: '23:00',
        goals: [],
        responsibilities: [],
        productivityStyle: 'flexible',
        onboarded: false
      },
      dailyTasks: [],
      history: [],
      currentDate: format(new Date(), 'yyyy-MM-dd')
    };
  });

  const [activeTab, setActiveTab] = useState<'today' | 'analytics' | 'settings'>('today');

  useEffect(() => {
    localStorage.setItem('smartroutine_state', JSON.stringify(state));
  }, [state]);

  const handleOnboardingComplete = (config: UserConfig) => {
    const initialTasks = generateInitialRoutine(config);
    setState(prev => ({
      ...prev,
      userConfig: config,
      dailyTasks: initialTasks,
    }));
  };

  const handleUpdateTasks = (tasks: Task[]) => {
    setState(prev => ({ ...prev, dailyTasks: tasks }));
  };

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCompleteDay = () => {
    const score = calculateProductivityScore(state.dailyTasks);
    const newRecord: DayRecord = {
      date: state.currentDate,
      tasks: [...state.dailyTasks],
      productivityScore: score,
      insights: analyzeHistory([...state.history, { date: state.currentDate, tasks: state.dailyTasks, productivityScore: score, insights: [] }]).map(i => i.message)
    };

    const newHistory = [...state.history, newRecord];
    const insights = analyzeHistory(newHistory);
    
    // Adapt routine for "tomorrow"
    const nextDayTasks = adaptRoutine(generateInitialRoutine(state.userConfig), insights);

    setState(prev => ({
      ...prev,
      history: newHistory,
      dailyTasks: nextDayTasks,
      currentDate: format(addDays(new Date(prev.currentDate), 1), 'yyyy-MM-dd')
    }));

    setNotification("Day completed! SmartRoutine has analyzed your performance and adapted tomorrow's schedule.");
  };

  if (!state.userConfig.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto relative shadow-2xl">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 z-[100] p-4 bg-slate-900 text-white rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              state={state} 
              onUpdateTasks={handleUpdateTasks} 
              onCompleteDay={handleCompleteDay}
            />
          </motion.div>
        )}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Analytics 
              history={state.history} 
              currentTasks={state.dailyTasks} 
              currentDate={state.currentDate} 
            />
          </motion.div>
        )}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 pt-12"
          >
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-bold">Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium">User</p>
                    <p className="text-xs text-slate-500">{state.userConfig.productivityStyle} style</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Reset all data?")) {
                    localStorage.removeItem('smartroutine_state');
                    window.location.reload();
                  }
                }}
                className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100"
              >
                Reset App Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex items-center justify-between z-50">
        <button 
          onClick={() => setActiveTab('today')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'today' ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Today</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'analytics' ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Evolution</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'settings' ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
