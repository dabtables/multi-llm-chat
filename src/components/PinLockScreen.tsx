"use client";

import React, { useState, useEffect } from "react";
import { LockKeyhole, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";

interface PinLockScreenProps {
  onSuccess: () => void;
}

export default function PinLockScreen({ onSuccess }: PinLockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleVerify(pinToSubmit: string) {
    if (!pinToSubmit || pinToSubmit.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToSubmit }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || "Incorrect PIN code. Try again.");
        triggerShake();
        setPin("");
      }
    } catch {
      setError("Connection error. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleKeyPress(num: string) {
    if (loading) return;
    setError(null);
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Auto-verify on 4 digits for convenience
        handleVerify(nextPin);
      }
    }
  }

  function handleDelete() {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }

  function handleClear() {
    if (loading) return;
    setPin("");
    setError(null);
  }

  // Allow native keyboard typing
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter" && pin.length > 0) {
        handleVerify(pin);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm transition-all duration-300 ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Glow behind card */}
        <div className="relative">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-300/40 via-purple-300/30 to-pink-300/40 rounded-3xl blur-xl opacity-70" />

          {/* Main Card */}
          <div className="relative glass-card rounded-3xl p-8 border border-white/60 shadow-xl shadow-purple-500/5">
            {/* Header Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-200/60 flex items-center justify-center text-violet-600 mb-4 shadow-sm">
                <LockKeyhole className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                Enter Access PIN
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                Authentication required. Enter your passcode to unlock the workspace.
              </p>
            </div>

            {/* PIN Dots Indicator */}
            <div className="flex justify-center items-center gap-3 my-6">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      filled
                        ? "bg-violet-600 scale-110 shadow-sm shadow-violet-500/30"
                        : "bg-slate-200/80 border border-slate-300/60"
                    }`}
                  />
                );
              })}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center gap-1.5 justify-center text-xs text-rose-500 bg-rose-50/80 border border-rose-200/70 py-1.5 px-3 rounded-lg animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(String(num))}
                  disabled={loading}
                  className="h-12 rounded-xl text-base font-medium text-slate-700 bg-white/60 hover:bg-white hover:text-slate-900 border border-slate-200/60 hover:border-violet-200 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="h-12 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-white/50 active:scale-95 transition-all flex items-center justify-center"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                disabled={loading}
                className="h-12 rounded-xl text-base font-medium text-slate-700 bg-white/60 hover:bg-white hover:text-slate-900 border border-slate-200/60 hover:border-violet-200 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleVerify(pin)}
                disabled={loading || pin.length === 0}
                className={`h-12 rounded-xl text-xs font-medium active:scale-95 transition-all flex items-center justify-center ${
                  pin.length > 0
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20 hover:bg-violet-700"
                    : "text-slate-300 hover:text-slate-400"
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Hint / Helper */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Configured in .env as <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">APP_PIN</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
