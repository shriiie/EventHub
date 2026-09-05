"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import RsvpModal from "@/components/RsvpModal";
import CreateEventModal from "@/components/CreateEventModal";
import { Calendar, MapPin, Tag, Plus, Search, ShieldCheck, QrCode } from "lucide-react";
import Link from "next/link";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  location: string;
  capacity: number;
  registrations_count?: number;
}

const CATEGORIES = ["All", "Tech", "Cultural", "Sports", "Academic", "Workshop"];

/* ---------- Brand mark: a torn ticket stub, not a generic icon-in-a-box ---------- */
function Logomark() {
  return (
    <div className="relative w-8 h-8 shrink-0">
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <path
          d="M4 10c0-1.1.9-2 2-2h20a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 0 5v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2.5 2.5 0 0 0 0-5v-3Z"
          fill="url(#ticketGrad)"
        />
        <line x1="16" y1="8" x2="16" y2="24" stroke="#08080A" strokeWidth="1.5" strokeDasharray="2 2" />
        <defs>
          <linearGradient id="ticketGrad" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB199" />
            <stop offset="1" stopColor="#E8481F" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#08080A]" />
      </span>
    </div>
  );
}

/* ---------- Cursor-tracked spotlight surface, reused by cards + the ticket mock ---------- */
function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl transition-colors duration-300 hover:border-white/[0.16] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(480px circle at var(--x, 50%) var(--y, 50%), rgba(255,90,54,0.14), transparent 65%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ---------- Hero visual: a tilting mock of the actual digital pass users get ---------- */
function TicketPreview({ headline }: { headline: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // Fixed pseudo-QR pattern so server/client markup always matches (no Math.random at render)
  const qrPattern = [
    1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1,
  ];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  };

  return (
    <div style={{ perspective: "1200px" }}>
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="relative w-full max-w-sm rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.015] backdrop-blur-xl p-6 shadow-[0_30px_80px_-20px_rgba(232,72,31,0.45)]"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#FFB199] bg-[#E8481F]/15 border border-[#E8481F]/25 rounded-full px-2.5 py-1">
            Digital pass
          </span>
          <span className="text-[11px] text-zinc-500 tabular-nums">#EH-4471</span>
        </div>

        <p className="text-xs text-zinc-500 mb-1">You're going to</p>
        <h3 className="text-xl font-semibold text-white tracking-tight leading-snug mb-6">
          {headline}
        </h3>

        <div
          className="w-full border-t border-dashed border-white/[0.15] relative mb-6"
          aria-hidden
        >
          <span className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#08080A] border border-white/[0.1]" />
          <span className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#08080A] border border-white/[0.1]" />
        </div>

        <div className="flex items-center gap-4">
          <div className="grid grid-cols-6 gap-[3px] w-20 h-20 shrink-0 bg-white rounded-md p-1.5">
            {qrPattern.map((filled, i) => (
              <span
                key={i}
                className={`rounded-[1px] ${filled ? "bg-black" : "bg-transparent"}`}
              />
            ))}
          </div>
          <div className="text-xs text-zinc-500 leading-relaxed">
            <p className="text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-zinc-500" />
              Scan at the gate
            </p>
            Show this pass at entry — Gate Portal verifies it instantly, no printouts.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    // Supabase se events aur unke corresponding registrations count fetch karna
    const { data, error } = await supabase
      .from("events")
      .select("*, registrations(count)")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error.message);
    } else if (data) {
      const formattedEvents = data.map((item: any) => ({
        ...item,
        registrations_count: item.registrations?.[0]?.count || 0,
      }));
      setEvents(formattedEvents);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [events, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const openSpots = events.reduce(
      (sum, e) => sum + Math.max(0, e.capacity - (e.registrations_count || 0)),
      0
    );
    const categoriesLive = new Set(events.map((e) => e.category)).size;
    return { openSpots, categoriesLive };
  }, [events]);

  const marqueeItems = useMemo(() => {
    const base =
      events.length > 0
        ? events.map((e) => e.title)
        : ["Web3 & AI Hackathon", "Prastuti Cultural Fest", "Inter-Dept Sports Meet", "Design Workshop"];
    return [...base, ...base];
  }, [events]);

  return (
    <main className="relative min-h-screen bg-[#08080A] text-zinc-200 selection:bg-[#FF5A36]/30 overflow-x-hidden">
      {/* Ambient mesh + grain */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-56 left-[10%] h-[560px] w-[720px] rounded-full bg-[#FF5A36]/[0.16] blur-[140px]" />
        <div className="absolute top-[15%] -right-56 h-[480px] w-[560px] rounded-full bg-[#B33A22]/[0.12] blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[380px] w-[560px] rounded-full bg-[#FF5A36]/[0.06] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative px-6 md:px-12">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto flex items-center justify-between py-7"
        >
          <div className="flex items-center gap-2.5">
            <Logomark />
            <span className="text-[15px] font-semibold text-white tracking-tight">EventHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] text-zinc-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-200"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Gate Portal
            </Link>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-b from-[#FF6B45] to-[#E8481F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_10px_24px_-8px_rgba(232,72,31,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_14px_30px_-8px_rgba(232,72,31,0.85)] transition-shadow duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Host Event
            </motion.button>
          </div>
        </motion.nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center pt-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.05] bg-gradient-to-br from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Every campus event.
              <br />
              One tap to get in.
            </h1>
            <p className="mt-5 text-zinc-500 text-base max-w-md leading-relaxed">
              Browse what's happening around campus and walk in with a QR pass —
              no forms, no printouts, no waiting at the gate.
            </p>

            <div className="mt-8 relative max-w-md group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#FF6B45] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event, description, or venue..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,90,54,0.1)] transition-all duration-200"
              />
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm">
              <div>
                <span className="text-white font-semibold tabular-nums">{events.length}</span>
                <span className="text-zinc-500"> events live</span>
              </div>
              <div className="w-px h-4 bg-white/[0.08]" />
              <div>
                <span className="text-white font-semibold tabular-nums">{stats.openSpots}</span>
                <span className="text-zinc-500"> spots open</span>
              </div>
              <div className="w-px h-4 bg-white/[0.08]" />
              <div>
                <span className="text-white font-semibold tabular-nums">{stats.categoriesLive}</span>
                <span className="text-zinc-500"> categories</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <TicketPreview headline={events[0]?.title || "your next campus event"} />
          </motion.div>
        </section>

        {/* Marquee strip */}
        <div className="border-y border-white/[0.06] py-3 mb-14">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <span className="text-[11px] font-medium text-zinc-600 whitespace-nowrap shrink-0 pr-4 border-r border-white/[0.08]">
              Happening now
            </span>
            {/* Clipped viewport — the label above lives outside this, so the
                animated track sliding left is masked instead of overlapping it */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="flex gap-8 whitespace-nowrap w-max"
                style={{ animation: "marquee 22s linear infinite" }}
              >
                {marqueeItems.map((title, i) => (
                  <span key={i} className="text-sm text-zinc-500 flex items-center gap-2 shrink-0">
                    <span className="w-1 h-1 rounded-full bg-[#FF5A36] shrink-0" />
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        <div id="events" className="max-w-6xl mx-auto space-y-8 pb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-zinc-200">
              {selectedCategory === "All" ? "All events" : `${selectedCategory} events`}
            </h2>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="relative px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer"
                  >
                    {active && (
                      <motion.div
                        layoutId="categoryHighlight"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 bg-white/[0.09] border border-white/[0.1] rounded-lg"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end -mt-4">
            <span className="text-xs text-zinc-600 tabular-nums">
              {filteredEvents.length} of {events.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[260px] rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden relative"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white/[0.02] rounded-2xl border border-white/[0.06]"
            >
              <p className="text-zinc-300 font-medium text-sm">No matching events</p>
              <p className="text-zinc-600 text-xs mt-1.5">
                Try adjusting your search query or switching category filters.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategory + searchQuery}
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredEvents.map((event) => {
                const booked = event.registrations_count || 0;
                const remaining = Math.max(0, event.capacity - booked);
                const isFull = remaining === 0;
                const urgent = !isFull && remaining <= 5;

                return (
                  <motion.div key={event.id} variants={cardVariants}>
                    <SpotlightCard className="p-6 flex flex-col justify-between h-full hover:-translate-y-1 transition-transform duration-300">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                            <Tag className="w-3 h-3 text-zinc-500" />
                            {event.category}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              isFull ? "text-rose-400" : urgent ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              {!isFull && (
                                <span
                                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                                    urgent ? "bg-amber-400" : "bg-emerald-400"
                                  }`}
                                />
                              )}
                              <span
                                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                                  isFull ? "bg-rose-400" : urgent ? "bg-amber-400" : "bg-emerald-400"
                                }`}
                              />
                            </span>
                            {isFull ? "Full" : `${remaining} left`}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 tracking-tight leading-snug">
                          {event.title}
                        </h3>

                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-5">
                          {event.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Calendar className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span>
                            {new Date(event.event_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <motion.button
                          whileTap={!isFull ? { scale: 0.98 } : undefined}
                          disabled={isFull}
                          onClick={() => setSelectedEvent(event)}
                          className="w-full mt-4 bg-white text-black disabled:bg-white/[0.05] disabled:text-zinc-600 disabled:cursor-not-allowed font-medium py-2.5 rounded-xl text-sm transition-colors duration-200 hover:bg-zinc-200 cursor-pointer"
                        >
                          {isFull ? "Registration closed" : "RSVP / Get ticket"}
                        </motion.button>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {selectedEvent && (
            <RsvpModal
              event={selectedEvent}
              onClose={() => {
                setSelectedEvent(null);
                fetchEvents();
              }}
            />
          )}
        </AnimatePresence>

        <CreateEventModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onEventCreated={fetchEvents}
        />
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}