"use client";

import { motion } from "framer-motion";
import { Calendar, Target, Clock, Dumbbell, Sparkles, Droplets, Utensils, BookOpen, AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { disconnectGoogle } from "@/actions/agenda";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AgendaClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const {
    workouts,
    dietLog,
    supplements,
    studyTasks,
    studySessions,
    skincareMorning,
    skincareEvening,
    reminders,
    isGoogleConnected,
    authUrl,
    timeZone,
    dateStr
  } = initialData;

  const handleGoogleDisconnect = async () => {
    await disconnectGoogle();
    toast.success("Google Calendar disconnected");
    router.refresh();
  };

  // Compile timeline items
  const timeline: any[] = [];

  // Workouts
  workouts.forEach((w: any) => {
    timeline.push({
      time: "Scheduled", // We can add exact times to workouts later, for now just day
      type: "workout",
      title: `${w.type} Workout`,
      status: w.status,
      icon: <Dumbbell className="w-5 h-5 text-blue-400" />
    });
  });

  // Diet / Water
  if (dietLog) {
    if (dietLog.waterIntake > 0) {
      timeline.push({
        time: "All Day",
        type: "diet",
        title: `Hydration: ${dietLog.waterIntake / 1000}L / ${dietLog.targetWater / 1000}L`,
        status: dietLog.waterIntake >= dietLog.targetWater ? "completed" : "pending",
        icon: <Droplets className="w-5 h-5 text-cyan-400" />
      });
    }
    dietLog.meals.forEach((m: any) => {
      timeline.push({
        time: new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "meal",
        title: `${m.type}: ${m.name}`,
        status: "completed",
        icon: <Utensils className="w-5 h-5 text-orange-400" />
      });
    });
  }

  // Supplements
  supplements.forEach((s: any) => {
    timeline.push({
      time: new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "supplement",
      title: `${s.name} (${s.dosage}${s.unit})`,
      status: s.status,
      icon: <Target className="w-5 h-5 text-green-400" />
    });
  });

  // Skincare
  if (skincareMorning) {
    timeline.push({
      time: "Morning",
      type: "skincare",
      title: "Morning Skincare Routine",
      status: skincareMorning.status,
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />
    });
  } else {
    timeline.push({ time: "Morning", type: "skincare", title: "Morning Skincare Routine", status: "pending", icon: <Sparkles className="w-5 h-5 text-yellow-400" /> });
  }

  if (skincareEvening) {
    timeline.push({
      time: "Evening",
      type: "skincare",
      title: "Evening Skincare Routine",
      status: skincareEvening.status,
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />
    });
  } else {
    timeline.push({ time: "Evening", type: "skincare", title: "Evening Skincare Routine", status: "pending", icon: <Sparkles className="w-5 h-5 text-indigo-400" /> });
  }

  // Study
  studyTasks.forEach((t: any) => {
    timeline.push({
      time: t.deadline ? new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today",
      type: "study_task",
      title: `[Task] ${t.title} (${t.subject})`,
      status: t.status,
      icon: <BookOpen className="w-5 h-5 text-purple-400" />
    });
  });

  studySessions.forEach((s: any) => {
    timeline.push({
      time: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "study_session",
      title: `[Session] ${s.subject}: ${s.topic || "Study"}`,
      status: "completed",
      icon: <Clock className="w-5 h-5 text-purple-400" />
    });
  });

  // Reminders
  reminders.forEach((r: any) => {
    timeline.push({
      time: new Date(r.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "reminder",
      title: r.title,
      status: r.isCompleted ? "completed" : "pending",
      icon: <AlertCircle className="w-5 h-5 text-pink-400" />
    });
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 font-mono">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#00e5ff]/20">
        <div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#00e5ff] text-sm uppercase tracking-[0.3em] font-bold mb-2 system-text-glow"
          >
            System Log
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight flex items-center gap-3"
          >
            <div className="p-2 border border-[#00e5ff]/30 text-[#00e5ff] shadow-[inset_0_0_10px_rgba(0,229,255,0.2)]">
              <CalendarDays className="w-8 h-8" />
            </div>
            Daily Quest Board
          </motion.h1>
        </div>

        <div className="flex items-center gap-4">
          {isGoogleConnected ? (
            <div className="system-window flex items-center gap-4 py-2 px-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span> 
                  Calendar Sync Active
                </span>
              </div>
              <button onClick={handleGoogleDisconnect} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 border border-red-500/30 p-1">Disconnect</button>
            </div>
          ) : (
            <a 
              href={authUrl || "#"}
              className="system-button flex items-center gap-2 text-xs"
            >
              <Calendar className="w-4 h-4" />
              Connect Sync
            </a>
          )}
        </div>
      </header>

      <section className="system-window">
        <h2 className="text-xl font-bold text-[#00e5ff] uppercase tracking-widest mb-8 system-text-glow flex items-center gap-2">
          <Target className="w-5 h-5" /> Master Timeline
        </h2>

        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon marker */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-neutral-950 bg-neutral-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                {item.icon}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border border-[#00e5ff]/20 bg-[#050505] hover:bg-[#00e5ff]/5 hover:border-[#00e5ff]/50 transition-all group-hover:shadow-[0_0_15px_rgba(0,229,255,0.1)] relative overflow-hidden">
                {item.status === "completed" && (
                  <div className="absolute inset-0 bg-[#00e5ff]/5 pointer-events-none" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-800 px-2 py-1">{item.time}</span>
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 border",
                    item.status === "completed" ? "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/50 system-text-glow" :
                    item.status === "partial" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/50" :
                    "bg-neutral-900 text-neutral-500 border-neutral-800"
                  )}>
                    {item.status === "completed" ? "Cleared" : "Pending"}
                  </span>
                </div>
                <h3 className={clsx("font-bold text-lg uppercase tracking-wider", item.status === "completed" ? "text-neutral-300 line-through decoration-[#00e5ff]/50" : "text-white")}>{item.title}</h3>
              </div>
            </div>
          ))}

          {timeline.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              Your agenda is clear for today.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
