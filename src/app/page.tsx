"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot, Compass, LineChart, PlayCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, logout, loading } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] z-0" />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Compass className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">CareerGuider AI</span>
        </div>
        <div className="flex gap-4 items-center">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors border border-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-sm font-medium text-zinc-300">AI-Powered Career Guidance</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
        >
          Discover Your Future With <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Intelligent Roadmaps
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10"
        >
          Stop guessing your career path. Chat with our AI mentor, explore interactive 3D skill trees, and experience day-in-the-life simulations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link
            href={user ? "/mentor" : "/auth/login?callbackUrl=/mentor"}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105"
          >
            Meet Your AI Mentor <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href={user ? "/explore" : "/auth/login?callbackUrl=/explore"}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-8 py-4 rounded-full text-lg font-medium transition-all backdrop-blur-md border border-white/5 hover:scale-105"
          >
            Explore 3D Roadmaps
          </Link>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Bot className="w-6 h-6 text-indigo-400" />}
            title="AI Mentor Chatbot"
            description="Discuss your interests naturally and let AI analyze your unique strengths."
            delay={0.4}
          />
          <FeatureCard
            icon={<PlayCircle className="w-6 h-6 text-purple-400" />}
            title="Micro-Simulations"
            description="Experience tasks from different careers in 5-minute interactive scenarios."
            delay={0.5}
          />
          <FeatureCard
            icon={<LineChart className="w-6 h-6 text-pink-400" />}
            title="Real-Time Job Trends"
            description="Make informed decisions based on live market demand and salary data."
            delay={0.6}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors"
    >
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
