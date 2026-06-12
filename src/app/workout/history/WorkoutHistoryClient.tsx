"use client";

import { motion } from "framer-motion";
import { ArrowLeft, History, Trophy, TrendingUp, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  return weekNo;
}

export default function WorkoutHistoryClient({ history }: { history: any[] }) {
  const completedWorkouts = history.filter(h => h.status === "Completed");
  const totalWorkouts = completedWorkouts.length;
  
  // Calculate completion rate over the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLogs = history.filter(h => new Date(h.date) >= thirtyDaysAgo);
  const recentCompleted = recentLogs.filter(h => h.status === "Completed").length;
  const completionRate = recentLogs.length > 0 ? Math.round((recentCompleted / recentLogs.length) * 100) : 0;

  // Streak Calculation (consecutive days with completed workouts)
  let currentStreak = 0;
  // Sorting descending by date
  const sortedLogs = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const today = new Date();
  today.setHours(0,0,0,0);
  let checkDate = today;

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    if (logDate.getTime() === checkDate.getTime()) {
      if (sortedLogs[i].status === "Completed") {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (sortedLogs[i].status === "Skipped" || sortedLogs[i].status === "Not Started") {
        // Break the streak unless it's a rest day that they intentionally took?
        // Let's assume streak breaks on skipped.
        if (i === 0 && logDate.getTime() === today.getTime()) {
          // If today is skipped, check yesterday
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (logDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  const getStatusColor = (status: string) => {
    if (status === "Completed") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (status === "In Progress") return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    if (status === "Skipped") return "text-neutral-500 bg-neutral-800 border-neutral-700";
    return "text-orange-400 bg-orange-400/10 border-orange-400/20";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/workout" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Workout
          </Link>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <History className="w-8 h-8" />
            </div>
            Workout History
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Data doesn't lie. Review your historical performance.
          </motion.p>
        </div>
      </header>

      {/* Analytics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Trophy className="w-6 h-6" /></div>
          <div>
            <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">Total Completed</p>
            <p className="text-3xl font-bold text-white">{totalWorkouts}</p>
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">Current Streak</p>
            <p className="text-3xl font-bold text-white">{currentStreak} <span className="text-lg text-neutral-500">days</span></p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-green-500/10 text-green-400 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">30-Day Consistency</p>
            <p className="text-3xl font-bold text-white">{completionRate}%</p>
          </div>
        </div>
      </section>

      {/* History Feed */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-neutral-400" /> Session Logs
          </h2>
        </div>

        <div className="divide-y divide-neutral-800/50">
          {sortedLogs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No history available yet. Complete some workouts!</div>
          ) : (
            sortedLogs.map((log: any) => {
              const d = new Date(log.date);
              const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
              const monthName = d.toLocaleDateString('en-US', { month: 'long' });
              const year = d.getFullYear();
              const weekNo = getWeekNumber(d);
              
              const totalEx = log.exercises.length;
              const compEx = log.exercises.filter((e:any) => e.completed).length;

              return (
                <div key={log.id} className="p-6 hover:bg-neutral-950/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={clsx("text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider border", getStatusColor(log.status))}>
                          {log.status}
                        </span>
                        <span className="text-sm font-medium text-neutral-500">
                          {d.toISOString().split('T')[0]} • Week {weekNo} • {log.timeZone || "UTC"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{log.type}</h3>
                      <p className="text-sm text-neutral-400">{dayName}, {monthName} {d.getDate()}, {year}</p>
                    </div>
                    
                    {totalEx > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-300">{compEx} / {totalEx} Exercises</div>
                        <div className="w-32 h-2 bg-neutral-800 rounded-full mt-2 overflow-hidden ml-auto">
                          <div className="h-full bg-blue-500" style={{ width: `${(compEx/totalEx)*100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {totalEx > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-800/50">
                      {log.exercises.map((ex: any) => (
                        <div key={ex.id} className="flex items-center gap-2 text-sm text-neutral-400">
                          {ex.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-neutral-600" />}
                          <span className={ex.completed ? "text-neutral-300" : ""}>{ex.name}</span>
                          <span className="text-neutral-600 ml-auto">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
