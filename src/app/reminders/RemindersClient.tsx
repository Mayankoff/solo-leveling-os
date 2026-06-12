"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Plus, Trash2, CheckCircle, Calendar, RefreshCcw, Bell } from "lucide-react";
import { addReminder, deleteReminder, completeReminder } from "@/actions/reminders";
import { toast } from "sonner";
import clsx from "clsx";

export default function RemindersClient({ initialReminders, timeZone }: { initialReminders: any[], timeZone: string }) {
  const [reminders, setReminders] = useState(initialReminders);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    entityType: "custom",
    date: "",
    time: "",
    recurrence: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Combine date and time
    const dateTimeStr = `${formData.date}T${formData.time}:00`;
    
    await addReminder({
      title: formData.title,
      entityType: formData.entityType,
      scheduledTime: new Date(dateTimeStr).toISOString(),
      timeZone,
      recurrence: formData.recurrence || null
    });

    toast.success("Reminder created and synced to Calendar!");
    setShowModal(false);
    window.location.reload(); // Quick refresh to get new items
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    setReminders(reminders.filter(r => r.id !== id));
    toast.success("Reminder deleted");
  };

  const handleComplete = async (id: string) => {
    await completeReminder(id);
    setReminders(reminders.map(r => r.id === id ? { ...r, isCompleted: true } : r));
    toast.success("Marked as complete!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3"
          >
            <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
              <Bell className="w-8 h-8" />
            </div>
            Reminder Center
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2"
          >
            Manage recurring alerts and custom reminders synced to your Google Calendar.
          </motion.p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </header>

      <div className="grid gap-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500">
            No active reminders.
          </div>
        ) : (
          reminders.map(r => (
            <div key={r.id} className={clsx(
              "flex items-center justify-between p-4 rounded-xl border transition-colors",
              r.isCompleted ? "bg-neutral-900/50 border-neutral-800 opacity-75" : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
            )}>
              <div className="flex items-center gap-4">
                <div className={clsx("p-2 rounded-lg", r.isCompleted ? "bg-green-500/10 text-green-400" : "bg-neutral-800 text-neutral-400")}>
                  {r.isCompleted ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={clsx("font-bold", r.isCompleted ? "text-neutral-500 line-through" : "text-white")}>{r.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {r.recurrence && <span className="flex items-center gap-1 text-blue-400"><RefreshCcw className="w-3 h-3" /> {r.recurrence}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!r.isCompleted && (
                  <button onClick={() => handleComplete(r.id)} className="p-2 text-neutral-400 hover:text-green-400 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => handleDelete(r.id)} className="p-2 text-neutral-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-6">Create Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
                  placeholder="Drink water, take vitamins, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Time</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Recurrence (Optional)</label>
                <select
                  value={formData.recurrence}
                  onChange={e => setFormData({...formData, recurrence: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
                >
                  <option value="">None (One-time)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Save & Sync
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
