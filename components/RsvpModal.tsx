"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { X, Calendar, MapPin, CheckCircle2, Ticket, AlertCircle } from "lucide-react";

interface RsvpModalProps {
  event: {
    id: string;
    title: string;
    location: string;
    event_date: string;
    capacity: number;
    registrations_count?: number;
  };
  onClose: () => void;
}

export default function RsvpModal({ event, onClose }: RsvpModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Point 5: Auto-fill if user is logged in
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        setName(session.user.user_metadata?.full_name || "");
      }
    }
    loadUser();
  }, []);

  const handleRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Point 2: Live overbooking check
      const { count, error: countErr } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id);

      if (countErr) throw countErr;

      if ((count || 0) >= event.capacity) {
        throw new Error("Sorry! This event just reached full capacity.");
      }

      // Point 1: Insert registration (will fail if duplicate due to unique constraint)
      const { data, error } = await supabase
        .from("registrations")
        .insert([
          {
            event_id: event.id,
            user_name: name.trim(),
            user_email: email.trim().toLowerCase(),
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already RSVP'd for this event with this email!");
        }
        throw error;
      }

      setTicketId(data.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to confirm RSVP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0C0C0F] p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9)]"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!ticketId ? (
          <div>
            <div className="mb-5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FFB199] bg-[#E8481F]/15 border border-[#E8481F]/25 rounded-full px-2.5 py-1 mb-2">
                RSVP Confirmation
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{event.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {event.location}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRsvp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aryan Sharma"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-b from-[#FF6B45] to-[#E8481F] text-white text-sm font-medium py-2.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Securing spot..." : "Confirm & Get Pass"}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-2 space-y-4">
            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Pass Confirmed!</h3>
              <p className="text-xs text-zinc-400 mt-1">Present this QR code at the gate venue.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg">
              <QRCode value={`EVENTHUB:${ticketId}`} size={160} />
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-400 text-left">
              <div className="flex justify-between">
                <span>Attendee:</span>
                <span className="text-white font-medium">{name}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Pass ID:</span>
                <span className="font-mono text-[10px] text-zinc-500">{ticketId.slice(0, 18)}...</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-white text-black font-medium py-2.5 rounded-xl text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}