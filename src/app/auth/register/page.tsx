"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", { email, password });
      setMsg(res.data.message + (res.data.previewUrl ? ` (Check console for ethereal email URL)` : ""));
      console.log("OTP Email URL:", res.data.previewUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      login(res.data.accessToken, res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back home
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold mb-2">Create an Account</h2>
        <p className="text-zinc-400 mb-8">Start your intelligent career journey today.</p>

        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}
        {msg && <div className="mb-4 p-3 bg-indigo-500/20 border border-indigo-500/50 rounded-lg text-indigo-200 text-sm">{msg}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
              <input 
                type="password" 
                required 
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Enter 6-digit OTP</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-center text-xl tracking-[0.5em]"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-zinc-500">
          Already have an account? <Link href="/auth/login" className="text-indigo-400 hover:underline">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}
