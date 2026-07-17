"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconMail,
  IconLoader2,
  IconArrowRight,
  IconArrowLeft,
  IconKey,
  IconSparkles,
  IconCheck,
} from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("If your email is registered, you will receive a password reset link");
    } catch (err) {
      toast.error(err.message || "Failed to request password reset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left Panel — Branding (Desktop) ──────────────── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-noir">
        <img
          src="/auth-luxury.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/50 to-noir/90" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl text-ivory tracking-tight">
              RHOSEATTE
            </span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 border border-white/10 bg-white/5 backdrop-blur-sm">
              <IconKey className="h-3 w-3 text-gold" stroke={1.5} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-medium">
                Account Recovery
              </span>
            </div>
            <h1 className="font-display text-4xl xl:text-5xl text-ivory tracking-tight mb-6 leading-[1.1]">
              Reset Your
              <br />
              <em className="luxe-italic text-gold">Password</em>
            </h1>
            <span className="block h-px w-16 bg-gradient-to-r from-gold to-transparent mb-6" />
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">
              Don&apos;t worry. Enter your email address and we&apos;ll send you
              a secure link to create a new password.
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            &copy; {new Date().getFullYear()} RHOSEATTE
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ───────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 lg:py-0">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl text-noir tracking-tight">
                RHOSEATTE
              </span>
            </Link>
          </div>

          {/* Back link */}
          <Link
            href="/auth?tab=login"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-noir transition-colors mb-10"
          >
            <IconArrowLeft className="h-3.5 w-3.5" stroke={1.5} />
            Back to Sign In
          </Link>

          {sent ? (
            /* ── Success State ──────────────────────────── */
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-ivory border border-line">
                <IconCheck className="h-8 w-8 text-gold" stroke={1.5} />
              </div>
              <h2 className="font-display text-2xl text-noir tracking-tight mb-3">
                Check Your Email
              </h2>
              <p className="text-stone text-[13px] font-light leading-relaxed mb-10 max-w-sm mx-auto">
                If an account exists with <span className="text-noir font-medium">{email}</span>,
                we&apos;ve sent a password reset link. Please check your inbox.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full h-14 bg-noir text-ivory text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2.5 hover:bg-gold transition-all duration-500"
              >
                Send Again
                <IconArrowRight className="h-4 w-4" stroke={1.5} />
              </button>
              <p className="text-center text-[13px] text-stone font-light mt-6">
                <Link href="/auth?tab=login" className="text-noir font-medium hover:text-gold transition-colors">
                  Back to Sign In
                </Link>
              </p>
            </div>
          ) : (
            /* ── Form State ─────────────────────────────── */
            <>
              <div className="mb-8">
                <h2 className="font-display text-2xl text-noir tracking-tight mb-1">
                  Forgot Password
                </h2>
                <p className="text-[13px] text-stone font-light">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full h-14 pl-12 pr-4 bg-ivory border border-line text-noir text-[13px] font-light placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full h-14 bg-noir text-ivory text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2.5 hover:bg-gold disabled:opacity-50 transition-all duration-500"
                >
                  {submitting || loading ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" stroke={1.5} />
                  ) : (
                    <>
                      Send Reset Link
                      <IconArrowRight className="h-4 w-4" stroke={1.5} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[13px] text-stone font-light mt-8">
                Remember your password?{" "}
                <Link href="/auth?tab=login" className="text-noir font-medium hover:text-gold transition-colors">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
