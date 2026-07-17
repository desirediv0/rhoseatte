"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconSparkles,
} from "@tabler/icons-react";

/* ─── Password Strength ─────────────────────────────────── */
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "text-red-500", "text-orange-500", "text-gold", "text-green-600"];

/* ─── Auth Form ─────────────────────────────────────────── */
function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const tabFromUrl = searchParams.get("tab") || "login";
  const redirect = searchParams.get("redirect");
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => { setActiveTab(tabFromUrl); }, [tabFromUrl]);
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect ? decodeURIComponent(redirect) : "/");
    }
  }, [isAuthenticated, router, redirect]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams({ tab });
    if (redirect) params.set("redirect", redirect);
    router.push(`/auth?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left Panel — Branding (Desktop) ──────────────── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-noir">
        {/* Background image */}
        <img
          src="/auth-luxury.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/50 to-noir/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl text-ivory tracking-tight">
              RHOSEATTE
            </span>
          </Link>

          {/* Center text */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 border border-white/10 bg-white/5 backdrop-blur-sm">
              <IconSparkles className="h-3 w-3 text-gold" stroke={1.5} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-medium">
                The Maison
              </span>
            </div>
            <h1 className="font-display text-4xl xl:text-5xl text-ivory tracking-tight mb-6 leading-[1.1]">
              Where Luxury
              <br />
              Meets <em className="luxe-italic text-gold">Artistry</em>
            </h1>
            <span className="block h-px w-16 bg-gradient-to-r from-gold to-transparent mb-6" />
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">
              Join an exclusive circle of fragrance connoisseurs.
              Access rare collections, private launches, and personalized concierge services.
            </p>
          </div>

          {/* Bottom */}
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

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-ivory mb-10">
            {[
              { key: "login", label: "Sign In" },
              { key: "register", label: "Register" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex-1 py-3 text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-500 ${
                  activeTab === key
                    ? "bg-white text-noir shadow-sm"
                    : "text-stone hover:text-noir"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white">
            {activeTab === "login" && (
              <LoginForm
                onSwitch={() => handleTabChange("register")}
                redirect={redirect}
              />
            )}
            {activeTab === "register" && (
              <RegisterForm
                onSwitch={() => handleTabChange("login")}
                redirect={redirect}
              />
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] text-stone mt-8 font-light">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-noir hover:text-gold transition-colors underline underline-offset-2">Terms</Link>
            {" "}&{" "}
            <Link href="/privacy-policy" className="text-noir hover:text-gold transition-colors underline underline-offset-2">Privacy Policy</Link>
          </p>
        </div>
      </div>

    </div>
  );
}

/* ─── Login Form ────────────────────────────────────────── */
function LoginForm({ onSwitch, redirect }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required"); return; }
    setIsSubmitting(true);
    try {
      await login(email, password);
      sessionStorage.setItem("justLoggedIn", "true");
      toast.success("Welcome back!");
      const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");
      setTimeout(() => router.push(returnUrl ? decodeURIComponent(returnUrl) : "/"), 300);
    } catch (error) {
      const msg = error.message || "Login failed.";
      if (msg.toLowerCase().includes("verify")) {
        toast.error(<div>{msg}{" "}<Link href="/resend-verification" className="font-medium underline text-black">Resend</Link></div>);
      } else { toast.error(msg); }
    } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-noir tracking-tight mb-1">Welcome back</h2>
        <p className="text-[13px] text-stone font-light">Sign in to access your account</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Email</label>
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

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-stone font-medium">Password</label>
          <Link href="/forgot-password" className="text-[11px] text-stone hover:text-gold transition-colors font-light">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full h-14 pl-12 pr-12 bg-ivory border border-line text-noir text-[13px] font-light placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-noir transition-colors"
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" stroke={1.5} /> : <IconEye className="h-4 w-4" stroke={1.5} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-noir text-ivory text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2.5 hover:bg-gold disabled:opacity-50 transition-all duration-500"
      >
        {isSubmitting ? (
          <IconLoader2 className="h-4 w-4 animate-spin" stroke={1.5} />
        ) : (
          <>
            Sign In
            <IconArrowRight className="h-4 w-4" stroke={1.5} />
          </>
        )}
      </button>

      {/* Switch */}
      <p className="text-center text-[13px] text-stone font-light pt-2">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-noir font-medium hover:text-gold transition-colors">
          Create one
        </button>
      </p>
    </form>
  );
}

/* ─── Register Form ─────────────────────────────────────── */
function RegisterForm({ onSwitch, redirect }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.name.trim().length < 3) { toast.error("Name should be at least 3 characters"); return false; }
    if (!formData.phone || formData.phone.length < 10) { toast.error("Please enter a valid phone number"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error("Please enter a valid email"); return false; }
    if (formData.password.length < 8) { toast.error("Password should be at least 8 characters"); return false; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const res = await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
      const payload = res?.data ?? res;
      const emailSent = payload?.emailSent !== false;
      if (payload?.debugOtp) {
        toast.success(`Verification code: ${payload.debugOtp}`, { duration: 25000 });
      } else if (emailSent) {
        toast.success("Account created! Check your email for OTP.", { duration: 4000 });
      } else {
        toast.warning(res?.message || "Account created but email could not be sent.");
      }
      localStorage.setItem("registeredEmail", formData.email);
      setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`), 600);
    } catch (error) {
      toast.error(error.message || "Registration failed.");
    } finally { setIsSubmitting(false); }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const fields = [
    { label: "Full Name", name: "name", type: "text", icon: IconUser, placeholder: "John Doe" },
    { label: "Email", name: "email", type: "email", icon: IconMail, placeholder: "you@example.com" },
    { label: "Phone", name: "phone", type: "tel", icon: IconPhone, placeholder: "+91 9876543210" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-noir tracking-tight mb-1">Create account</h2>
        <p className="text-[13px] text-stone font-light">Join the RHOSEATTE family</p>
      </div>

      {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
        <div key={name}>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">{label}</label>
          <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
              placeholder={placeholder}
              className="w-full h-14 pl-12 pr-4 bg-ivory border border-line text-noir text-[13px] font-light placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
            />
          </div>
        </div>
      ))}

      {/* Password */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Password</label>
        <div className="relative">
          <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Min 8 characters"
            className="w-full h-14 pl-12 pr-12 bg-ivory border border-line text-noir text-[13px] font-light placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-noir transition-colors"
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" stroke={1.5} /> : <IconEye className="h-4 w-4" stroke={1.5} />}
          </button>
        </div>
        {/* Strength indicator */}
        {formData.password && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 transition-all duration-500 ${
                    i <= passwordStrength
                      ? passwordStrength <= 1 ? "bg-red-500"
                        : passwordStrength === 2 ? "bg-orange-500"
                        : passwordStrength === 3 ? "bg-gold"
                        : "bg-green-600"
                      : "bg-line"
                  }`}
                />
              ))}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-medium ${strengthColors[passwordStrength]}`}>
              {strengthLabels[passwordStrength]}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Confirm Password</label>
        <div className="relative">
          <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
            className="w-full h-14 pl-12 pr-12 bg-ivory border border-line text-noir text-[13px] font-light placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
          />
          {formData.confirmPassword && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              {formData.password === formData.confirmPassword ? (
                <IconCheck className="h-4 w-4 text-green-600" stroke={2} />
              ) : (
                <IconX className="h-4 w-4 text-red-500" stroke={2} />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-noir text-ivory text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2.5 hover:bg-gold disabled:opacity-50 transition-all duration-500"
      >
        {isSubmitting ? (
          <IconLoader2 className="h-4 w-4 animate-spin" stroke={1.5} />
        ) : (
          <>
            Create Account
            <IconArrowRight className="h-4 w-4" stroke={1.5} />
          </>
        )}
      </button>

      {/* Switch */}
      <p className="text-center text-[13px] text-stone font-light pt-2">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-noir font-medium hover:text-gold transition-colors">
          Sign In
        </button>
      </p>
    </form>
  );
}

/* ─── Page Export ───────────────────────────────────────── */
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <IconLoader2 className="h-6 w-6 animate-spin text-gold" stroke={1.5} />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
