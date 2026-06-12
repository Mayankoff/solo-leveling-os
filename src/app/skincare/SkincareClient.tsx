"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, CheckCircle2, Circle, Plus, Camera, Calendar } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { addRoutineStep, removeRoutineStep, toggleStep, completeRoutine, addConditionLog, manualSyncSkincare } from "@/actions/skincare";

export default function SkincareClient({ initialData }: { initialData: any }) {
  const { steps, morningLog, eveningLog, conditions } = initialData;

  const morningSteps = steps.filter((s: any) => s.routineType === "morning");
  const eveningSteps = steps.filter((s: any) => s.routineType === "evening");

  const morningCompletedIds = JSON.parse(morningLog?.completedSteps || "[]");
  const eveningCompletedIds = JSON.parse(eveningLog?.completedSteps || "[]");

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newStepName, setNewStepName] = useState("");

  const [journeyNote, setJourneyNote] = useState("");
  const [journeyPhoto, setJourneyPhoto] = useState("");

  const handleAddStep = async (type: string) => {
    if (!newStepName) return;
    await addRoutineStep(type, newStepName);
    setNewStepName("");
    setAddingTo(null);
    toast.success("Step added!");
  };

  const handleRemoveStep = async (id: string) => {
    await removeRoutineStep(id);
    toast.success("Step removed");
  };

  const handleToggle = async (routineType: string, stepId: string) => {
    await toggleStep(routineType, stepId);
  };

  const handleComplete = async (routineType: string) => {
    await completeRoutine(routineType);
    toast.success(`Complete! +25 XP`);
  };

  const handleManualSync = async (logId: string) => {
    if (!logId) return;
    await manualSyncSkincare(logId);
    toast.success("Pushed to Calendar");
  };

  const handleLogJourney = async () => {
    if (!journeyNote) return toast.error("Notes are required to log journey!");
    await addConditionLog(journeyNote, journeyPhoto);
    setJourneyNote("");
    setJourneyPhoto("");
    toast.success("Skin journey logged! +10 XP");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 font-mono">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#a855f7]/20">
        <div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#a855f7] text-sm uppercase tracking-[0.3em] font-bold mb-2 system-text-glow"
          >
            CHA Module
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight flex items-center gap-3"
          >
            <div className="p-2 border border-[#a855f7]/30 text-[#a855f7] shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-8 h-8" />
            </div>
            Charm & Aura
          </motion.h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Morning Routine */}
        <div className="system-window relative overflow-hidden flex flex-col border-[#eab308]/20 group">
          {morningLog?.status === "completed" && (
            <div className="absolute inset-0 bg-[#eab308]/5 z-0 flex items-center justify-center">
              <p className="text-4xl font-black text-[#eab308]/10 uppercase tracking-widest rotate-[-15deg] system-text-glow">Sequence Done</p>
            </div>
          )}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
            <Sun className="w-48 h-48 text-[#eab308]" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6 relative z-10 border-b border-[#eab308]/20 pb-4">
            <Sun className="w-6 h-6 text-[#eab308] system-text-glow drop-shadow-[0_0_8px_#eab308]" /> Morning Protocol
          </h2>
          
          <div className="space-y-3 relative z-10 flex-1">
            {morningSteps.map((step: any) => {
              const isCompleted = morningCompletedIds.includes(step.id);
              return (
                <div key={step.id} className={clsx("flex items-center gap-3 p-3 bg-[#050505] border transition-all hover:border-[#eab308]/50 group/item", isCompleted ? "border-[#eab308]/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]" : "border-neutral-800")}>
                  <button onClick={() => handleToggle("morning", step.id)} className="flex-1 flex items-center gap-4 text-left">
                    <div className={clsx("w-5 h-5 border flex items-center justify-center transition-colors", isCompleted ? "bg-[#eab308]/20 border-[#eab308]" : "border-neutral-600 group-hover/item:border-[#eab308]/50")}>
                      {isCompleted && <div className="w-2 h-2 bg-[#eab308] shadow-[0_0_5px_#eab308]" />}
                    </div>
                    <span className={clsx("font-bold uppercase tracking-wider text-sm", isCompleted ? "text-[#eab308]" : "text-white")}>{step.name}</span>
                  </button>
                  <button onClick={() => handleRemoveStep(step.id)} className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] opacity-0 group-hover/item:opacity-100 transition-opacity border border-transparent hover:border-[#ef4444]/30 p-1">Abort</button>
                </div>
              );
            })}
            
            {addingTo === "morning" ? (
              <div className="flex gap-2 bg-[#050505] p-3 border border-[#eab308]/30">
                <input autoFocus type="text" placeholder="Protocol Step..." value={newStepName} onChange={e => setNewStepName(e.target.value)} className="flex-1 bg-transparent text-sm text-white outline-none font-mono uppercase tracking-widest" />
                <button onClick={() => handleAddStep("morning")} className="system-button text-[10px] border-[#eab308] text-[#eab308]">Set</button>
                <button onClick={() => setAddingTo(null)} className="system-button text-[10px] border-neutral-600 text-neutral-400">Esc</button>
              </div>
            ) : (
              <button onClick={() => setAddingTo("morning")} className="w-full flex items-center justify-center gap-2 py-4 bg-[#050505] border border-dashed border-neutral-800 text-neutral-500 hover:text-[#eab308] hover:border-[#eab308]/50 transition-colors text-xs font-bold uppercase tracking-widest">
                <Plus className="w-4 h-4" /> Inject Step
              </button>
            )}
          </div>

          {morningLog?.status !== "completed" && (
            <div className="mt-8 pt-6 border-t border-neutral-800 relative z-10 flex gap-3">
              <button onClick={() => handleManualSync(morningLog?.id)} className="system-button border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 px-4">
                <Calendar className="w-4 h-4" />
              </button>
              <button onClick={() => handleComplete("morning")} className="flex-1 system-button border-[#eab308] text-[#eab308] shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:bg-[#eab308]/10">
                Execute Morning (+25 XP)
              </button>
            </div>
          )}
        </div>

        {/* Evening Routine */}
        <div className="system-window relative overflow-hidden flex flex-col border-[#818cf8]/20 group">
          {eveningLog?.status === "completed" && (
            <div className="absolute inset-0 bg-[#818cf8]/5 z-0 flex items-center justify-center">
              <p className="text-4xl font-black text-[#818cf8]/10 uppercase tracking-widest rotate-[-15deg] system-text-glow">Sequence Done</p>
            </div>
          )}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
            <Moon className="w-48 h-48 text-[#818cf8]" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6 relative z-10 border-b border-[#818cf8]/20 pb-4">
            <Moon className="w-6 h-6 text-[#818cf8] system-text-glow drop-shadow-[0_0_8px_#818cf8]" /> Evening Protocol
          </h2>
          
          <div className="space-y-3 relative z-10 flex-1">
            {eveningSteps.map((step: any) => {
              const isCompleted = eveningCompletedIds.includes(step.id);
              return (
                <div key={step.id} className={clsx("flex items-center gap-3 p-3 bg-[#050505] border transition-all hover:border-[#818cf8]/50 group/item", isCompleted ? "border-[#818cf8]/50 shadow-[0_0_10px_rgba(129,140,248,0.1)]" : "border-neutral-800")}>
                  <button onClick={() => handleToggle("evening", step.id)} className="flex-1 flex items-center gap-4 text-left">
                    <div className={clsx("w-5 h-5 border flex items-center justify-center transition-colors", isCompleted ? "bg-[#818cf8]/20 border-[#818cf8]" : "border-neutral-600 group-hover/item:border-[#818cf8]/50")}>
                      {isCompleted && <div className="w-2 h-2 bg-[#818cf8] shadow-[0_0_5px_#818cf8]" />}
                    </div>
                    <span className={clsx("font-bold uppercase tracking-wider text-sm", isCompleted ? "text-[#818cf8]" : "text-white")}>{step.name}</span>
                  </button>
                  <button onClick={() => handleRemoveStep(step.id)} className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] opacity-0 group-hover/item:opacity-100 transition-opacity border border-transparent hover:border-[#ef4444]/30 p-1">Abort</button>
                </div>
              );
            })}
            
            {addingTo === "evening" ? (
              <div className="flex gap-2 bg-[#050505] p-3 border border-[#818cf8]/30">
                <input autoFocus type="text" placeholder="Protocol Step..." value={newStepName} onChange={e => setNewStepName(e.target.value)} className="flex-1 bg-transparent text-sm text-white outline-none font-mono uppercase tracking-widest" />
                <button onClick={() => handleAddStep("evening")} className="system-button text-[10px] border-[#818cf8] text-[#818cf8]">Set</button>
                <button onClick={() => setAddingTo(null)} className="system-button text-[10px] border-neutral-600 text-neutral-400">Esc</button>
              </div>
            ) : (
              <button onClick={() => setAddingTo("evening")} className="w-full flex items-center justify-center gap-2 py-4 bg-[#050505] border border-dashed border-neutral-800 text-neutral-500 hover:text-[#818cf8] hover:border-[#818cf8]/50 transition-colors text-xs font-bold uppercase tracking-widest">
                <Plus className="w-4 h-4" /> Inject Step
              </button>
            )}
          </div>

          {eveningLog?.status !== "completed" && (
            <div className="mt-8 pt-6 border-t border-neutral-800 relative z-10 flex gap-3">
              <button onClick={() => handleManualSync(eveningLog?.id)} className="system-button border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 px-4">
                <Calendar className="w-4 h-4" />
              </button>
              <button onClick={() => handleComplete("evening")} className="flex-1 system-button border-[#818cf8] text-[#818cf8] shadow-[0_0_15px_rgba(129,140,248,0.2)] hover:bg-[#818cf8]/10">
                Execute Evening (+25 XP)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skin Journey */}
      <section className="system-window">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-neutral-800 pb-4">
          <Camera className="w-6 h-6 text-[#a855f7]" /> Aura Log Timeline
        </h2>
        
        <div className="bg-[#050505] border border-neutral-800 p-6 mb-10 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
          <textarea 
            placeholder="Log current aura state, breakouts, or glow..."
            value={journeyNote}
            onChange={e => setJourneyNote(e.target.value)}
            className="w-full bg-transparent text-white outline-none resize-none min-h-[80px] font-mono text-sm uppercase tracking-wider"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-6 border-t border-neutral-800 pt-6">
            <input 
              type="text" 
              placeholder="Visual Data URL..." 
              value={journeyPhoto}
              onChange={e => setJourneyPhoto(e.target.value)}
              className="flex-1 bg-[#050505] border border-neutral-800 px-4 py-2 text-sm text-white outline-none focus:border-[#a855f7] transition-colors uppercase tracking-widest"
            />
            <button onClick={handleLogJourney} className="system-button border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10">
              Submit Log
            </button>
          </div>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#a855f7]/50 before:to-transparent">
          {conditions.length === 0 ? (
            <div className="text-center text-neutral-500 py-8 border border-dashed border-neutral-800 bg-[#050505] text-[10px] uppercase tracking-widest font-bold">No data logs found. Start tracking.</div>
          ) : (
            conditions.map((log: any, i: number) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 border border-[#a855f7] bg-[#050505] text-[#a855f7] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(168,85,247,0.5)] relative z-10">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#050505] border border-[#a855f7]/20 p-6 hover:border-[#a855f7]/50 transition-colors group-hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-2">
                    <div className="font-black text-white uppercase tracking-widest">Aura Log</div>
                    <time className="text-[10px] font-bold text-[#a855f7] uppercase tracking-widest border border-[#a855f7]/30 px-2 py-1 bg-[#a855f7]/10">{new Date(log.date).toLocaleDateString()}</time>
                  </div>
                  <div className="text-neutral-400 text-sm mb-4 uppercase tracking-wider leading-relaxed">{log.notes}</div>
                  {log.photoUrl && (
                    <img src={log.photoUrl} alt="Skin progress" className="max-h-64 w-full object-cover border border-[#a855f7]/20 opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
