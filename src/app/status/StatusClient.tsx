"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { allocateStatPoints } from "@/actions/status";
import { toast } from "sonner";
import { Shield, Swords, Brain, Heart, Sparkles, User, Minus, Plus } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import clsx from "clsx";

export default function StatusClient({ initialStatus }: { initialStatus: any }) {
  const [status, setStatus] = useState(initialStatus);
  const [allocations, setAllocations] = useState({
    str: 0,
    int: 0,
    vit: 0,
    cha: 0,
    agi: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const pointsRemaining = status.statPoints - totalAllocated;

  const STAT_CONFIG = [
    { key: "str", label: "Strength", icon: Swords, color: "text-red-500", desc: "Physical power. Grows via Workouts." },
    { key: "agi", label: "Agility", icon: Shield, color: "text-blue-500", desc: "Speed & reflexes. Grows via cardio." },
    { key: "int", label: "Intelligence", icon: Brain, color: "text-purple-500", desc: "Mental capacity. Grows via Study." },
    { key: "vit", label: "Vitality", icon: Heart, color: "text-green-500", desc: "Health & stamina. Grows via Diet." },
    { key: "cha", label: "Charm", icon: Sparkles, color: "text-yellow-500", desc: "Aura & glow. Grows via Skincare." },
  ];

  const handleAllocate = (key: keyof typeof allocations, amount: number) => {
    setAllocations(prev => {
      const currentVal = prev[key];
      const newVal = currentVal + amount;
      
      // Validation
      if (newVal < 0) return prev;
      if (amount > 0 && pointsRemaining <= 0) return prev;
      
      return { ...prev, [key]: newVal };
    });
  };

  const handleConfirm = async () => {
    if (totalAllocated === 0) return;
    setIsSaving(true);
    try {
      const res = await allocateStatPoints(allocations);
      if (res?.success) {
        toast.success("Stat points allocated successfully!");
        // Update local state to reflect new baseline
        setStatus((prev: any) => ({
          ...prev,
          str: prev.str + allocations.str,
          int: prev.int + allocations.int,
          vit: prev.vit + allocations.vit,
          cha: prev.cha + allocations.cha,
          agi: prev.agi + allocations.agi,
          statPoints: prev.statPoints - totalAllocated
        }));
        setAllocations({ str: 0, int: 0, vit: 0, cha: 0, agi: 0 });
      } else {
        toast.error(res?.error || "Failed to allocate stats.");
      }
    } catch (e) {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = [
    { subject: "STR", A: status.str + allocations.str, fullMark: 100 },
    { subject: "AGI", A: status.agi + allocations.agi, fullMark: 100 },
    { subject: "INT", A: status.int + allocations.int, fullMark: 100 },
    { subject: "VIT", A: status.vit + allocations.vit, fullMark: 100 },
    { subject: "CHA", A: status.cha + allocations.cha, fullMark: 100 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-white uppercase tracking-widest flex items-center gap-3"
        >
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <User className="w-8 h-8" />
          </div>
          Status Window
        </motion.h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Radar & Level summary */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm uppercase tracking-widest font-bold">Player Level</p>
                <p className="text-6xl font-black text-white mt-1">{status.level}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-400 text-sm uppercase tracking-widest font-bold">Total XP</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{status.xp}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 14, fontWeight: "bold" }} />
                <Radar
                  name="Stats"
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Right Col: Stats Allocator */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
            <div>
              <h2 className="text-2xl font-bold text-white">Attributes</h2>
              <p className="text-neutral-400 text-sm mt-1">Shape your destiny by allocating points.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Available Points</p>
              <div className={clsx(
                "inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 font-black text-2xl transition-colors",
                pointsRemaining > 0 ? "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-neutral-950 text-neutral-600 border-neutral-800"
              )}>
                {pointsRemaining}
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {STAT_CONFIG.map(stat => {
              const baseValue = status[stat.key as keyof typeof status] as number;
              const allocatedValue = allocations[stat.key as keyof typeof allocations];
              const totalValue = baseValue + allocatedValue;

              return (
                <div key={stat.key} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between group hover:border-neutral-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={clsx("p-3 rounded-lg bg-neutral-900 border border-neutral-800", stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{stat.label}</h3>
                      <p className="text-neutral-500 text-xs hidden sm:block">{stat.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right w-12">
                      <p className="text-2xl font-black text-white">
                        {totalValue}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleAllocate(stat.key as any, 1)}
                        disabled={pointsRemaining <= 0}
                        className="w-8 h-8 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAllocate(stat.key as any, -1)}
                        disabled={allocatedValue <= 0}
                        className="w-8 h-8 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800">
            <button 
              onClick={handleConfirm}
              disabled={totalAllocated === 0 || isSaving}
              className={clsx(
                "w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all",
                totalAllocated > 0 
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              )}
            >
              {isSaving ? "Allocating..." : "Confirm Allocation"}
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
