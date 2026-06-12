"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-neutral-800/50 text-neutral-400 rounded-lg">
              <SettingsIcon className="w-8 h-8" />
            </div>
            Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Manage your account and preferences.
          </motion.p>
        </div>
      </header>

      <div className="flex justify-center">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full max-w-4xl",
              card: "bg-neutral-900 border border-neutral-800 shadow-xl",
              navbar: "border-r border-neutral-800 bg-neutral-950/50",
              navbarButton: "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800",
              headerTitle: "text-white",
              headerSubtitle: "text-neutral-400",
              profileSectionTitleText: "text-neutral-200",
              profileSectionContent: "text-neutral-400",
              profileSectionPrimaryButton: "text-indigo-400 hover:bg-indigo-500/10",
              badge: "bg-neutral-800 text-neutral-300 border border-neutral-700",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
              formFieldInput: "bg-neutral-950 border-neutral-800 text-white focus:ring-indigo-500",
              formFieldLabel: "text-neutral-400"
            }
          }}
        />
      </div>
    </div>
  );
}
