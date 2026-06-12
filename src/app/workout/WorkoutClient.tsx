"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Plus, Trash2, Edit3, Settings, Play, CheckCircle2, ChevronDown, Circle, CheckSquare, Square, History, Calendar, SkipForward } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { updateWorkoutPlan, addExerciseToPlan, removeExerciseFromPlan, toggleExerciseCompletion, skipSession, manualSyncWorkout } from "@/actions/workout";
import Link from "next/link";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WorkoutClient({ initialData }: { initialData: any }) {
  const { plans, todayLog } = initialData;
  const todayDayIndex = new Date().getDay();

  const [activeTab, setActiveTab] = useState<"today" | "planner">("today");
  const [selectedDay, setSelectedDay] = useState(todayDayIndex);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [planName, setPlanName] = useState("");

  const [addingExercise, setAddingExercise] = useState(false);
  const [exForm, setExForm] = useState({ name: "", sets: 3, reps: 10, weight: 0, restTime: 90, notes: "" });

  const currentPlan = plans.find((p: any) => p.dayOfWeek === selectedDay);
  const isRestDay = (currentPlan?.name || "").toLowerCase().includes("rest");
  
  const todayIsRest = (todayLog?.type || "").toLowerCase().includes("rest");

  const handleSavePlanName = async () => {
    if (!planName) return;
    await updateWorkoutPlan(selectedDay, planName);
    setIsEditingName(false);
    toast.success("Plan updated!");
  };

  const handleAddExercise = async () => {
    if (!currentPlan) return toast.error("Please set a plan name first!");
    if (!exForm.name) return toast.error("Exercise name is required.");
    
    await addExerciseToPlan(currentPlan.id, exForm);
    setAddingExercise(false);
    setExForm({ name: "", sets: 3, reps: 10, weight: 0, restTime: 90, notes: "" });
    toast.success("Exercise added to template!");
  };

  const handleRemoveExercise = async (id: string) => {
    await removeExerciseFromPlan(id);
    toast.success("Exercise removed");
  };

  const handleToggleExercise = async (id: string, isCompleted: boolean) => {
    await toggleExerciseCompletion(id, !isCompleted);
  };

  const handleSkip = async () => {
    if (!todayLog) return;
    await skipSession(todayLog.id);
    toast.success("Session skipped");
  };

  const handleManualSync = async () => {
    if (!todayLog) return;
    await manualSyncWorkout(todayLog.id);
    toast.success("Pushed to Calendar");
  };

  const getStatusColor = (status: string) => {
    if (status === "Completed") return "text-[#00e5ff] border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]";
    if (status === "In Progress") return "text-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]";
    if (status === "Skipped") return "text-neutral-500 border-neutral-700";
    return "text-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-mono">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ef4444]/20">
        <div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#ef4444] text-sm uppercase tracking-[0.3em] font-bold mb-2 system-text-glow"
          >
            STR Module
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight flex items-center gap-3"
          >
            <div className="p-2 border border-[#ef4444]/30 text-[#ef4444] shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
              <Dumbbell className="w-8 h-8" />
            </div>
            Strength Training
          </motion.h1>
        </div>
        
        <Link href="/workout/history" className="system-button flex items-center gap-2 text-xs border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <History className="w-4 h-4" /> View History
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-800 pb-px uppercase tracking-widest text-sm font-bold">
        <button 
          onClick={() => setActiveTab("today")}
          className={clsx("pb-4 px-4 transition-colors border-b-2", activeTab === "today" ? "text-[#ef4444] border-[#ef4444] system-text-glow" : "text-neutral-500 border-transparent hover:text-[#ef4444]/50")}
        >
          Today's Session
        </button>
        <button 
          onClick={() => setActiveTab("planner")}
          className={clsx("pb-4 px-4 transition-colors border-b-2", activeTab === "planner" ? "text-[#ef4444] border-[#ef4444] system-text-glow" : "text-neutral-500 border-transparent hover:text-[#ef4444]/50")}
        >
          Protocol Template
        </button>
      </div>

      {activeTab === "today" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {!todayLog ? (
            <div className="system-window text-center py-12">
              <Calendar className="w-12 h-12 text-[#ef4444]/50 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2">No Protocol Found</h2>
              <p className="text-neutral-400 mb-6 uppercase text-xs">Awaiting input for today's template.</p>
              <button onClick={() => {setActiveTab("planner"); setSelectedDay(todayDayIndex);}} className="system-button border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Set Protocol</button>
            </div>
          ) : (
            <div className="system-window relative">
              <div className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={clsx("text-[10px] px-2 py-1 font-bold uppercase tracking-widest border", getStatusColor(todayLog.status))}>
                        {todayLog.status}
                      </span>
                      <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest border border-neutral-800 px-2 py-1 bg-neutral-900">
                        {new Date(todayLog.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">{todayLog.type}</h2>
                  </div>

                  <div className="flex flex-col gap-2">
                    {todayLog.status !== "Completed" && todayLog.status !== "Skipped" && !todayIsRest && (
                       <button onClick={handleSkip} className="system-button border-neutral-600 text-neutral-400 flex items-center gap-2 text-[10px]">
                         <SkipForward className="w-3 h-3" /> Skip Session
                       </button>
                    )}
                    <button onClick={handleManualSync} className="system-button flex items-center gap-2 text-[10px] border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/10">
                      <Calendar className="w-3 h-3" /> Sync to Calendar
                    </button>
                  </div>
                </div>

                {todayIsRest ? (
                  <div className="bg-[#050505] border border-green-500/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)] rounded-none p-12 text-center mt-8 relative overflow-hidden">
                    <p className="text-6xl mb-6 relative z-10">🏖️</p>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 relative z-10">Recovery Phase</h3>
                    <p className="text-neutral-500 text-xs uppercase tracking-wider max-w-md mx-auto relative z-10">System optimizing muscles. Standby for next protocol.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayLog.exercises.length === 0 ? (
                      <p className="text-neutral-500 text-center py-8 text-xs uppercase tracking-widest">No exercises initialized.</p>
                    ) : (
                      todayLog.exercises.map((ex: any) => (
                        <div key={ex.id} 
                          onClick={() => handleToggleExercise(ex.id, ex.completed)}
                          className={clsx(
                            "flex items-center justify-between p-4 border transition-all cursor-pointer bg-[#050505] group",
                            ex.completed 
                              ? "border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                              : "border-neutral-800 hover:border-[#ef4444]/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {ex.completed ? (
                              <div className="w-6 h-6 border border-[#ef4444] bg-[#ef4444]/20 flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                                <div className="w-3 h-3 bg-[#ef4444]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 border border-neutral-600 group-hover:border-[#ef4444]/50 transition-colors" />
                            )}
                            <div>
                              <p className={clsx("font-bold text-lg uppercase tracking-wider", ex.completed ? "text-[#ef4444] system-text-glow" : "text-white")}>{ex.name}</p>
                              <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
                                {ex.sets} Sets × {ex.reps} Reps {ex.weight ? `| ${ex.weight}kg` : ''} {ex.restTime ? `| ${ex.restTime}s rest` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "planner" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            {DAYS.map((day, i) => {
              const p = plans.find((pl: any) => pl.dayOfWeek === i);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(i)}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 transition-all font-bold text-xs uppercase tracking-widest border",
                    selectedDay === i 
                      ? "bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                      : "bg-[#050505] border-neutral-800 text-neutral-500 hover:text-[#ef4444] hover:border-[#ef4444]/50"
                  )}
                >
                  {day}
                  {p?.name && <span className="text-[10px] opacity-75 truncate max-w-[80px]">{p.name}</span>}
                </button>
              );
            })}
          </div>

          <div className="md:col-span-3">
            <div className="system-window p-6">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      autoFocus
                      type="text" 
                      value={planName} 
                      onChange={e => setPlanName(e.target.value)}
                      placeholder="e.g. Push Day, Pull Day, Rest"
                      className="flex-1 bg-[#050505] border border-[#ef4444] px-4 py-2 text-white outline-none font-mono uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    />
                    <button onClick={handleSavePlanName} className="system-button border-[#ef4444] text-[#ef4444]">Save</button>
                    <button onClick={() => setIsEditingName(false)} className="system-button border-neutral-600 text-neutral-400">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider system-text-glow">
                      {currentPlan?.name || "No Protocol Set"}
                    </h2>
                    <button onClick={() => { setPlanName(currentPlan?.name || ""); setIsEditingName(true); }} className="text-neutral-500 hover:text-[#ef4444] p-1">
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {!currentPlan ? (
                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 bg-[#050505] uppercase tracking-widest text-xs">
                  <p>Initialize protocol name to proceed.</p>
                </div>
              ) : isRestDay ? (
                <div className="bg-[#050505] border border-neutral-800 p-8 text-center">
                  <h3 className="text-xl font-bold text-neutral-300 mb-2 uppercase tracking-widest">Recovery Protocol</h3>
                  <p className="text-neutral-500 text-xs uppercase tracking-wider">System maintenance scheduled for this cycle.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentPlan.exercises.map((ex: any) => (
                    <div key={ex.id} className="flex items-center justify-between p-4 bg-[#050505] border border-neutral-800 group hover:border-[#ef4444]/50 transition-colors">
                      <div>
                        <p className="font-bold text-white uppercase tracking-wider">{ex.name}</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                          {ex.sets} Sets × {ex.reps} Reps {ex.weight ? `| ${ex.weight}kg` : ''} {ex.restTime ? `| ${ex.restTime}s rest` : ''}
                        </p>
                      </div>
                      <button onClick={() => handleRemoveExercise(ex.id)} className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#ef4444]/10 border border-transparent hover:border-[#ef4444]/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {addingExercise ? (
                    <div className="bg-[#050505] border border-[#ef4444]/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)] p-6 space-y-6 mt-4 relative">
                      <h3 className="text-xs font-bold text-[#ef4444] uppercase tracking-widest mb-4 border-b border-[#ef4444]/20 pb-2 system-text-glow">Initialize New Exercise</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 block">Exercise Designation</label>
                          <input type="text" placeholder="e.g. Bench Press" value={exForm.name} onChange={e => setExForm({...exForm, name: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors uppercase tracking-wider" />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 block">Sets</label>
                            <input type="number" value={exForm.sets} onChange={e => setExForm({...exForm, sets: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 block">Reps</label>
                            <input type="number" value={exForm.reps} onChange={e => setExForm({...exForm, reps: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 block">Weight (kg)</label>
                            <input type="number" value={exForm.weight} onChange={e => setExForm({...exForm, weight: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 block">Rest (sec)</label>
                            <input type="number" value={exForm.restTime} onChange={e => setExForm({...exForm, restTime: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 block">Logs / Intel</label>
                          <input type="text" placeholder="Form cues..." value={exForm.notes} onChange={e => setExForm({...exForm, notes: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors uppercase tracking-wider" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-6 border-t border-[#ef4444]/20">
                        <button onClick={() => setAddingExercise(false)} className="system-button border-neutral-600 text-neutral-400">Abort</button>
                        <button onClick={handleAddExercise} className="system-button border-[#ef4444] text-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]">Execute</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingExercise(true)}
                      className="w-full py-4 bg-[#050505] border border-dashed border-neutral-800 text-neutral-500 hover:text-[#ef4444] hover:border-[#ef4444]/50 flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs font-bold"
                    >
                      <Plus className="w-4 h-4" /> Inject Exercise
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
