"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  Trophy, 
  Settings,
  CalendarDays,
  Bell,
  User,
  Menu,
  X
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Quest Board", href: "/agenda", icon: CalendarDays },
  { name: "Strength Training", href: "/workout", icon: Dumbbell },
  { name: "Vitality & Diet", href: "/diet", icon: Apple },
  { name: "Charm & Aura", href: "/skincare", icon: Sparkles },
  { name: "Intelligence", href: "/study", icon: BookOpen },
  { name: "System Alerts", href: "/reminders", icon: Bell },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Status Window", href: "/status", icon: User },
  { name: "Achievements", href: "/achievements", icon: Trophy },
];

import { UserButton } from "@clerk/nextjs";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const renderSidebarContent = (isMobile: boolean) => (
    <>
      <div className="p-6 border-b border-[#00e5ff]/20 relative">
        <Link href="/" className="flex items-center gap-3 group" onClick={closeMobileMenu}>
          <div className="relative w-10 h-10 overflow-hidden rounded-md border border-[#00e5ff]/30 group-hover:border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all">
            <Image src="/logo.png" alt="SoloOS Logo" fill className="object-cover" />
          </div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase system-text-glow">
            SoloOS
          </h1>
        </Link>
        {isMobile && (
          <button 
            onClick={closeMobileMenu}
            className="absolute top-6 right-4 p-2 text-neutral-400 hover:text-[#00e5ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
              <div
                className={clsx(
                  "relative flex items-center gap-3 px-3 py-3 font-mono transition-all uppercase tracking-widest text-[11px] group",
                  isActive 
                    ? "bg-[#00e5ff]/10 text-[#00e5ff] border-l-2 border-[#00e5ff] shadow-[inset_10px_0_15px_-10px_rgba(0,229,255,0.3)]" 
                    : "text-neutral-500 hover:text-[#00e5ff] hover:bg-[#00e5ff]/5 border-l-2 border-transparent hover:border-[#00e5ff]/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={`active-nav-bg-${isMobile ? 'mobile' : 'desktop'}`}
                    className="absolute inset-0 bg-[#00e5ff]/5 pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={clsx("w-4 h-4 z-10", isActive && "drop-shadow-[0_0_5px_#00e5ff]")} />
                <span className="z-10 font-bold">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-neutral-800 flex flex-col gap-2">
        <Link href="/settings" onClick={closeMobileMenu}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5 text-neutral-500" />
            Settings
          </div>
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">
          <UserButton 
            appearance={{
              elements: {
                userButtonBox: "flex-row-reverse w-full justify-end",
                userButtonOuterIdentifier: "text-sm text-neutral-300 font-medium ml-2"
              }
            }}
            showName
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 bg-neutral-950 p-2 rounded-lg border border-[#00e5ff]/30 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex-col h-screen fixed left-0 top-0 text-neutral-300 z-50 hidden md:flex">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar sliding in */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-neutral-950 border-r border-[#00e5ff]/20 z-[60] flex flex-col shadow-[0_0_30px_rgba(0,229,255,0.15)]"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
