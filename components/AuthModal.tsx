"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { X, Lock, Mail, User, AlertCircle, KeyRound, MailCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ORGANIZER_SECRET_KEY = "CAMPUS2026";

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "organizer">("student");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State for email confirmation banner
  const [showConfirmEmailNotice, setShowConfirmEmailNotice] = useState(false);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setShowConfirmEmailNotice(false);
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        if (role === "organizer" && passcode.trim() !== ORGANIZER_SECRET_KEY) {
          throw new Error("Invalid Organizer Security Code! Only authorized club leads can host.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role,
            },
          },
        });

        if (error) throw error;

        // Case 1: Agar "Confirm Email" OFF hai, Supabase turant session de deta hai
        if (data.session) {
          await supabase.auth.setSession(data.session);
          onSuccess();
          handleModalClose();
          window.location.reload();
        } 
        // Case 2: Agar "Confirm Email" ON hai, session null hoga aur user create hoga
        else if (data.user && !data.session) {
          setShowConfirmEmailNotice(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          onSuccess();
          handleModalClose();
          window.location.reload();
        }
      }
    } catch (err: any) {
      if (err.message.includes("Email not confirmed")) {
        setErrorMsg("Your email is not confirmed yet. Please verify the link in your inbox!");
      } else {
        setErrorMsg(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#FF5A36]/15 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0C0C0F]/95 backdrop-blur-2xl p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]"
      >
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 p-1.5 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {showConfirmEmailNotice ? (
          /* Notice displayed when email confirmation is active */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-[#E8481F]/15 border border-[#FF6B45]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFB199]">
              <MailCheck className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Verify Your Email</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed px-2">
                We've sent a verification link to <strong className="text-white">{email}</strong>. 
                Please click the link in your inbox to activate your account, then come back and sign in.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmEmailNotice(false);
                  setIsSignUp(false); // Switch to sign-in tab
                }}
                className="w-full bg-gradient-to-b from-[#FF6B45] to-[#E8481F] text-white text-xs font-medium py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Normal Sign-In / Sign-Up Form */
          <>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#FFB199] bg-[#E8481F]/15 border border-[#E8481F]/25 rounded-full px-2.5 py-1 mb-3">
                Campus ID
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {isSignUp ? "Create account" : "Welcome back"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {isSignUp
                  ? "Join EventHub to claim digital entry passes or host verified campus events."
                  : "Sign in to manage and view your active passes."}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Aryan Sharma"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                          role === "student"
                            ? "bg-white/[0.08] border-white/20 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        🎓 Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("organizer")}
                        className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                          role === "organizer"
                            ? "bg-[#E8481F]/20 border-[#FF6B45]/40 text-[#FFB199] shadow-sm"
                            : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ⚡ Club Lead
                      </button>
                    </div>
                  </div>

                  {role === "organizer" && (
                    <div>
                      <label className="block text-[11px] font-medium text-[#FFB199] mb-1.5">
                        Organizer Security Passcode
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B45]" />
                        <input
                          type="password"
                          required
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="Enter club secret key"
                          className="w-full bg-[#E8481F]/5 border border-[#FF6B45]/30 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36] transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Contact campus admin to receive the key.</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@campus.edu"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FF5A36]/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-b from-[#FF6B45] to-[#E8481F] text-white text-sm font-medium py-2.5 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_8px_20px_-6px_rgba(232,72,31,0.65)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_12px_24px_-6px_rgba(232,72,31,0.8)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}