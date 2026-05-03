"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e?: React.FormEvent, isRetry = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    if (!isRetry) {
      setError("");
      setMsg("");
    }
    
    try {
      // 1. Create user in Firebase
      const { createUserWithEmailAndPassword, sendEmailVerification, signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      try {
        await sendEmailVerification(userCredential.user);
        setMsg("Registration successful! Verification email sent. Please check your inbox and verify your email before logging in.");
      } catch (err) {
        console.error("Failed to send verification email", err);
      }

      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send token and user details to our backend to create MongoDB user (isVerified: false)
      await api.post("/auth/register-firebase", { 
        name, mobile, address, idToken 
      });
      
      // 4. Sign out immediately. Do not log them in until they verify.
      await signOut(auth);
      
      // Clear form
      setName(""); setMobile(""); setAddress(""); setEmail(""); setPassword("");
      
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use' && !isRetry) {
        try {
          // Attempt to clear unverified account occupying this email
          await api.post("/auth/clear-unverified", { email });
          // If successful, retry registration automatically
          return handleRegister(undefined, true);
        } catch (clearErr: any) {
          setError(clearErr.response?.data?.message || "Email is already in use by a verified account.");
        }
      } else if (err.code?.startsWith('auth/')) {
        setError(err.message || "Registration failed");
      } else {
        setError(err.response?.data?.message || "Registration failed on server");
      }
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

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Mobile Number</label>
              <input 
                type="tel" 
                required 
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Address</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
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

        <div className="mt-6 text-center text-sm text-zinc-500">
          Already have an account? <Link href="/auth/login" className="text-indigo-400 hover:underline">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}
