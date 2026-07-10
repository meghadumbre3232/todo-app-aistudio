import { useState } from "react";
import { Task } from "../types";
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Tag, 
  Edit2, 
  Check, 
  X,
  AlertTriangle,
  Clock,
  Bell,
  BellOff
} from "lucide-react";
import { motion } from "motion/react";

interface TaskItemProps {
  key?: string;
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updatedFields: Partial<Task>) => Promise<void>;
}

export default function TaskItem({ task, onToggle, onDelete, onUpdateTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedCategory, setEditedCategory] = useState<Task["category"]>(task.category);
  const [editedPriority, setEditedPriority] = useState<Task["priority"]>(task.priority);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || "");
  const [editedDueTime, setEditedDueTime] = useState(task.dueTime || "");
  const [editedAlarmEnabled, setEditedAlarmEnabled] = useState(task.alarmEnabled || false);
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = () => {
    setEditedTitle(task.title);
    setEditedCategory(task.category);
    setEditedPriority(task.priority);
    setEditedDueDate(task.dueDate || "");
    setEditedDueTime(task.dueTime || "");
    setEditedAlarmEnabled(task.alarmEnabled || false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) return;

    setSaving(true);
    try {
      const updatedFields: Partial<Task> = {
        title: editedTitle.trim(),
        category: editedCategory,
        priority: editedPriority,
        dueDate: editedDueDate || undefined,
        dueTime: editedDueTime || undefined,
        alarmEnabled: editedDueTime ? editedAlarmEnabled : false,
      };

      // Reset alarmTriggered if alarm settings have changed so it can fire again
      if (
        editedDueTime !== task.dueTime ||
        editedDueDate !== task.dueDate ||
        editedAlarmEnabled !== task.alarmEnabled
      ) {
        updatedFields.alarmTriggered = false;
      }

      await onUpdateTask(task.id, updatedFields);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().split("T")[0];
    return task.dueDate < today;
  };

  // Color mappings
  const priorityColors = {
    high: "bg-red-950/40 text-red-400 border-red-900/20",
    medium: "bg-amber-950/40 text-amber-400 border-amber-900/20",
    low: "bg-emerald-950/40 text-emerald-400 border-emerald-900/20"
  };

  const categoryEmojis = {
    Personal: "🌸",
    Work: "💻",
    Urgent: "🔥",
    Shopping: "🛒",
    Other: "✨"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={`group flex items-start justify-between gap-3 p-4 bg-[#161616] rounded-2xl border border-[#2A2A2A] shadow-sm hover:shadow-lg hover:shadow-violet-950/5 hover:border-violet-500/30 transition-all ${
        task.completed ? "opacity-60 bg-[#121212]" : ""
      }`}
    >
      {/* Complete toggle checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className="mt-0.5 flex-shrink-0 text-neutral-500 hover:text-violet-400 transition-colors focus:outline-none cursor-pointer"
      >
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-violet-500 fill-violet-950/40" />
        ) : (
          <Circle className="h-5 w-5 text-neutral-600 hover:text-violet-400" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {isEditing ? (
          <div className="space-y-3.5 w-full bg-[#1A1A1A] p-4 rounded-xl border border-[#2E2E2E]">
            {/* Title field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Task Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-sm border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 bg-[#121212] text-white"
                autoFocus
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Category</label>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value as Task["category"])}
                  className="w-full text-xs border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 bg-[#121212] text-neutral-200"
                >
                  <option value="Personal">🌸 Personal</option>
                  <option value="Work">💻 Work</option>
                  <option value="Urgent">🔥 Urgent</option>
                  <option value="Shopping">🛒 Shopping</option>
                  <option value="Other">✨ Other</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Priority</label>
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value as Task["priority"])}
                  className="w-full text-xs border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 bg-[#121212] text-neutral-200"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  className="w-full text-xs border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 bg-[#121212] text-neutral-200"
                />
              </div>

              {/* Due Time & Alarm */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Due Time & Alarm</span>
                  {editedDueTime && (
                    <span className="text-[9px] text-violet-400 lowercase italic">
                      {editedAlarmEnabled ? "Alarm will trigger" : "Alarm muted"}
                    </span>
                  )}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={editedDueTime}
                    onChange={(e) => {
                      setEditedDueTime(e.target.value);
                      if (!e.target.value) {
                        setEditedAlarmEnabled(false);
                      } else if (!editedDueTime) {
                        setEditedAlarmEnabled(true);
                      }
                    }}
                    className="flex-1 text-xs border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 bg-[#121212] text-neutral-200"
                  />
                  <button
                    type="button"
                    disabled={!editedDueTime}
                    onClick={() => setEditedAlarmEnabled(!editedAlarmEnabled)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                      !editedDueTime
                        ? "border-[#2A2A2A] bg-[#121212] text-neutral-600 opacity-40 cursor-not-allowed"
                        : editedAlarmEnabled
                          ? "border-violet-500/30 bg-violet-600/20 text-violet-400"
                          : "border-[#2A2A2A] bg-[#121212] text-neutral-400 hover:bg-[#222222]"
                    }`}
                  >
                    {editedDueTime && editedAlarmEnabled ? (
                      <Bell className="h-4 w-4 text-violet-400 animate-pulse" />
                    ) : (
                      <BellOff className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-[#2A2A2A]/40 mt-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-violet-600/20"
              >
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <span
            className={`block text-sm font-medium break-words leading-relaxed text-neutral-200 ${
              task.completed ? "line-through text-neutral-500 decoration-neutral-700" : ""
            }`}
          >
            {task.title}
          </span>
        )}

        {/* Badges / Meta Info */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-300 bg-[#1E1E1E] px-2 py-0.5 rounded-lg border border-[#2A2A2A]">
            <span>{categoryEmojis[task.category] || "✨"}</span>
            <span>{task.category}</span>
          </span>

          {/* Priority */}
          <span className={`inline-flex items-center text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
              isOverdue() 
                ? "bg-red-950/40 text-red-400 border-red-900/30" 
                : "bg-[#1E1E1E] text-neutral-300 border-[#2A2A2A]"
            }`}>
              {isOverdue() ? (
                <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />
              ) : (
                <Calendar className="h-3 w-3 text-neutral-500" />
              )}
              <span>{task.dueDate}</span>
              {isOverdue() && <span className="text-[9px] font-bold uppercase ml-0.5 text-red-400">Overdue</span>}
            </span>
          )}

          {/* Due Time */}
          {task.dueTime && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border bg-[#1E1E1E] text-neutral-300 border-[#2A2A2A]">
              <Clock className="h-3 w-3 text-violet-400" />
              <span>{task.dueTime}</span>
              {task.alarmEnabled && (
                <span className="flex items-center gap-0.5 ml-1 text-[9px] text-violet-400 font-bold uppercase">
                  <Bell className="h-2.5 w-2.5 text-violet-400 animate-pulse" />
                  <span>Alarm</span>
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
        {!isEditing && !task.completed && (
          <button
            onClick={handleOpenEdit}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-xl hover:bg-red-950/30 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
