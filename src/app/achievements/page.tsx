"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Shield, Zap, Target, Lock } from "lucide-react";
import clsx from "clsx";

const MOCK_ACHIEVEMENTS = [
  { id: 1, name: "First Step", description: "Complete your first daily quest", icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", unlocked: true, date: "Oct 12, 2023" },
  { id: 2, name: "7 Day Warrior", description: "Maintain a 7-day streak", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", unlocked: true, date: "Oct 19, 2023" },
  { id: 3, name: "Study Machine", description: "Log 50 hours of study time", icon: Zap, color: "text-orange-400", bg: "bg-orange-400/10", unlocked: true, date: "Nov 5, 2023" },
  { id: 4, name: "Iron Body", description: "Complete 100 workouts", icon: Target, color: "text-red-400", bg: "bg-red-400/10", unlocked: false, progress: 84, target: 100 },
  { id: 5, name: "Perfect Month", description: "Hit all daily goals for 30 days", icon: Trophy, color: "text-purple-400", bg: "bg-purple-400/10", unlocked: false, progress: 12, target: 30 },
];

export default function AchievementsPage() {
  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
              <Trophy className="w-8 h-8" />
            </div>
            Hall of Fame
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Your achievements, badges, and milestones.
          </motion.p>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-3 text-center">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Unlocked</p>
          <p className="text-2xl font-bold text-yellow-400">
            {unlockedCount} <span className="text-neutral-500 text-lg">/ {MOCK_ACHIEVEMENTS.length}</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ACHIEVEMENTS.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={clsx(
              "relative border rounded-2xl p-6 overflow-hidden transition-all duration-300",
              achievement.unlocked 
                ? "bg-neutral-900 border-neutral-700 hover:border-neutral-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
                : "bg-neutral-950/50 border-neutral-800/50 grayscale hover:grayscale-0"
            )}
          >
            {achievement.unlocked && (
              <div className={clsx("absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -mr-10 -mt-10", achievement.bg.replace('/10', ''))} />
            )}
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={clsx("p-3 rounded-xl", achievement.unlocked ? achievement.bg : "bg-neutral-900")}>
                {achievement.unlocked ? (
                  <achievement.icon className={clsx("w-8 h-8", achievement.color)} />
                ) : (
                  <Lock className="w-8 h-8 text-neutral-600" />
                )}
              </div>
              {achievement.unlocked && (
                <span className="text-xs font-medium text-neutral-500 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
                  {achievement.date}
                </span>
              )}
            </div>

            <div className="relative z-10">
              <h3 className={clsx("text-lg font-bold mb-1", achievement.unlocked ? "text-white" : "text-neutral-400")}>
                {achievement.name}
              </h3>
              <p className="text-sm text-neutral-500">{achievement.description}</p>
            </div>

            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="mt-6 relative z-10">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-neutral-500">Progress</span>
                  <span className="text-neutral-400 font-medium">{achievement.progress} / {achievement.target}</span>
                </div>
                <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-600" 
                    style={{ width: `${(achievement.progress / achievement.target!) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
