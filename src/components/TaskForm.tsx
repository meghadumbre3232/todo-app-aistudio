import { useState, FormEvent } from "react";
import { Plus, Calendar, Tag, AlertCircle, Clock, Bell, BellOff } from "lucide-react";
import { Task } from "../types";

interface TaskFormProps {
  onAddTask: (
    title: string, 
    category: Task["category"], 
    priority: Task["priority"], 
    dueDate?: string,
    dueTime?: string,
    alarmEnabled?: boolean
  ) => Promise<void>;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Task["category"]>("Personal");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAddTask(
        title.trim(),
        category,
        priority,
        dueDate ? dueDate : undefined,
        dueTime ? dueTime : undefined,
        dueTime ? alarmEnabled : false
      );
      setTitle("");
      setDueDate("");
      setDueTime("");
      setAlarmEnabled(true);
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#161616] p-5 rounded-2xl border border-[#2A2A2A] shadow-xl space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          required
          className="flex-1 rounded-xl border border-[#2A2A2A] px-4 py-3 text-sm placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-[#1E1E1E] text-white"
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#161616] transition-all disabled:opacity-50 flex items-center justify-center gap-1 min-w-[100px] shadow-lg shadow-violet-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
        {/* Category selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <Tag className="h-3 w-3 text-violet-400" />
            <span>Category</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Task["category"])}
            className="w-full rounded-xl border border-[#2A2A2A] px-3 py-2.5 text-xs bg-[#1E1E1E] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-neutral-200"
          >
            <option value="Personal">🌸 Personal</option>
            <option value="Work">💻 Work</option>
            <option value="Urgent">🔥 Urgent</option>
            <option value="Shopping">🛒 Shopping</option>
            <option value="Other">✨ Other</option>
          </select>
        </div>

        {/* Priority Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-violet-400" />
            <span>Priority</span>
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#2A2A2A] p-1 bg-[#1E1E1E]">
            {(["low", "medium", "high"] as const).map((p) => {
              const active = priority === p;
              let activeStyle = "";
              if (active) {
                if (p === "high") activeStyle = "bg-red-600 text-white shadow-md shadow-red-900/10";
                else if (p === "medium") activeStyle = "bg-amber-600 text-white shadow-md shadow-amber-900/10";
                else activeStyle = "bg-emerald-600 text-white shadow-md shadow-emerald-900/10";
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    activeStyle ? activeStyle : "text-neutral-400 hover:bg-[#2A2A2A] hover:text-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Due Date Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-violet-400" />
            <span>Due Date (Optional)</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A2A] px-3 py-2 text-xs bg-[#1E1E1E] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-neutral-200"
          />
        </div>

        {/* Due Time & Alarm Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-violet-400" />
            <span>Due Time & Alarm</span>
          </label>
          <div className="flex gap-1.5">
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="flex-1 rounded-xl border border-[#2A2A2A] px-3 py-2 text-xs bg-[#1E1E1E] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-neutral-200"
            />
            <button
              type="button"
              disabled={!dueTime}
              onClick={() => setAlarmEnabled(!alarmEnabled)}
              title={dueTime ? (alarmEnabled ? "Disable Alarm" : "Enable Alarm") : "Set time first to enable alarm"}
              className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                !dueTime 
                  ? "border-[#2A2A2A] bg-[#1E1E1E] text-neutral-600 opacity-40 cursor-not-allowed" 
                  : alarmEnabled
                    ? "border-violet-500/30 bg-violet-600/20 text-violet-400"
                    : "border-[#2A2A2A] bg-[#1E1E1E] text-neutral-400 hover:bg-[#222222]"
              }`}
            >
              {dueTime && alarmEnabled ? (
                <Bell className="h-4 w-4 text-violet-400 animate-pulse" />
              ) : (
                <BellOff className="h-4 w-4 text-neutral-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
