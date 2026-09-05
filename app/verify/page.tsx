"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Html5Qrcode } from "html5-qrcode";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ArrowLeft,
  Lock,
  Camera,
  CameraOff,
} from "lucide-react";
import Link from "next/link";

export default function VerifyTicket() {
  const [ticketInput, setTicketInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Camera scanner state
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Role check: Gate Portal access
  const checkGateAuth = useCallback(async () => {
    setAuthChecking(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "organizer" || session.user.user_metadata?.role === "organizer") {
        setIsOrganizer(true);
      }
    }
    setAuthChecking(false);
  }, []);

  useEffect(() => {
    checkGateAuth();
  }, [checkGateAuth]);

  // Core verification function
  const runVerification = async (rawCode: string) => {
    if (!rawCode.trim()) return;

    setLoading(true);
    setResult(null);

    let cleanId = rawCode.trim();
    if (cleanId.includes(":")) {
      cleanId = cleanId.split(":")[1].trim();
    }

    try {
      const { data, error } = await supabase.rpc("check_in_ticket", { ticket_uuid: cleanId });

      if (error || !data) {
        setResult({
          success: false,
          status: "INVALID",
          message: "Pass not found or unrecognized QR payload.",
        });
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setResult({
        success: false,
        status: "INVALID",
        message: err.message || "An error occurred during ticket check-in.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(ticketInput);
  };

  // Camera start / stop handling
  const startCamera = async () => {
    setIsScanning(true);
    setResult(null);

    // Short timeout so the DOM element #reader is mounted
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // Prefer back camera on mobile
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success QR detection
            stopCamera();
            setTicketInput(decodedText);
            runVerification(decodedText);
          },
          () => {
            // Ignore scan parse frame errors
          }
        );
      } catch (err) {
        console.error("Camera access error:", err);
        setIsScanning(false);
      }
    }, 150);
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop camera:", err);
      }
    }
    setIsScanning(false);
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#08080A] text-zinc-400 flex items-center justify-center text-xs tracking-wide">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-ping" />
          Verifying organizer credentials...
        </div>
      </main>
    );
  }

  if (!isOrganizer) {
    return (
      <main className="relative min-h-screen bg-[#08080A] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="relative max-w-sm w-full rounded-3xl border border-white/[0.08] bg-[#0C0C0F] p-8 shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 mb-5">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Access Restricted</h1>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
            The Gate Portal is reserved for club organizers to scan and verify attendee passes.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 border border-white/[0.1] bg-white/[0.04] text-xs px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#08080A] text-zinc-200 p-6 md:p-12 flex flex-col items-center selection:bg-[#FF5A36]/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-[420px] w-[500px] rounded-full bg-[#FF5A36]/[0.12] blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 h-[350px] w-[450px] rounded-full bg-[#B33A22]/[0.08] blur-[130px]" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mb-7"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>

        <div className="rounded-3xl border border-white/[0.1] bg-[#0C0C0F]/90 backdrop-blur-2xl p-7 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-7 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#E8481F]/15 text-[#FFB199] border border-[#E8481F]/25">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Gate Pass Verifier</h1>
                <p className="text-xs text-zinc-500">Instant camera QR & pass entry check</p>
              </div>
            </div>

            <button
              onClick={isScanning ? stopCamera : startCamera}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isScanning
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]"
              }`}
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" /> Stop Scan
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-[#FF6B45]" /> Open Camera
                </>
              )}
            </button>
          </div>

          {/* Camera Viewport */}
          {isScanning && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-white/[0.1] bg-black relative">
              <div id="reader" className="w-full" />
              <div className="p-2.5 bg-[#0C0C0F] text-center border-t border-white/[0.08]">
                <p className="text-[11px] text-zinc-400">
                  Align attendee QR pass within the viewfinder frame.
                </p>
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Pass ID / Ticket Payload
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="Paste UUID or scan with camera above..."
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.05] transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-b from-[#FF6B45] to-[#E8481F] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  {loading ? "Checking..." : "Verify"}
                </button>
              </div>
            </div>
          </form>

          {/* Verification Results Output */}
          {result && (
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              {result.status === "VERIFIED" && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Pass Valid — Entry Approved</span>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-emerald-500/20">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Attendee:</span>
                      <strong className="text-white">{result.data?.user_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="text-zinc-300">{result.data?.user_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Event:</span>
                      <strong className="text-white">{result.data?.event_title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Checked In:</span>
                      <span className="text-emerald-400 font-mono text-[11px]">
                        {new Date(result.data?.checked_in_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {result.status === "ALREADY_USED" && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Duplicate Entry Denied!</span>
                  </div>
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    This ticket was already checked in earlier. Re-admission is disallowed.
                  </p>
                  <div className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-amber-500/20">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Pass Holder:</span>
                      <strong className="text-white">{result.data?.user_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">First Scanned At:</span>
                      <span className="text-amber-400 font-mono text-[11px]">
                        {new Date(result.data?.checked_in_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {result.status === "INVALID" && (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-400">Pass Not Recognized</p>
                    <p className="text-[11px] text-rose-300/80 mt-1 leading-relaxed">{result.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}