"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle, Ticket, QrCode } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  location: string;
  event_date: string;
}

interface RsvpModalProps {
  event: EventData | null;
  onClose: () => void;
}

export default function RsvpModal({ event, onClose }: RsvpModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (!event) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Supabase ki registrations table mein entry insert karna
    const { data, error } = await supabase
      .from("registrations")
      .insert([
        {
          event_id: event.id,
          user_name: name,
          user_email: email.toLowerCase().trim(),
        },
      ])
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      // 23505 Postgres code duplicate unique constraint ke liye hota hai
      if (error.code === "23505") {
        setErrorMsg("You have already registered for this event with this email!");
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    // Success: Supabase se mili unique Ticket ID save karo
    if (data) {
      setTicketId(data.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md"
      >
        {/* Ambient glow behind the card */}
        <div className="absolute -inset-10 -z-10 bg-[#FF5A36]/[0.12] blur-[80px] rounded-full" />

        <div className="relative bg-[#0D0D0F] border border-white/[0.08] rounded-3xl p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white hover:bg-white/[0.06] p-1.5 rounded-full transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            {!ticketId ? (
              /* Step A: RSVP Form */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 pr-6">
                  <span className="inline-flex items-center text-[11px] font-medium text-[#FFB199] bg-[#E8481F]/15 border border-[#E8481F]/25 rounded-full px-2.5 py-1">
                    Event RSVP
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-3 tracking-tight leading-snug">
                    {event.title}
                  </h3>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                        {errorMsg}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,90,54,0.1)] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@campus.edu"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,90,54,0.1)] transition-all duration-200"
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-b from-[#FF6B45] to-[#E8481F] disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_10px_24px_-8px_rgba(232,72,31,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_14px_30px_-8px_rgba(232,72,31,0.85)] transition-shadow duration-200 cursor-pointer"
                  >
                    {loading ? "Confirming spot..." : "Claim digital pass"}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              /* Step B: Success & QR Code Ticket — mirrors the homepage ticket mockup */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="relative w-12 h-12 flex items-center justify-center mb-3"
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/20 animate-ping" />
                    <span className="relative w-12 h-12 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    You're in — spot confirmed
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Show this pass at the entrance — Gate Portal verifies it instantly.
                  </p>
                </div>

                {/* Ticket card, same visual language as the homepage preview */}
                <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.015] backdrop-blur-xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#FFB199] bg-[#E8481F]/15 border border-[#E8481F]/25 rounded-full px-2.5 py-1">
                      Digital pass
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[120px]">
                      #{ticketId.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mb-1">You're going to</p>
                  <h4 className="text-base font-semibold text-white tracking-tight leading-snug mb-5">
                    {event.title}
                  </h4>

                  <div className="w-full border-t border-dashed border-white/[0.15] relative mb-5" aria-hidden>
                    <span className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#0D0D0F] border border-white/[0.1]" />
                    <span className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#0D0D0F] border border-white/[0.1]" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shrink-0">
                      <QRCodeSVG value={`EVENTHUB-TICKET:${ticketId}`} size={104} level="H" />
                    </div>
                    <div className="text-xs text-zinc-500 leading-relaxed">
                      <p className="text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-zinc-500" />
                        Scan at the gate
                      </p>
                      <p className="truncate">{name}</p>
                      <p className="truncate">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-600 justify-center">
                  <Ticket className="w-3 h-3" />
                  Ticket ID: <span className="font-mono break-all">{ticketId}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}