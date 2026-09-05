"use client";

import { useState } from "react";
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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Entry Pass Verifier</h1>
              <p className="text-xs text-slate-400">Gate security & organizer validation portal</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="mt-6 space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Paste Ticket ID / QR Payload
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="e.g. EVENTHUB-TICKET:123e4567-... or raw UUID"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? "Checking..." : "Verify"}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorStatus && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Pass Verification Failed</p>
                <p className="text-xs text-rose-400/80 mt-0.5">{errorStatus}</p>
              </div>
            </div>
          )}

          {/* Valid Pass Result Card */}
          {result && (
            <div className="mt-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>Valid Entry Pass - Verified</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-slate-400">Attendee Name:</span>
                  <span className="text-white font-medium">{result.user_name}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-slate-400">Attendee Email:</span>
                  <span className="text-white font-medium">{result.user_email}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-slate-400">Event:</span>
                  <span className="text-white font-medium">{result.events?.title}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-slate-400">Venue:</span>
                  <span className="text-white font-medium">{result.events?.location}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Ticket UUID:</span>
                  <span className="text-slate-300 font-mono text-[10px] truncate max-w-[200px]">
                    {result.id}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}