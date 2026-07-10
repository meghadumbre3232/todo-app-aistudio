import { useEffect, useState } from "react";
import { Task } from "./types";
import TaskForm from "./components/TaskForm";
import TaskItem from "./components/TaskItem";
import { 
  CloudOff,
  CheckCircle, 
  ListTodo, 
  Search, 
  SlidersHorizontal, 
  Sparkles,
  RefreshCw,
  Info,
  Clock,
  Bell,
  BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function playAlarmSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play quick retro digital alarm buzzer sounds with square waves (much louder & richer harmonics)
    const playBeep = (freq: number, start: number, duration: number, type: "square" | "sawtooth" | "sine" = "square") => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Dual oscillator for rich, extremely loud chorusing sound
      osc1.type = type;
      osc1.frequency.setValueAtTime(freq, start);
      
      osc2.type = "triangle"; // Thick base sound
      osc2.frequency.setValueAtTime(freq + 10, start); // detuned for extra richness
      
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.5, start + 0.01); // Quick snappy attack
      gainNode.gain.setValueAtTime(0.5, start + duration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0.001, start + duration); // Fast decay
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(start);
      osc1.stop(start + duration);
      
      osc2.start(start);
      osc2.stop(start + duration);
    };

    // 4 quick digital beeps in rapid succession, repeating
    const beepDur = 0.12;
    playBeep(2400, now, beepDur, "square");
    playBeep(2400, now + 0.18, beepDur, "square");
    
    playBeep(2400, now + 0.45, beepDur, "square");
    playBeep(2400, now + 0.63, beepDur, "square");
    
    // Final high pitch alert beep
    playBeep(2800, now + 0.9, beepDur * 1.8, "square");
  } catch (e) {
    console.warn("Failed to play alarm chime:", e);
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [activeAlarms, setActiveAlarms] = useState<Task[]>([]);
  
  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"createdAt" | "dueDate" | "priority">("createdAt");

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const localData = localStorage.getItem("sync_task_items");
      if (localData) {
        setTasks(JSON.parse(localData));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Save tasks to localStorage when state changes
  const saveTasksToLocalStorage = (updatedTasks: Task[]) => {
    try {
      localStorage.setItem("sync_task_items", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
    }
  };

  // Alarm ticking detector
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // Get local YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      // Get local HH:MM
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      let updated = false;
      const updatedTasks = tasks.map((task) => {
        if (task.dueTime && task.alarmEnabled && !task.alarmTriggered && !task.completed) {
          const taskDate = task.dueDate || todayStr;
          
          const isSameDayOrPast = taskDate <= todayStr;
          const isSameTimeOrPast = taskDate < todayStr || currentTimeStr >= task.dueTime;

          if (isSameDayOrPast && isSameTimeOrPast) {
            setActiveAlarms((prev) => {
              if (prev.some((t) => t.id === task.id)) return prev;
              return [...prev, task];
            });
            updated = true;
            return { ...task, alarmTriggered: true };
          }
        }
        return task;
      });

      if (updated) {
        setTasks(updatedTasks);
        saveTasksToLocalStorage(updatedTasks);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Alarm audio loop
  useEffect(() => {
    if (activeAlarms.length === 0) return;

    playAlarmSound();
    const interval = setInterval(() => {
      playAlarmSound();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeAlarms]);

  // Handle adding tasks
  const handleAddTask = async (
    title: string, 
    category: Task["category"], 
    priority: Task["priority"], 
    dueDate?: string,
    dueTime?: string,
    alarmEnabled?: boolean
  ) => {
    const taskId = "task_" + Math.random().toString(36).substring(2, 15);
    const newTask: Task = {
      id: taskId,
      userId: "local_user",
      title,
      completed: false,
      category,
      priority,
      createdAt: new Date().toISOString()
    };

    if (dueDate) {
      newTask.dueDate = dueDate;
    }
    if (dueTime) {
      newTask.dueTime = dueTime;
      newTask.alarmEnabled = alarmEnabled !== undefined ? alarmEnabled : true;
      newTask.alarmTriggered = false;
    }

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  // Toggle complete
  const handleToggleTask = async (id: string, completed: boolean) => {
    const updatedTasks = tasks.map((t) => 
      t.id === id ? { ...t, completed, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  // Update task attributes (supports editing all details)
  const handleUpdateTask = async (id: string, updatedFields: Partial<Task>) => {
    const updatedTasks = tasks.map((t) => 
      t.id === id ? { ...t, ...updatedFields, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  // Filtering and sorting calculations
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "createdAt") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === "priority") {
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    }
    return 0;
  });

  // Task metrics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const urgentCount = tasks.filter((t) => t.category === "Urgent" && !t.completed).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-sans selection:bg-violet-500/20 selection:text-violet-200">
      {/* Header Navigation */}
      <header className="sticky top-0 z-10 border-b border-[#2A2A2A] bg-[#161616]/85 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">SyncTask</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CloudOff className="h-3 w-3 text-neutral-500" />
                <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Local Mode (No External Sync)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#1E1E1E] rounded-xl border border-[#2A2A2A]">
            <span className="w-2 h-2 bg-neutral-600 rounded-full"></span>
            <span className="text-[11px] font-semibold text-neutral-400">Offline-Safe</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Simple local storage alert banner */}
        <div className="p-5 bg-[#161616] border border-[#2A2A2A] rounded-2xl flex items-start gap-3.5 shadow-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/10">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Local Storage Enabled</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              Your tasks are saved locally on this browser. They will persist automatically even if you refresh or close this tab, giving you instant access and zero network latency.
            </p>
          </div>
        </div>

        {/* Statistics Dashboard Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#161616] p-5 rounded-2xl border border-[#2A2A2A] shadow-md">
            <span className="text-xs font-semibold text-neutral-500">Total Tasks</span>
            <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          </div>
          
          <div className="bg-[#161616] p-5 rounded-2xl border border-[#2A2A2A] shadow-md">
            <span className="text-xs font-semibold text-neutral-500">Completed</span>
            <p className="text-2xl font-bold text-violet-400 mt-1">
              {completedCount} <span className="text-xs text-neutral-500 font-normal">/ {totalCount}</span>
            </p>
          </div>

          <div className="bg-[#161616] p-5 rounded-2xl border border-[#2A2A2A] shadow-md">
            <span className="text-xs font-semibold text-neutral-500">Urgent Duties</span>
            <p className="text-2xl font-bold text-rose-400 mt-1">{urgentCount}</p>
          </div>

          <div className="bg-[#161616] p-5 rounded-2xl border border-[#2A2A2A] shadow-md flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-neutral-500">Completion</span>
              <span className="text-xs font-bold text-emerald-400">{completionRate}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <motion.div 
                className="bg-emerald-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </section>

        {/* Input Form Module */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Add New Task</h2>
          <TaskForm onAddTask={handleAddTask} />
        </section>

        {/* Filters and List Module */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Your Task Registry</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#2A2A2A] py-2 pl-9 pr-3 text-xs bg-[#161616] text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-[#2A2A2A] py-2 px-3 text-xs bg-[#161616] text-neutral-200 focus:outline-none focus:border-violet-500 font-semibold"
                >
                  <option value="createdAt">⏰ Date Added</option>
                  <option value="dueDate">📅 Due Date</option>
                  <option value="priority">🔥 Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Tab selector */}
          <div className="flex flex-wrap gap-1.5 border-b border-[#2A2A2A] pb-3">
            {["All", "Personal", "Work", "Urgent", "Shopping", "Other"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/20"
                    : "bg-[#161616] text-neutral-400 border border-[#2A2A2A] hover:bg-[#222222] hover:text-white"
                }`}
              >
                {cat === "All" ? "✨ All" : cat}
              </button>
            ))}
          </div>

          {/* List display */}
          <div className="space-y-3">
            {loadingTasks ? (
              <div className="text-center py-12 space-y-3">
                <RefreshCw className="h-6 w-6 animate-spin text-violet-500 mx-auto" />
                <p className="text-xs text-neutral-500">Updating tasks list...</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="text-center py-16 bg-[#161616] border border-[#2A2A2A] rounded-2xl space-y-3 p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E1E1E] text-neutral-500 border border-dashed border-[#2A2A2A]">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-300">No tasks found</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {searchTerm || selectedCategory !== "All"
                      ? "Try clearing your filters or search criteria."
                      : "Create your first task to get started."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                  {sortedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onUpdateTask={handleUpdateTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Active Alarms Notification Overlay */}
      <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {activeAlarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="bg-[#1E1E1E] border-2 border-violet-500 rounded-2xl p-4 shadow-2xl shadow-violet-950/40 flex items-start gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white animate-bounce shadow-lg shadow-violet-600/30">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Alarm Active</span>
                  <span className="text-xs font-semibold text-neutral-400">{alarm.dueTime}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1 truncate">{alarm.title}</h4>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      handleToggleTask(alarm.id, true);
                      setActiveAlarms((prev) => prev.filter((a) => a.id !== alarm.id));
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white transition-all cursor-pointer text-center"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => {
                      setActiveAlarms((prev) => prev.filter((a) => a.id !== alarm.id));
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#2A2A2A] hover:bg-neutral-800 border border-[#3A3A3A] text-xs font-bold text-neutral-300 transition-all cursor-pointer text-center"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
