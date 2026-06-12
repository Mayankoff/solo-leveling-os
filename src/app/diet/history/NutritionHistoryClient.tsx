"use client";

import { motion } from "framer-motion";
import { ArrowLeft, History, Droplets, Utensils, Pill, Trophy, Target } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function NutritionHistoryClient({ dietLogs, suppLogs }: { dietLogs: any[], suppLogs: any[] }) {
  // Analytics Math
  const totalDietDays = dietLogs.length;
  
  const avgCals = totalDietDays ? Math.round(dietLogs.reduce((acc, log) => acc + log.consumedCalories, 0) / totalDietDays) : 0;
  const avgPro = totalDietDays ? Math.round(dietLogs.reduce((acc, log) => acc + log.protein, 0) / totalDietDays) : 0;
  
  const avgWaterMl = totalDietDays ? dietLogs.reduce((acc, log) => acc + log.waterIntake, 0) / totalDietDays : 0;
  const avgWaterL = (avgWaterMl / 1000).toFixed(1);

  const waterGoalsHit = dietLogs.filter(log => log.waterIntake >= log.targetWater).length;
  const waterRate = totalDietDays ? Math.round((waterGoalsHit / totalDietDays) * 100) : 0;

  const totalSupps = suppLogs.length;
  const takenSupps = suppLogs.filter(s => s.status === "completed").length;
  const suppRate = totalSupps ? Math.round((takenSupps / totalSupps) * 100) : 0;

  // Group by Date for the Feed
  const feedMap = new Map<string, { dateStr: string, timeZone: string, meals: any[], water: any, supps: any[] }>();

  dietLogs.forEach(log => {
    const d = new Date(log.date).toISOString().split('T')[0];
    feedMap.set(d, {
      dateStr: d,
      timeZone: log.timeZone,
      meals: log.meals || [],
      water: { intake: log.waterIntake, target: log.targetWater },
      supps: []
    });
  });

  suppLogs.forEach(supp => {
    const d = new Date(supp.date).toISOString().split('T')[0];
    if (!feedMap.has(d)) {
      feedMap.set(d, {
        dateStr: d,
        timeZone: supp.timeZone,
        meals: [],
        water: null,
        supps: []
      });
    }
    feedMap.get(d)!.supps.push(supp);
  });

  const feedArray = Array.from(feedMap.values()).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/diet" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Diet & Nutrition
          </Link>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <History className="w-8 h-8" />
            </div>
            Nutrition Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Review your consumption history and adherence rates.
          </motion.p>
        </div>
      </header>

      {/* Analytics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Utensils className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Averages</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{avgCals} <span className="text-sm text-neutral-500 font-normal">kcal</span></p>
          <p className="text-sm text-neutral-500">{avgPro}g Protein / day</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Avg Water</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{avgWaterL} <span className="text-sm text-neutral-500 font-normal">L</span></p>
          <p className="text-sm text-neutral-500">{waterRate}% Goal Achievement</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Pill className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Supplements</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{suppRate}%</p>
          <p className="text-sm text-neutral-500">Adherence Rate</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Total Days</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{totalDietDays}</p>
          <p className="text-sm text-neutral-500">Tracked in Database</p>
        </div>
      </section>

      {/* History Feed */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">Chronological Feed</h2>
        </div>

        <div className="divide-y divide-neutral-800/50">
          {feedArray.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No history available yet.</div>
          ) : (
            feedArray.map((day) => {
              const d = new Date(day.dateStr);
              const dayName = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

              const totalCals = day.meals.reduce((acc, m) => acc + m.calories, 0);

              return (
                <div key={day.dateStr} className="p-6 hover:bg-neutral-950/50 transition-colors">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      {dayName} 
                      <span className="text-xs font-normal text-neutral-500 px-2 py-1 bg-neutral-800 rounded-md">
                        {day.timeZone || "UTC"}
                      </span>
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Meals */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2"><Utensils className="w-4 h-4" /> Meals ({totalCals} kcal)</h4>
                      {day.meals.length === 0 ? <p className="text-xs text-neutral-600">No meals logged.</p> : (
                        day.meals.map((m: any) => (
                          <div key={m.id} className="text-sm flex justify-between text-neutral-400">
                            <span>{m.name}</span>
                            <span className="text-neutral-300 font-medium">{m.calories} kcal</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Water */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2"><Droplets className="w-4 h-4" /> Hydration</h4>
                      {day.water ? (
                        <div className="text-sm text-neutral-400">
                          <p>Consumed: <span className="text-white font-medium">{(day.water.intake / 1000).toFixed(1)} L</span></p>
                          <p className="text-xs mt-1">Goal: {(day.water.target / 1000).toFixed(1)} L</p>
                        </div>
                      ) : <p className="text-xs text-neutral-600">No water logged.</p>}
                    </div>

                    {/* Supplements */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2"><Pill className="w-4 h-4" /> Supplements</h4>
                      {day.supps.length === 0 ? <p className="text-xs text-neutral-600">No supplements logged.</p> : (
                        day.supps.map((s: any) => (
                          <div key={s.id} className="text-sm flex justify-between text-neutral-400">
                            <span className={s.status === "missed" ? "line-through opacity-50" : ""}>{s.name}</span>
                            <span className={clsx("text-xs font-medium", s.status === "completed" ? "text-green-500" : "text-red-500")}>
                              {s.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
