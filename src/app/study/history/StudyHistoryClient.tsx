"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Target, Trophy, CalendarDays } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function StudyHistoryClient({ history }: { history: { tasks: any[], sessions: any[] } }) {
  const { tasks, sessions } = history;

  // Analytics
  const totalSessions = sessions.length;
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const avgSessionDuration = totalSessions > 0 ? Math.round(totalStudyMinutes / totalSessions) : 0;
  const tasksCompleted = tasks.length;

  // Group by Subject for Analytics
  const subjectMap = new Map<string, number>();
  sessions.forEach(s => {
    subjectMap.set(s.subject, (subjectMap.get(s.subject) || 0) + (s.duration || 0));
  });
  const mostStudiedSubject = Array.from(subjectMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  // Group Chronological Feed (mix sessions and tasks)
  const feedMap = new Map<string, { dateStr: string, timeZone: string, items: any[] }>();

  const getLocalDateStr = (d: Date) => new Date(d).toISOString().split('T')[0];

  sessions.forEach(s => {
    const dStr = getLocalDateStr(s.date || s.startTime);
    if (!feedMap.has(dStr)) feedMap.set(dStr, { dateStr: dStr, timeZone: s.timeZone, items: [] });
    feedMap.get(dStr)!.items.push({ type: 'session', ...s, timestamp: new Date(s.startTime).getTime() });
  });

  tasks.forEach(t => {
    if (!t.completionTime) return;
    const dStr = getLocalDateStr(t.completionTime);
    if (!feedMap.has(dStr)) feedMap.set(dStr, { dateStr: dStr, timeZone: t.timeZone, items: [] });
    feedMap.get(dStr)!.items.push({ type: 'task', ...t, timestamp: new Date(t.completionTime).getTime() });
  });

  const feedArray = Array.from(feedMap.values()).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
  
  // Sort items within each day
  feedArray.forEach(day => day.items.sort((a, b) => b.timestamp - a.timestamp));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/study" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Study Tracker
          </Link>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <CalendarDays className="w-8 h-8" />
            </div>
            Study History & Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Track your deep work sessions, task completions, and academic progress.
          </motion.p>
        </div>
      </header>

      {/* Analytics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Total Time</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{totalStudyHours} <span className="text-sm text-neutral-500 font-normal">hrs</span></p>
          <p className="text-sm text-neutral-500">{totalSessions} Sessions</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Avg Duration</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{avgSessionDuration} <span className="text-sm text-neutral-500 font-normal">min</span></p>
          <p className="text-sm text-neutral-500">Per Session</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Top Subject</h3>
          </div>
          <p className="text-xl font-bold text-white mb-1 truncate">{mostStudiedSubject}</p>
          <p className="text-sm text-neutral-500">Highest Volume</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{tasksCompleted}</p>
          <p className="text-sm text-neutral-500">Tasks Finished</p>
        </div>
      </section>

      {/* History Feed */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">Chronological Feed</h2>
        </div>

        <div className="divide-y divide-neutral-800/50">
          {feedArray.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No study history available yet.</div>
          ) : (
            feedArray.map((day) => {
              const d = new Date(day.dateStr);
              const dayName = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

              return (
                <div key={day.dateStr} className="p-6 hover:bg-neutral-950/50 transition-colors">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      {dayName} 
                      <span className="text-xs font-normal text-neutral-500 px-2 py-1 bg-neutral-800 rounded-md">
                        {day.timeZone || "UTC"}
                      </span>
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {day.items.map((item: any) => {
                      const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      if (item.type === 'session') {
                        return (
                          <div key={`s-${item.id}`} className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-white truncate">{item.subject}</p>
                                <span className="text-xs text-neutral-500">{timeString}</span>
                              </div>
                              <p className="text-sm text-neutral-400">{item.topic || "Deep Work Session"}</p>
                              {item.notes && <p className="text-xs text-neutral-500 mt-2 italic">"{item.notes}"</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-neutral-300">{item.duration} min</p>
                              <p className="text-xs text-orange-400 font-medium">+{item.xpEarned} XP</p>
                            </div>
                          </div>
                        );
                      } else {
                        // Task
                        return (
                          <div key={`t-${item.id}`} className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl border-l-4 border-l-green-500">
                            <div className="p-2 bg-green-500/10 text-green-400 rounded-lg shrink-0">
                              <Target className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-white truncate">{item.title}</p>
                                <span className="text-xs text-neutral-500">{timeString}</span>
                              </div>
                              <p className="text-xs text-neutral-500">{item.subject}</p>
                              {item.description && <p className="text-xs text-neutral-400 mt-2">{item.description}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-400 rounded-md">Completed</span>
                              <p className="text-xs text-orange-400 font-medium mt-2">+{item.xpEarned} XP</p>
                            </div>
                          </div>
                        );
                      }
                    })}
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
