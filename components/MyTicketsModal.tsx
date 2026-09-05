"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { X, Calendar, MapPin, Ticket } from "lucide-react";

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function MyTicketsModal({ isOpen, onClose, userEmail }: MyTicketsModalProps) {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userEmail) return;

    async function fetchPasses() {
      setLoading(true);
      const { data } = await supabase
        .from("registrations")
        .select("*, events(title, location, event_date)")
        .eq("user_email", userEmail.toLowerCase())
        .order("created_at", { ascending: false });

      if (data) setPasses(data);
      setLoading(false);
    }

    fetchPasses();
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#0C0C0F] p-7 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Ticket className="w-5 h-5 text-[#FF6B45]" />
          <h2 className="text-xl font-bold text-white tracking-tight">My Active Passes</h2>
        </div>

        {loading ? (
          <p className="text-center text-xs text-zinc-500 py-12">Loading passes...</p>
        ) : passes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            You haven't RSVP'd to any events yet.
          </div>
        ) : (
          <div className="space-y-4">
            {passes.map((pass) => (
              <div
                key={pass.id}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    pass.is_checked_in ? "bg-zinc-800 text-zinc-400" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {pass.is_checked_in ? "Checked In" : "Valid Pass"}
                  </span>
                  <h4 className="text-sm font-bold text-white break-words">{pass.events?.title}</h4>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {new Date(pass.events?.event_date).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    {pass.events?.location}
                  </p>
                </div>

                <div className="bg-white p-2 rounded-xl shrink-0">
                  <QRCode value={`EVENTHUB:${pass.id}`} size={64} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}