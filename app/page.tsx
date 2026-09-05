"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RsvpModal from "@/components/RSVPmodel";
import { Calendar, MapPin, Users, Tag } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  location: string;
  capacity: number;
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Page load hone par Supabase se events lana
  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error.message);
      } else if (data) {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            EventHub 🎟️
          </h1>
          <p className="mt-1 text-slate-400 text-sm md:text-base">
            Discover campus events and get your instant digital entry pass.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-slate-200">
          Upcoming Events
        </h2>

        {loading ? (
          <div className="text-center py-16 text-slate-500">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-base">No events found right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Tag className="w-3 h-3" />
                      {event.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Cap: {event.capacity}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {event.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  {/* Click karne par modal open hoga */}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    RSVP / Get Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP Modal Popup */}
      {selectedEvent && (
        <RsvpModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </main>
  );
}