"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { X, CalendarPlus, AlertCircle, ChevronDown } from "lucide-react";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const inputClasses =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,90,54,0.1)] transition-all duration-200";

export default function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("100");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.from("events").insert([
      {
        title: title.trim(),
        description: description.trim(),
        category,
        event_date: new Date(eventDate).toISOString(),
        location: location.trim(),
        capacity: parseInt(capacity, 10) || 100,
      },
    ]);

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Success: Form reset karo, parent ko notify karo, modal band karo
    setTitle("");
    setDescription("");
    setLocation("");
    setCapacity("100");
    setEventDate("");
    onEventCreated();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg my-8"
      >
        {/* Ambient glow behind the card */}
        <div className="absolute -inset-10 -z-10 bg-[#FF5A36]/[0.1] blur-[80px] rounded-full" />

        <div className="relative bg-[#0D0D0F] border border-white/[0.08] rounded-3xl p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white hover:bg-white/[0.06] p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-1 pr-8">
            <div className="p-2 rounded-xl bg-[#E8481F]/10 text-[#FF6B45] border border-[#E8481F]/20 shrink-0">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Host a campus event
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-5 ml-[52px]">
            Fill in the details below to publish your event to the campus board.
          </p>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Robotics Workshop 2026"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will happen at this event? Who should attend?"
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputClasses} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="Tech">Tech</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Capacity (Seats) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`${inputClasses} [color-scheme:dark]`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Seminar Hall 2"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-b from-[#FF6B45] to-[#E8481F] disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_10px_24px_-8px_rgba(232,72,31,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_14px_30px_-8px_rgba(232,72,31,0.85)] transition-shadow duration-200 cursor-pointer"
              >
                {loading ? "Publishing event..." : "Publish event"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}