"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, CheckCircle2, XCircle, Search, ArrowLeft, Ticket } from "lucide-react";
import Link from "next/link";

interface VerificationResult {
  id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  events: {
    title: string;
    location: string;
    event_date: string;
  };
}

export default function VerifyTicket() {
  const [ticketInput, setTicketInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorStatus(null);

    // QR value me prefix ho sakta hai (e.g., EVENTHUB-TICKET:uuid), clean it
    let cleanId = ticketInput.trim();
    if (cleanId.includes(":")) {
      cleanId = cleanId.split(":")[1].trim();
    }

    const { data, error } = await supabase
      .from("registrations")
      .select("id, user_name, user_email, created_at, events(title, location, event_date)")
      .eq("id", cleanId)
      .single();

    setLoading(false);

    if (error || !data) {
      setErrorStatus("Invalid Pass! No registration record found with this ID.");
    } else {
      setResult(data as any);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#08080A] text-zinc-200 p-6 md:p-12 flex flex-col items-center overflow-x-hidden">
      {/* Ambient glow, quieter than the homepage since this is a focused utility screen */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[420px] w-[620px] rounded-full bg-[#FF5A36]/[0.08] blur-[130px]" />
      </div>

      <div className="relative w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to events
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#E8481F]/10 text-[#FF6B45] border border-[#E8481F]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">Entry Pass Verifier</h1>
              <p className="text-xs text-zinc-500">Gate security & organizer validation portal</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="mt-6 space-y-2">
            <label className="block text-xs font-medium text-zinc-500">
              Paste Ticket ID / QR Payload
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="e.g. EVENTHUB-TICKET:123e4567-... or raw UUID"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,90,54,0.1)] transition-all duration-200"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="bg-gradient-to-b from-[#FF6B45] to-[#E8481F] disabled:opacity-50 text-white text-sm font-medium px-5 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_10px_24px_-8px_rgba(232,72,31,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_14px_30px_-8px_rgba(232,72,31,0.85)] transition-shadow duration-200 cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                {loading ? "Checking..." : "Verify"}
              </motion.button>
            </div>
          </form>

          <AnimatePresence mode="wait">
            {/* Error state */}
            {errorStatus && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3"
              >
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Pass verification failed</p>
                  <p className="text-xs text-rose-400/80 mt-0.5">{errorStatus}</p>
                </div>
              </motion.div>
            )}

            {/* Valid pass result — echoes the same ticket visual language as the RSVP pass */}
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.07] to-white/[0.015] backdrop-blur-xl p-5"
              >
                <div className="flex items-center justify-between mb-5">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified — valid pass
                  </motion.span>
                  <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[140px]">
                    #{result.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 mb-1">Admits</p>
                <h3 className="text-lg font-semibold text-white tracking-tight mb-5">
                  {result.events?.title}
                </h3>

                <div className="w-full border-t border-dashed border-white/[0.15] relative mb-5" aria-hidden>
                  <span className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#08080A] border border-white/[0.1]" />
                  <span className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#08080A] border border-white/[0.1]" />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-zinc-500 mb-0.5">Attendee</p>
                    <p className="text-white font-medium truncate">{result.user_name}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-0.5">Email</p>
                    <p className="text-white font-medium truncate">{result.user_email}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-0.5">Venue</p>
                    <p className="text-white font-medium truncate">{result.events?.location}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-0.5">Ticket UUID</p>
                    <p className="text-zinc-300 font-mono text-[10px] truncate flex items-center gap-1">
                      <Ticket className="w-3 h-3 shrink-0 text-zinc-500" />
                      {result.id}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}