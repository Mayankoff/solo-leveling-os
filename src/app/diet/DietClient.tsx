"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Apple, Plus, Droplets, Target, Utensils, Settings2, Pill, CheckCircle2, History, X, Calendar } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { addMeal, addWater, updateMacroSettings, removeMeal, completeDietDay, updateWaterGoal, manualSyncDiet } from "@/actions/diet";
import { addSupplementTemplate, deleteSupplementTemplate, logSupplementIntake } from "@/actions/supplements";
import Link from "next/link";

export default function DietClient({ initialData }: { initialData: any }) {
  const { settings, log, supplementTemplates, supplementIntakes } = initialData;

  const [activeTab, setActiveTab] = useState<"meals" | "hydration" | "supplements">("meals");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [macroSettings, setMacroSettings] = useState({
    calories: settings?.targetCalories || 2000,
    protein: settings?.targetProtein || 150,
    carbs: settings?.targetCarbs || 250,
    fat: settings?.targetFat || 70,
    water: settings?.targetWater || 3000,
  });

  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({ type: "Breakfast", name: "", calories: 0, protein: 0, carbs: 0, fat: 0 });

  const [customWaterModal, setCustomWaterModal] = useState(false);
  const [customWater, setCustomWater] = useState({ amount: 0, unit: "ml" });

  const [wizardOpen, setWizardOpen] = useState(false);
  const [newSupp, setNewSupp] = useState({ name: "", category: "Vitamin", dosage: 1, unit: "pill", frequency: "Daily", preferredTime: "Morning" });

  const todayLog = log || { consumedCalories: 0, protein: 0, carbs: 0, fat: 0, waterIntake: 0, targetWater: 3000, meals: [] };
  
  const remaining = macroSettings.calories - todayLog.consumedCalories;
  const proteinProgress = Math.min((todayLog.protein / macroSettings.protein) * 100, 100) || 0;
  const carbsProgress = Math.min((todayLog.carbs / macroSettings.carbs) * 100, 100) || 0;
  const fatProgress = Math.min((todayLog.fat / macroSettings.fat) * 100, 100) || 0;

  const waterTargetL = macroSettings.water / 1000;
  const waterConsumedL = todayLog.waterIntake / 1000;
  const waterRemainingL = Math.max(0, waterTargetL - waterConsumedL);
  const waterProgress = Math.min((todayLog.waterIntake / macroSettings.water) * 100, 100) || 0;

  const getHydrationMessage = () => {
    if (waterProgress < 30) return "HYDRATION CRITICAL";
    if (waterProgress < 70) return "HYDRATION STABLE";
    if (waterProgress < 100) return `MAINTENANCE: ${waterRemainingL.toFixed(1)} L REMAINING`;
    return "OPTIMAL HYDRATION REACHED";
  };

  const dailySupplements = supplementTemplates.filter((s:any) => s.frequency === "Daily");
  const takenCount = supplementIntakes.filter((i:any) => i.status === "completed").length;
  const suppProgress = dailySupplements.length > 0 ? (takenCount / dailySupplements.length) * 100 : 0;

  const handleCompleteDay = async () => {
    await completeDietDay();
    toast.success("Diet day completed! +15 XP");
  };

  const handleManualSync = async () => {
    await manualSyncDiet(log.id);
    toast.success("Pushed to Calendar");
  };

  const handleSaveSettings = async () => {
    await updateMacroSettings(macroSettings);
    await updateWaterGoal(macroSettings.water);
    setIsSettingsOpen(false);
    toast.success("Goals updated!");
  };

  const handleAddMeal = async () => {
    if (!newMeal.name || newMeal.calories <= 0) return toast.error("Valid name and calories required!");
    await addMeal(newMeal);
    setIsAddMealOpen(false);
    setNewMeal({ type: "Breakfast", name: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
    toast.success("Meal logged!");
  };

  const handleRemoveMeal = async (mealId: string) => {
    if (todayLog.id) {
      await removeMeal(mealId, todayLog.id);
      toast.success("Meal removed!");
    }
  };

  const handleAddWater = async (amountMl: number) => {
    await addWater(amountMl);
    setCustomWaterModal(false);
    toast.success(`Logged ${amountMl} ml of water!`);
  };

  const handleCustomWaterAdd = () => {
    const ml = customWater.unit === "L" ? customWater.amount * 1000 : customWater.amount;
    if (ml <= 0) return toast.error("Invalid amount");
    handleAddWater(ml);
  };

  const handleSaveSupplement = async () => {
    if (!newSupp.name) return toast.error("Name required");
    await addSupplementTemplate(newSupp);
    setWizardOpen(false);
    setNewSupp({ name: "", category: "Vitamin", dosage: 1, unit: "pill", frequency: "Daily", preferredTime: "Morning" });
    toast.success("Supplement added!");
  };

  const handleToggleSupplement = async (templateId: string, isTaken: boolean) => {
    await logSupplementIntake(templateId, isTaken ? "missed" : "completed");
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-mono">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#22c55e]/20">
        <div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#22c55e] text-sm uppercase tracking-[0.3em] font-bold mb-2 system-text-glow"
          >
            VIT Module
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight flex items-center gap-3"
          >
            <div className="p-2 border border-[#22c55e]/30 text-[#22c55e] shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]">
              <Apple className="w-8 h-8" />
            </div>
            Vitality & Diet
          </motion.h1>
        </div>
        
        <div className="flex gap-4">
          <Link href="/diet/history" className="system-button flex items-center gap-2 text-xs border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <History className="w-4 h-4" /> Data Logs
          </Link>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="system-button flex items-center gap-2 text-xs border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/10 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            <Settings2 className="w-4 h-4" /> Targets
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="system-window w-full max-w-md shadow-2xl relative border-[#00e5ff]/50">
            <h2 className="text-xl font-black text-[#00e5ff] uppercase tracking-widest mb-6 system-text-glow border-b border-[#00e5ff]/20 pb-4">Initialize Targets</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#00e5ff] uppercase tracking-widest block mb-1">Energy (kcal)</label>
                <input type="number" value={macroSettings.calories} onChange={e => setMacroSettings({...macroSettings, calories: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-none px-4 py-2 text-white outline-none focus:border-[#00e5ff] transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-[#ef4444] uppercase tracking-widest block mb-1">Protein (g)</label>
                  <input type="number" value={macroSettings.protein} onChange={e => setMacroSettings({...macroSettings, protein: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-none px-4 py-2 text-white outline-none focus:border-[#ef4444] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-[#3b82f6] uppercase tracking-widest block mb-1">Carbs (g)</label>
                  <input type="number" value={macroSettings.carbs} onChange={e => setMacroSettings({...macroSettings, carbs: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-none px-4 py-2 text-white outline-none focus:border-[#3b82f6] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-[#eab308] uppercase tracking-widest block mb-1">Fat (g)</label>
                  <input type="number" value={macroSettings.fat} onChange={e => setMacroSettings({...macroSettings, fat: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-none px-4 py-2 text-white outline-none focus:border-[#eab308] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#22c55e] uppercase tracking-widest block mb-1">Hydration (mL)</label>
                <input type="number" value={macroSettings.water} onChange={e => setMacroSettings({...macroSettings, water: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-none px-4 py-2 text-white outline-none focus:border-[#22c55e] transition-colors" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="system-button border-neutral-600 text-neutral-400">Abort</button>
              <button onClick={handleSaveSettings} className="system-button border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]">Lock In</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Water Modal */}
      {customWaterModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="system-window w-full max-w-sm border-[#3b82f6]/50">
            <h3 className="text-lg font-black text-[#3b82f6] uppercase tracking-widest mb-6 system-text-glow border-b border-[#3b82f6]/20 pb-4">Manual Override</h3>
            <div className="flex gap-4 mb-6">
              <input type="number" value={customWater.amount} onChange={e => setCustomWater({...customWater, amount: +e.target.value})} className="w-2/3 bg-[#050505] border border-neutral-800 px-4 py-2 text-white outline-none focus:border-[#3b82f6] transition-colors" />
              <select value={customWater.unit} onChange={e => setCustomWater({...customWater, unit: e.target.value})} className="w-1/3 bg-[#050505] border border-neutral-800 px-2 py-2 text-white outline-none focus:border-[#3b82f6] transition-colors uppercase">
                <option value="ml">ml</option>
                <option value="L">L</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <button onClick={() => setCustomWaterModal(false)} className="system-button border-neutral-600 text-neutral-400">Abort</button>
              <button onClick={handleCustomWaterAdd} className="system-button border-[#3b82f6] text-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.2)]">Execute</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-800 pb-px uppercase tracking-widest text-sm font-bold">
        {[
          { id: "meals", label: "Fuel & Macros", icon: Utensils, color: "text-[#22c55e]", border: "border-[#22c55e]" },
          { id: "hydration", label: "Hydration", icon: Droplets, color: "text-[#3b82f6]", border: "border-[#3b82f6]" },
          { id: "supplements", label: "Augments", icon: Pill, color: "text-[#a855f7]", border: "border-[#a855f7]" }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={clsx("pb-4 px-4 transition-colors border-b-2 flex items-center gap-2", activeTab === t.id ? `${t.color} ${t.border} system-text-glow` : "text-neutral-500 border-transparent hover:text-neutral-300")}
          >
            <t.icon className="w-4 h-4" /> <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Meals */}
      {activeTab === "meals" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <section className="system-window flex flex-col md:flex-row items-center gap-8 border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-colors">
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-900" />
                <motion.circle
                  initial={{ strokeDashoffset: 527 }}
                  animate={{ strokeDashoffset: Math.max(0, 527 - (527 * (todayLog.consumedCalories / macroSettings.calories))) }}
                  transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                  cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="527"
                  className={remaining < 0 ? "text-[#ef4444]" : "text-[#22c55e]"} strokeLinecap="square"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={clsx("text-4xl font-black system-text-glow", remaining < 0 ? "text-[#ef4444]" : "text-[#22c55e]")}>{Math.max(0, remaining)}</span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{remaining < 0 ? 'kcal over' : 'kcal remaining'}</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-4">
                {[
                  { name: "Protein", current: todayLog.protein, target: macroSettings.protein, progress: proteinProgress, color: "bg-[#ef4444]", shadow: "shadow-[0_0_10px_#ef4444]" },
                  { name: "Carbs", current: todayLog.carbs, target: macroSettings.carbs, progress: carbsProgress, color: "bg-[#3b82f6]", shadow: "shadow-[0_0_10px_#3b82f6]" },
                  { name: "Fat", current: todayLog.fat, target: macroSettings.fat, progress: fatProgress, color: "bg-[#eab308]", shadow: "shadow-[0_0_10px_#eab308]" },
                ].map((macro) => (
                  <div key={macro.name}>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span className="text-neutral-300">{macro.name}</span>
                      <span className="text-neutral-500">{Math.round(macro.current)} / {macro.target}g</span>
                    </div>
                    <div className="h-1 bg-neutral-900 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${macro.progress}%` }}
                        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                        className={clsx("h-full", macro.color, macro.shadow)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="system-window">
            <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Fuel Intake Logs</h2>
              <button onClick={() => setIsAddMealOpen(!isAddMealOpen)} className="system-button border-[#22c55e] text-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.2)] flex items-center gap-2">
                <Plus className="w-4 h-4" /> Inject Fuel
              </button>
            </div>

            {isAddMealOpen && (
              <div className="mb-6 p-6 bg-[#050505] border border-[#22c55e]/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.05)] space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select value={newMeal.type} onChange={e => setNewMeal({...newMeal, type: e.target.value})} className="sm:w-1/3 bg-[#050505] border border-neutral-800 px-3 py-2 text-xs uppercase tracking-widest text-white outline-none focus:border-[#22c55e] transition-colors">
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                  <input type="text" placeholder="Designation" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} className="flex-1 bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e] transition-colors uppercase tracking-wider" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Energy (kcal)</label>
                    <input type="number" value={newMeal.calories || ''} onChange={e => setNewMeal({...newMeal, calories: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#ef4444] font-bold uppercase tracking-widest block mb-1">PRO (g)</label>
                    <input type="number" value={newMeal.protein || ''} onChange={e => setNewMeal({...newMeal, protein: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#3b82f6] font-bold uppercase tracking-widest block mb-1">CARB (g)</label>
                    <input type="number" value={newMeal.carbs || ''} onChange={e => setNewMeal({...newMeal, carbs: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#eab308] font-bold uppercase tracking-widest block mb-1">FAT (g)</label>
                    <input type="number" value={newMeal.fat || ''} onChange={e => setNewMeal({...newMeal, fat: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#eab308] transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#22c55e]/20">
                  <button onClick={() => setIsAddMealOpen(false)} className="system-button border-neutral-600 text-neutral-400">Abort</button>
                  <button onClick={handleAddMeal} className="system-button border-[#22c55e] text-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.2)]">Execute</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {todayLog.meals?.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 bg-[#050505] text-[10px] uppercase tracking-widest font-bold">No fuel entries logged.</div>
              ) : (
                todayLog.meals?.map((meal: any) => (
                  <div key={meal.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#050505] border border-neutral-800 hover:border-[#22c55e]/50 transition-colors">
                    <div className="mb-2 sm:mb-0 flex gap-4 items-center">
                      <div className="w-1 h-8 bg-[#22c55e]" />
                      <div>
                        <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest block">{meal.type}</span>
                        <p className="text-white font-bold uppercase tracking-wider">{meal.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-black text-white">{meal.calories} <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">kcal</span></p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex gap-2">
                          <span className="text-[#ef4444]">P:{meal.protein}</span> 
                          <span className="text-[#3b82f6]">C:{meal.carbs}</span> 
                          <span className="text-[#eab308]">F:{meal.fat}</span>
                        </p>
                      </div>
                      <button onClick={() => handleRemoveMeal(meal.id)} className="text-[#ef4444] hover:bg-[#ef4444]/10 border border-transparent hover:border-[#ef4444]/30 opacity-0 group-hover:opacity-100 transition-all p-2">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {todayLog.meals?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end gap-3">
                <button onClick={handleManualSync} className="system-button border-[#00e5ff] text-[#00e5ff] flex items-center gap-2 hover:bg-[#00e5ff]/10">
                  <Calendar className="w-4 h-4" /> Sync Logs
                </button>
                <button onClick={handleCompleteDay} className="system-button border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 shadow-[0_0_10px_rgba(34,197,94,0.2)] bg-[#22c55e]/5">
                  Conclude Daily Report (+15 XP)
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab: Hydration */}
      {activeTab === "hydration" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="system-window flex flex-col items-center justify-center text-center border-[#3b82f6]/20">
              <div className="relative w-56 h-56 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <circle cx="112" cy="112" r="98" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-900" />
                  <motion.circle
                    initial={{ strokeDashoffset: 615 }}
                    animate={{ strokeDashoffset: Math.max(0, 615 - (615 * (waterProgress / 100))) }}
                    transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
                    cx="112" cy="112" r="98" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="615"
                    className="text-[#3b82f6]" strokeLinecap="square"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white system-text-glow text-[#3b82f6]">{waterConsumedL.toFixed(1)}</span>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest border-t border-neutral-800 pt-1 mt-1">/ {waterTargetL.toFixed(1)} L</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">{Math.round(waterProgress)}% Capacity</h3>
              <p className={clsx("text-xs font-bold uppercase tracking-widest px-3 py-1 border", 
                waterProgress < 30 ? "text-[#ef4444] border-[#ef4444]/50 bg-[#ef4444]/10" : 
                waterProgress < 100 ? "text-[#3b82f6] border-[#3b82f6]/50 bg-[#3b82f6]/10" : 
                "text-[#22c55e] border-[#22c55e]/50 bg-[#22c55e]/10 system-text-glow"
              )}>{getHydrationMessage()}</p>
            </div>

            <div className="system-window flex flex-col justify-center">
              <h3 className="text-xs font-bold text-[#3b82f6] uppercase tracking-widest mb-6 system-text-glow border-b border-[#3b82f6]/20 pb-2">Quick Access Ports</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => handleAddWater(500)} className="p-6 bg-[#050505] border border-neutral-800 hover:border-[#3b82f6] flex flex-col items-center gap-3 transition-all group shadow-[0_0_0_rgba(59,130,246,0)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Droplets className="w-8 h-8 text-[#3b82f6] opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="font-bold text-white uppercase tracking-wider text-sm">+500 ml</span>
                </button>
                <button onClick={() => handleAddWater(1000)} className="p-6 bg-[#050505] border border-neutral-800 hover:border-[#3b82f6] flex flex-col items-center gap-3 transition-all group shadow-[0_0_0_rgba(59,130,246,0)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Droplets className="w-8 h-8 text-[#3b82f6] opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_#3b82f6] transition-all" />
                  <span className="font-bold text-white uppercase tracking-wider text-sm">+1.0 L</span>
                </button>
                <button onClick={() => setCustomWaterModal(true)} className="sm:col-span-2 p-4 bg-[#050505] border border-dashed border-neutral-800 hover:border-[#3b82f6]/50 flex items-center justify-center gap-2 transition-all group">
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-[#3b82f6]" />
                  <span className="font-bold text-neutral-500 uppercase tracking-widest text-xs group-hover:text-[#3b82f6]">Manual Override</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab: Supplements */}
      {activeTab === "supplements" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {supplementTemplates.length === 0 && !wizardOpen ? (
            <div className="system-window text-center py-12">
              <Pill className="w-12 h-12 text-[#a855f7]/50 mx-auto mb-4" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Augment Tracking</h2>
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-8 max-w-md mx-auto">No augments configured. Establish protocol to track adherence.</p>
              <button onClick={() => setWizardOpen(true)} className="system-button border-[#a855f7] text-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:bg-[#a855f7]/10">
                Initialize Augments
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="system-window">
                  <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Current Stack</h2>
                    <button onClick={() => setWizardOpen(true)} className="system-button border-[#a855f7] text-[#a855f7] text-xs flex items-center gap-2">
                      <Plus className="w-3 h-3" /> Add New
                    </button>
                  </div>

                  {wizardOpen && (
                    <div className="mb-8 p-6 bg-[#050505] border border-[#a855f7]/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)] space-y-6">
                      <h3 className="font-bold text-[#a855f7] uppercase tracking-widest border-b border-[#a855f7]/20 pb-2 system-text-glow text-xs">Configure Augment</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Designation</label>
                          <input type="text" placeholder="e.g. Creatine" value={newSupp.name} onChange={e => setNewSupp({...newSupp, name: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#a855f7] transition-colors uppercase tracking-wider" />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Class</label>
                          <select value={newSupp.category} onChange={e => setNewSupp({...newSupp, category: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#a855f7] transition-colors">
                            <option>Vitamin</option><option>Mineral</option><option>Protein</option><option>Performance</option><option>Recovery</option><option>General Health</option>
                          </select>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Payload</label>
                            <input type="number" value={newSupp.dosage} onChange={e => setNewSupp({...newSupp, dosage: +e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#a855f7] transition-colors" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Unit</label>
                            <input type="text" placeholder="g, mg, IU" value={newSupp.unit} onChange={e => setNewSupp({...newSupp, unit: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#a855f7] transition-colors" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Deployment Window</label>
                          <select value={newSupp.preferredTime} onChange={e => setNewSupp({...newSupp, preferredTime: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#a855f7] transition-colors">
                            <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Pre Workout</option><option>Post Workout</option><option>Before Bed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-[#a855f7]/20">
                        <button onClick={() => setWizardOpen(false)} className="system-button border-neutral-600 text-neutral-400">Abort</button>
                        <button onClick={handleSaveSupplement} className="system-button border-[#a855f7] text-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.2)]">Lock In</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {dailySupplements.map((supp: any) => {
                      const isTaken = supplementIntakes.some((i:any) => i.supplementId === supp.id && i.status === "completed");
                      return (
                        <div key={supp.id} onClick={() => handleToggleSupplement(supp.id, isTaken)} className={clsx("flex items-center justify-between p-4 bg-[#050505] border cursor-pointer transition-all group", isTaken ? "border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-neutral-800 hover:border-[#a855f7]/50")}>
                          <div className="flex items-center gap-4">
                            <div className={clsx("w-6 h-6 flex items-center justify-center border transition-colors", isTaken ? "bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "border-neutral-600 group-hover:border-[#a855f7]/50")}>
                              {isTaken ? <div className="w-3 h-3 bg-[#a855f7]" /> : null}
                            </div>
                            <div>
                              <p className={clsx("font-bold uppercase tracking-wider", isTaken ? "text-[#a855f7] system-text-glow" : "text-white")}>{supp.name} <span className="font-bold text-[10px] text-neutral-500 ml-2 tracking-widest">{supp.dosage}{supp.unit}</span></p>
                              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{supp.preferredTime} • {supp.category}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              <div className="system-window h-fit border-[#a855f7]/20">
                <h3 className="text-xs font-bold text-[#a855f7] uppercase tracking-widest mb-6 system-text-glow border-b border-[#a855f7]/20 pb-2">Status</h3>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-900" />
                      <motion.circle
                        initial={{ strokeDashoffset: 352 }}
                        animate={{ strokeDashoffset: Math.max(0, 352 - (352 * (suppProgress / 100))) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="352"
                        className="text-[#a855f7]" strokeLinecap="square"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white system-text-glow text-[#a855f7]">{takenCount}</span>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest border-t border-neutral-800 pt-1 mt-1">/ {dailySupplements.length}</span>
                    </div>
                  </div>
                  <p className="text-neutral-300 text-sm font-black uppercase tracking-wider mb-2">Augments Deployed</p>
                  <p className={clsx("text-[10px] font-bold uppercase tracking-widest px-2 py-1 border", suppProgress === 100 ? "text-[#22c55e] border-[#22c55e]/50 bg-[#22c55e]/10 system-text-glow" : "text-neutral-500 border-neutral-800 bg-neutral-900")}>
                    {suppProgress === 100 ? "Sequence Complete" : "Pending Action"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

    </div>
  );
}
