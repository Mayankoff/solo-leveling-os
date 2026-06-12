"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Sun, Moon, CalendarDays, Camera, Target } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function SkincareHistoryClient({ history }: { history: { logs: any[], conditions: any[] } }) {
  const { logs, conditions } = history;

  // Analytics
  const totalRoutines = logs.length;
  const completedRoutines = logs.filter(l => l.status === "completed").length;
  const routineCompletionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
  
  const morningLogs = logs.filter(l => l.routineType === "morning");
  const morningRate = morningLogs.length > 0 ? Math.round((morningLogs.filter(l => l.status === "completed").length / morningLogs.length) * 100) : 0;
  
  const eveningLogs = logs.filter(l => l.routineType === "evening");
  const eveningRate = eveningLogs.length > 0 ? Math.round((eveningLogs.filter(l => l.status === "completed").length / eveningLogs.length) * 100) : 0;

  // Group Chronological Feed
  const feedMap = new Map<string, { dateStr: string, timeZone: string, routines: any[], condition: any }>();

  const getLocalDateStr = (d: Date) => new Date(d).toISOString().split('T')[0];

  logs.forEach(l => {
    const dStr = getLocalDateStr(l.date);
    if (!feedMap.has(dStr)) feedMap.set(dStr, { dateStr: dStr, timeZone: l.timeZone, routines: [], condition: null });
    feedMap.get(dStr)!.routines.push(l);
  });

  conditions.forEach(c => {
    const dStr = getLocalDateStr(c.date);
    if (!feedMap.has(dStr)) feedMap.set(dStr, { dateStr: dStr, timeZone: c.timeZone, routines: [], condition: null });
    feedMap.get(dStr)!.condition = c;
  });

  const feedArray = Array.from(feedMap.values()).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/skincare" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Skincare Routine
          </Link>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            Skin Journey & Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Track your consistency, routines, and skin progression timeline.
          </motion.p>
        </div>
      </header>

      {/* Analytics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Consistency</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{routineCompletionRate}%</p>
          <p className="text-sm text-neutral-500">Overall Completion Rate</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Morning</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{morningRate}%</p>
          <p className="text-sm text-neutral-500">AM Routine Adherence</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Night</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{eveningRate}%</p>
          <p className="text-sm text-neutral-500">PM Routine Adherence</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="w-5 h-5 text-pink-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Total Logs</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{totalRoutines}</p>
          <p className="text-sm text-neutral-500">Routines Tracked</p>
        </div>
      </section>

      {/* History Feed */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">Skin Journey Timeline</h2>
        </div>

        <div className="divide-y divide-neutral-800/50">
          {feedArray.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No skincare history available yet.</div>
          ) : (
            feedArray.map((day) => {
              const d = new Date(day.dateStr);
              const dayName = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Routines */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-pink-400 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Routines</h4>
                      {day.routines.length === 0 ? <p className="text-xs text-neutral-600">No routines logged.</p> : (
                        day.routines.map((r: any) => {
                          const stepsCount = JSON.parse(r.completedSteps || "[]").length;
                          return (
                            <div key={r.id} className="text-sm flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                              <div className="flex items-center gap-2">
                                {r.routineType === "morning" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                                <span className="capitalize text-neutral-300 font-medium">{r.routineType} Routine</span>
                              </div>
                              <div className="text-right">
                                <span className={clsx("text-xs font-medium px-2 py-1 rounded-md", r.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400")}>
                                  {r.status === "completed" ? "Completed" : `${stepsCount} steps`}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Skin Condition Note */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-neutral-400 flex items-center gap-2"><Camera className="w-4 h-4" /> Observations</h4>
                      {day.condition ? (
                        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                          <p className="text-sm text-neutral-300 italic">"{day.condition.notes}"</p>
                          {day.condition.photoUrl && (
                            <p className="text-xs text-blue-400 mt-2 flex items-center gap-1"><Camera className="w-3 h-3" /> Photo Attached</p>
                          )}
                        </div>
                      ) : <p className="text-xs text-neutral-600 p-4">No daily observations logged.</p>}
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
