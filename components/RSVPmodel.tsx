"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle, Ticket } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!ticketId ? (
          /* Step A: RSVP Form */
          <div>
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                Event RSVP
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {event.title}
              </h3>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@campus.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                {loading ? "Confirming Spot..." : "Claim Digital Pass"}
              </button>
            </form>
          </div>
        ) : (
          /* Step B: Success & QR Code Ticket */
          <div className="text-center flex flex-col items-center py-2">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              You're In! Spot Confirmed 🎉
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Show this QR pass at the entrance gate for verification.
            </p>

            {/* QR Card */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200">
              <QRCodeSVG
                value={`EVENTHUB-TICKET:${ticketId}`}
                size={180}
                level="H"
              />
            </div>

            <div className="mt-5 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
                <Ticket className="w-3.5 h-3.5" /> Pass Details
              </div>
              <p className="text-xs text-slate-300 font-medium truncate">
                {name} ({email})
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1 break-all">
                Ticket ID: {ticketId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}