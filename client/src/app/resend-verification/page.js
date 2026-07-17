"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconMail,
  IconLoader2,
  IconArrowRight,
  IconArrowLeft,
  IconSend,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";

export default function ResendVerificationPage() {
  const { resendVerification } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("registeredEmail");
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email address"); return; }

    setStatus("submitting");
    try {
      await resendVerification(email);
      setStatus("success");
      toast.success("OTP sent! Redirecting...", { duration: 3000 });
      if (typeof window !== "undefined") localStorage.removeItem("registeredEmail");
      setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`), 1500);
    } catch (error) {
      setStatus("error");
      toast.error(error.message || "Failed to send verification email");
      setTimeout(() => setStatus("idle"), 500);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-noir">
        <img src="/auth-luxury.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/50 to-noir/90" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl text-ivory tracking-tight">RHOSEATTE</span>
          </Link>
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 border border-white/10 bg-white/5 backdrop-blur-sm">
              <IconSend className="h-3 w-3 text-gold" stroke={1.5} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-medium">Resend Code</span>
            </div>
            <h1 className="font-display text-4xl xl:text-5xl text-ivory tracking-tight mb-6 leading-[1.1]">
              Didn&apos;t Receive<br />the <em className="luxe-italic text-gold">Code?</em>
            </h1>
            <span className="block h-px w-16 bg-gradient-to-r from-gold to-transparent mb-6" />
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">
              No worries. Enter your email and we&apos;ll send a new verification code right away.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">&copy; {new Date().getFullYear()} RHOSEATTE</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 lg:py-0">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl text-noir tracking-tight">RHOSEATTE</span>
            </Link>
          </div>

          <Link href="/auth?tab=login" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-noir transition-colors mb-10">
            <IconArrowLeft className="h-3.5 w-3.5" stroke={1.5} /> Back to Sign In
          </Link>

          {status === "success" ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-ivory border border-line">
                <IconCheck className="h-8 w-8 text-gold" stroke={1.5} />
              </div>
              <h2 className="font-display text-2xl text-noir tracking-tight mb-3">OTP Sent</h2>
              <p className="text-stone text-[13px] font-light leading-relaxed mb-10 max-w-sm mx-auto">
                A new verification code has been sent to <span className="text-noir font-medium">{email}</span>.
                Redirecting you now...
              </p>
              <Link
                href={`/verify-otp?email=${encodeURIComponent(email)}`}
                className="w-full h-14 bg-noir text-ivory text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2.5 hover:bg-gold transition-all duration-500"
              >
                Enter OTP <IconArrowRight className="h-4 w-4" stroke={1.5} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display text-2xl text-noir tracking-tight mb-1">Resend OTP</h2>
                <p className="text-[13px] text-stone font-light">We&apos;ll send a new 6-digit code to your email</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Email</label>
                  <div className="relative">
                    <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                      className="w-full h-14 pl-12 pr-4 bg-ivory border border-line text-noir text-[13px] font-light placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={status === "submitting"}
                  className="w-full h-14 bg-noir text-ivory text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2.5 hover:bg-gold disabled:opacity-50 transition-all duration-500"
                >
                  {status === "submitting" ? <IconLoader2 className="h-4 w-4 animate-spin" stroke={1.5} /> : <>Send OTP <IconArrowRight className="h-4 w-4" stroke={1.5} /></>}
                </button>
              </form>

              <p className="text-center text-[13px] text-stone font-light mt-8">
                <Link href="/auth?tab=login" className="text-noir font-medium hover:text-gold transition-colors">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
