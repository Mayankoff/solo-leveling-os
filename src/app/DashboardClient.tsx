"use client";

import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Apple, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Flame, 
  Activity,
  Shield,
  Zap,
  Target
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

const getRank = (level: number) => {
  if (level >= 100) return { title: "National Level", color: "text-yellow-400 drop-shadow-[0_0_10px_#facc15]" };
  if (level >= 81) return { title: "S-Rank", color: "text-red-500 drop-shadow-[0_0_10px_#ef4444]" };
  if (level >= 61) return { title: "A-Rank", color: "text-purple-400 drop-shadow-[0_0_10px_#a855f7]" };
  if (level >= 41) return { title: "B-Rank", color: "text-amber-400 drop-shadow-[0_0_10px_#fbbf24]" };
  if (level >= 26) return { title: "C-Rank", color: "text-blue-300 drop-shadow-[0_0_10px_#93c5fd]" };
  if (level >= 11) return { title: "D-Rank", color: "text-orange-300 drop-shadow-[0_0_5px_#fdba74]" };
  return { title: "E-Rank", color: "text-neutral-300 drop-shadow-[0_0_5px_#d4d4d8]" };
};

export default function DashboardClient({ user }: { user: any }) {
  const userData = {
    lifeScore: user?.lifeScore || 0,
    level: user?.level || 1,
    xp: user?.xp || 0,
    nextLevelXp: (user?.level || 1) * 500,
    streak: 0, 
    username: user?.username || "Player",
    statPoints: user?.statPoints || 0
  };

  const rank = getRank(userData.level);
  const xpPercentage = (userData.xp / userData.nextLevelXp) * 100;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-mono">
      
      {/* 1. Global XP Bar at Top */}
      <div className="fixed top-0 left-0 w-full h-1 bg-neutral-900 z-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${xpPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-[#00e5ff] shadow-[0_0_15px_#00e5ff]"
        />
      </div>

      {/* 2. System Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#00e5ff]/20">
        <div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#00e5ff] text-sm uppercase tracking-[0.3em] font-bold mb-2 system-text-glow"
          >
            System Activated
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight"
          >
            {userData.username}
          </motion.h1>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="system-window flex items-center gap-8 py-4"
        >
          <div className="text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Current Rank</p>
            <p className={clsx("text-2xl font-black uppercase tracking-wider", rank.color)}>
              {rank.title}
            </p>
          </div>
          <div className="w-px h-10 bg-neutral-800" />
          <div className="text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Streak</p>
            <p className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1 system-text-glow">
              {userData.streak} <Flame className="w-5 h-5" />
            </p>
          </div>
        </motion.div>
      </header>

      {/* 3. Player Status Board */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Status Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 system-window flex flex-col justify-between group overflow-visible"
        >
          <div className="absolute top-[-10%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform scale-150 rotate-12">
            <Shield className="w-96 h-96" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#00e5ff] flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Player Status
              </h2>
              <div className="px-4 py-1 border border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff] font-bold text-sm tracking-widest shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                LVL {userData.level}
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                  <span>Experience</span>
                  <span className="text-[#00e5ff]">{userData.xp} / {userData.nextLevelXp} XP</span>
                </div>
                <div className="h-4 bg-neutral-900 border border-neutral-700 p-[2px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-neutral-800/50 relative z-10">
            <div className="bg-neutral-900/50 border border-neutral-800 p-4 flex flex-col items-center justify-center text-center">
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Energy</p>
              <p className="font-bold text-white">100 / 100</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 p-4 flex flex-col items-center justify-center text-center">
              <Target className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Life Score</p>
              <p className="font-bold text-white">{userData.lifeScore}%</p>
            </div>
            <Link href="/status" className="bg-neutral-900/50 border border-[#00e5ff]/30 p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_0_15px_rgba(0,229,255,0.1)] hover:bg-[#00e5ff]/10 transition-colors">
              <Trophy className="w-6 h-6 text-[#00e5ff] mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-[#00e5ff] mb-1">Stat Points</p>
              <p className="font-bold text-white">{userData.statPoints}</p>
            </Link>
          </div>
        </motion.div>

        {/* Daily Quest Briefing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="system-window border-t-4 border-t-yellow-500 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-yellow-500 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-yellow-500 animate-pulse" />
            Active Daily Quests
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="p-3 border border-neutral-800 bg-neutral-900/50 flex justify-between items-center hover:border-yellow-500/50 transition-colors">
              <span className="text-neutral-300 text-sm">Drink 3L Water</span>
              <span className="text-xs text-yellow-500">Incomplete</span>
            </div>
            <div className="p-3 border border-neutral-800 bg-neutral-900/50 flex justify-between items-center hover:border-yellow-500/50 transition-colors">
              <span className="text-neutral-300 text-sm">Strength Training</span>
              <span className="text-xs text-yellow-500">Incomplete</span>
            </div>
            <div className="p-3 border border-neutral-800 bg-neutral-900/50 flex justify-between items-center hover:border-yellow-500/50 transition-colors">
              <span className="text-neutral-300 text-sm">Read 10 Pages</span>
              <span className="text-xs text-yellow-500">Incomplete</span>
            </div>
          </div>
          
          <Link href="/agenda" className="block text-center mt-6 w-full py-3 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            Open Quest Board
          </Link>
        </motion.div>

      </section>

      {/* 4. Sub-Systems */}
      <section className="pt-8 pb-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
          <div className="w-full h-px bg-neutral-800 flex-1" />
          <span>System Modules</span>
          <div className="w-full h-px bg-neutral-800 flex-1" />
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Strength Training", icon: Dumbbell, color: "text-red-500", border: "hover:border-red-500/50", href: "/workout" },
            { name: "Vitality & Diet", icon: Apple, color: "text-green-500", border: "hover:border-green-500/50", href: "/diet" },
            { name: "Charm & Aura", icon: Sparkles, color: "text-purple-500", border: "hover:border-purple-500/50", href: "/skincare" },
            { name: "Intelligence", icon: BookOpen, color: "text-blue-500", border: "hover:border-blue-500/50", href: "/study" },
          ].map((mod, i) => (
            <Link href={mod.href} key={mod.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={clsx(
                  "p-4 bg-neutral-900/80 border border-neutral-800 transition-all cursor-pointer group relative overflow-hidden",
                  mod.border
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50 pointer-events-none" />
                <mod.icon className={clsx("w-8 h-8 mb-4", mod.color)} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{mod.name}</h3>
                <p className="text-[10px] text-neutral-500 uppercase mt-1">Access Module →</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
