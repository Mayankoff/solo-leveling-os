"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { addStudyTask, completeStudyTask, deleteStudyTask, logStudySession } from "@/actions/study";

export default function StudyClient({ initialData }: { initialData: any }) {
  const { tasks, sessions } = initialData;

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ subject: "", title: "", description: "", priority: "medium", deadline: "" });

  const [sessionDuration, setSessionDuration] = useState(30);
  const [sessionSubject, setSessionSubject] = useState("");

  const pendingTasks = tasks.filter((t: any) => t.status === "pending");
  const completedTasks = tasks.filter((t: any) => t.status === "completed");

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.subject) return toast.error("Title and subject are required!");
    await addStudyTask(newTask);
    setIsAddingTask(false);
    setNewTask({ subject: "", title: "", description: "", priority: "medium", deadline: "" });
    toast.success("Task added!");
  };

  const handleCompleteTask = async (id: string) => {
    await completeStudyTask(id);
    toast.success("Task completed! XP earned!");
  };

  const handleDeleteTask = async (id: string) => {
    await deleteStudyTask(id);
    toast.success("Task deleted");
  };

  const handleLogSession = async () => {
    if (!sessionSubject || sessionDuration <= 0) return toast.error("Subject and duration are required!");
    await logStudySession({ subject: sessionSubject, topic: "General", duration: sessionDuration });
    setSessionSubject("");
    toast.success(`Logged ${sessionDuration} min session! +20 XP`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/50";
      case "medium": return "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/50";
      case "high": return "text-[#eab308] bg-[#eab308]/10 border-[#eab308]/50";
      case "critical": return "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/50 system-text-glow";
      default: return "text-neutral-400 bg-neutral-900 border-neutral-700";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-mono">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3b82f6]/20">
        <div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#3b82f6] text-sm uppercase tracking-[0.3em] font-bold mb-2 system-text-glow"
          >
            INT Module
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight flex items-center gap-3"
          >
            <div className="p-2 border border-[#3b82f6]/30 text-[#3b82f6] shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
              <BookOpen className="w-8 h-8" />
            </div>
            Intelligence
          </motion.h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="system-window">
            <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Active Objectives</h2>
              <button onClick={() => setIsAddingTask(!isAddingTask)} className="system-button border-[#3b82f6] text-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.2)] flex items-center gap-2">
                <Plus className="w-4 h-4" /> Inject Objective
              </button>
            </div>

            {isAddingTask && (
              <div className="mb-8 p-6 bg-[#050505] border border-[#3b82f6]/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)] space-y-6">
                <h3 className="font-bold text-[#3b82f6] uppercase tracking-widest border-b border-[#3b82f6]/20 pb-2 system-text-glow text-xs">Configure Objective</h3>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <input type="text" placeholder="Category/Subject" value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})} className="sm:w-1/3 bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors uppercase tracking-widest" />
                  <input type="text" placeholder="Objective Designation" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="flex-1 bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors uppercase tracking-wider" />
                </div>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="sm:w-1/4 bg-[#050505] border border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#3b82f6] transition-colors">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Threat</option>
                  </select>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="sm:w-1/3 bg-[#050505] border border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#3b82f6] transition-colors" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#3b82f6]/20">
                  <button onClick={() => setIsAddingTask(false)} className="system-button border-neutral-600 text-neutral-400">Abort</button>
                  <button onClick={handleAddTask} className="system-button border-[#3b82f6] text-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.2)]">Execute</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 bg-[#050505] text-[10px] uppercase tracking-widest font-bold">No active objectives.</div>
              ) : (
                pendingTasks.map((task: any) => (
                  <div key={task.id} className="group flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-[#050505] border border-neutral-800 hover:border-[#3b82f6]/50 transition-colors">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={clsx("text-[10px] px-2 py-0.5 border font-bold uppercase tracking-widest", getPriorityColor(task.priority))}>{task.priority}</span>
                        <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest">{task.subject}</span>
                      </div>
                      <p className="text-white font-bold uppercase tracking-wider">{task.title}</p>
                      {task.deadline && (
                        <p className={clsx("text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 mt-3", new Date(task.deadline) < new Date() ? "text-[#ef4444] system-text-glow" : "text-neutral-500")}>
                          <Calendar className="w-3 h-3" /> Due {new Date(task.deadline).toLocaleDateString()}
                          {new Date(task.deadline) < new Date() && <AlertCircle className="w-3 h-3 ml-1" />}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 justify-between w-full sm:w-auto border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0">
                      <button onClick={() => handleCompleteTask(task.id)} className="system-button border-neutral-600 text-neutral-400 flex items-center gap-2 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all">
                        <CheckCircle2 className="w-4 h-4" /> Clear
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-[10px] uppercase tracking-widest font-bold text-[#ef4444] opacity-0 group-hover:opacity-100 hover:bg-[#ef4444]/10 p-1 border border-transparent hover:border-[#ef4444]/30 transition-all">Abort Objective</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="system-window opacity-50 hover:opacity-100 transition-opacity bg-transparent border-neutral-800/50">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Cleared Objectives ({completedTasks.length})</h2>
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className="flex items-center gap-4 p-3 bg-[#050505] border border-neutral-900">
                  <CheckCircle2 className="w-4 h-4 text-neutral-700" />
                  <span className="text-neutral-600 line-through font-bold text-[10px] uppercase tracking-widest">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sessions */}
        <div className="space-y-6">
          <div className="system-window border-[#3b82f6]/20">
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-neutral-800 pb-4">Log Intel</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Subject Field</label>
                <input type="text" placeholder="e.g. Mathematics" value={sessionSubject} onChange={e => setSessionSubject(e.target.value)} className="w-full bg-[#050505] border border-neutral-800 px-4 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors uppercase tracking-wider" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Duration (minutes)</label>
                <input type="number" value={sessionDuration} onChange={e => setSessionDuration(+e.target.value)} className="w-full bg-[#050505] border border-neutral-800 px-4 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors" />
              </div>
              <button onClick={handleLogSession} className="w-full py-4 bg-[#3b82f6]/10 border border-[#3b82f6] text-[#3b82f6] font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:bg-[#3b82f6]/20 mt-4">
                Store Intel (+20 XP)
              </button>
            </div>
          </div>

          <div className="system-window border-neutral-800">
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Clock className="w-4 h-4 text-[#3b82f6]" /> Recent Logs
            </h2>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">No intel gathered.</div>
              ) : (
                sessions.map((s: any) => (
                  <div key={s.id} className="p-3 bg-[#050505] border border-neutral-800 hover:border-[#3b82f6]/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-neutral-300 text-xs uppercase tracking-wider">{s.subject}</span>
                      <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest">{s.duration} min</span>
                    </div>
                    <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
