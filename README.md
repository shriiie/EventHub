# 🎟️ EventHub

> Campus Event Management & Live Gate Verification Platform.

A full-stack, mobile-responsive web app built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. It replaces manual event spreadsheets and paper badges with instant digital QR passes verified directly at college gates using smartphone cameras.

---

## 🌟 Live Demo

- **Live URL:** [https://event-hub-drab-nine.vercel.app](https://event-hub-drab-nine.vercel.app)

---

## 🚀 Key Features

* **Instant Digital Pass:** Generates a real-time QR pass with dynamic ticket codes upon event RSVP.
* **Role-Based Access (Student / Organizer):**
  * **Students:** Explore campus events, filter by categories, and view active tickets in *My Passes*.
  * **Organizers:** Host new events, set seat capacity, and define venue details.
* **Live Capacity Tracker:** Real-time seat availability indicator that locks registration when seats are full.
* **Camera Gate Scanner:** Security volunteers can open the `/verify` portal on any phone to scan QR passes and prevent duplicate entry.
* **Mobile-First UI:** Dark-mode spotlight UI with smooth Framer Motion interactions and zero layout shifting on phones.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React, TypeScript
* **Styling & UI:** Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti
* **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
* **QR Processing:** `qrcode.react`, `@zxing/browser`
* **Deployment:** Vercel

---

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/shriya22654/EventHub.git](https://github.com/shriya22654/EventHub.git)
   cd EventHub
2. **Install packages:**
   ```bash
   npm install
2. **Install packages:**
   ```bash
   npm install
   ```
3. **Set environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Run locally:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
