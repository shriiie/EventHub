"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import RsvpModal from "@/components/RSVPmodel";
import CreateEventModal from "@/components/CreateEventModal";
import { Calendar, MapPin, Users, Tag, Plus, Search } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  location: string;
  capacity: number;
}

const CATEGORIES = ["All", "Tech", "Cultural", "Sports", "Academic", "Workshop"];

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Search aur Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Client-side real-time filtering
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            EventHub 🎟️
          </h1>
          <p className="mt-1 text-slate-400 text-sm md:text-base">
            Discover campus events and get your instant digital entry pass.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Host Event
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, description, or venue..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Section Title with Live Count */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xl font-semibold text-slate-200">
            {selectedCategory === "All" ? "All Events" : `${selectedCategory} Events`}
          </h2>
          <span className="text-xs text-slate-500">
            Showing {filteredEvents.length} of {events.length}
          </span>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-300 font-medium">No matching events found</p>
            <p className="text-slate-500 text-xs mt-1">
              Try adjusting your search query or switching category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
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

      {/* RSVP Modal */}
      {selectedEvent && (
        <RsvpModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onEventCreated={fetchEvents}
      />
    </main>
  );
}