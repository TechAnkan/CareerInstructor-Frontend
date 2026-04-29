"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Flame, Star, Trophy, Plus } from "lucide-react";
import api from "@/lib/api";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        if (user) {
          const { data } = await api.get('/roadmaps');
          setRoadmaps(data);
        }
      } catch (error) {
        console.error("Failed to fetch roadmaps", error);
      } finally {
        setLoadingRoadmaps(false);
      }
    };
    fetchRoadmaps();
  }, [user]);

  const toggleStep = async (roadmapId: string, stepId: string) => {
    try {
      // Optimistic update
      const updatedRoadmaps = roadmaps.map(rm => {
        if (rm._id === roadmapId) {
          const newSteps = rm.steps.map((step: any) => 
            step._id === stepId ? { ...step, completed: !step.completed } : step
          );
          const completedCount = newSteps.filter((s: any) => s.completed).length;
          return { ...rm, steps: newSteps, progress: Math.round((completedCount / newSteps.length) * 100) };
        }
        return rm;
      });
      setRoadmaps(updatedRoadmaps);

      await api.put(`/roadmaps/${roadmapId}/step`, { stepId });
    } catch (error) {
      console.error("Failed to toggle step", error);
      // Re-fetch on error
      const { data } = await api.get('/roadmaps');
      setRoadmaps(data);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  // Staggered animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <Compass className="w-5 h-5" /> Back to Home
            </Link>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold"
            >
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user.email.split('@')[0]}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 mt-2 text-lg"
            >
              Let's continue shaping your future.
            </motion.p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-medium">3 Day Streak!</span>
          </div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/mentor" className="group bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-3xl hover:bg-indigo-600/30 transition-all flex flex-col justify-between h-48 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-colors" />
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Talk to AI Mentor</h3>
                  <p className="text-zinc-400 text-sm flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                    Start session <ArrowRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>
              
              <Link href="/explore" className="group bg-purple-600/20 border border-purple-500/30 p-6 rounded-3xl hover:bg-purple-600/30 transition-all flex flex-col justify-between h-48 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/40 transition-colors" />
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Explore 3D Maps</h3>
                  <p className="text-zinc-400 text-sm flex items-center gap-1 group-hover:text-purple-300 transition-colors">
                    View careers <ArrowRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Dynamic Roadmaps */}
            {!loadingRoadmaps && roadmaps.length === 0 && (
              <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center text-center py-16">
                <Compass className="w-12 h-12 text-zinc-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Roadmaps Yet</h3>
                <p className="text-zinc-400 mb-6 max-w-md">You haven't selected any career paths to follow. Head over to the Explore map to find your calling!</p>
                <Link href="/explore" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Explore Careers
                </Link>
              </motion.div>
            )}

            {roadmaps.map((roadmap: any) => {
              // Find the first uncompleted step to mark as "active"
              const firstUncompletedIndex = roadmap.steps.findIndex((s: any) => !s.completed);
              
              return (
                <motion.div key={roadmap._id} variants={itemVariants} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Roadmap: {roadmap.careerTitle}</h3>
                    <span className="font-medium" style={{ color: roadmap.color }}>{roadmap.progress}% Complete</span>
                  </div>
                  
                  <div className="w-full bg-white/10 rounded-full h-3 mb-8 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${roadmap.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-3 rounded-full absolute left-0 top-0"
                      style={{ backgroundColor: roadmap.color }}
                    />
                  </div>

                  <div className="space-y-4">
                    {roadmap.steps.map((step: any, i: number) => {
                      const isActive = i === firstUncompletedIndex;
                      return (
                        <div 
                          key={step._id} 
                          onClick={() => toggleStep(roadmap._id, step._id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-colors hover:bg-white/10
                            ${isActive ? 'bg-white/10 border-white/30' : 'bg-black/20 border-white/5'}`}
                        >
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors
                              ${step.completed ? 'bg-green-500 border-green-500' : isActive ? 'border-white' : 'border-zinc-600'}`}
                            style={isActive && !step.completed ? { borderColor: roadmap.color } : {}}
                          >
                            {step.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            {isActive && !step.completed && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: roadmap.color }} />}
                          </div>
                          <span className={`font-medium transition-colors ${step.completed ? 'text-zinc-500 line-through' : isActive ? 'text-white' : 'text-zinc-400'}`}>
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white relative overflow-hidden">
              <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
              <h3 className="text-xl font-bold mb-2 relative z-10">Daily Challenge</h3>
              <p className="text-white/80 text-sm mb-6 relative z-10">Read one article about emerging tech in your field of interest.</p>
              <button className="bg-white text-indigo-900 px-4 py-2 rounded-full font-medium text-sm hover:bg-zinc-100 transition-colors relative z-10">
                Complete Challenge
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" /> Suggested Resources
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  "Top 10 Careers in 2030",
                  "How to build a portfolio with zero experience",
                  "Understanding AI Ethics"
                ].map((item, i) => (
                  <Link key={i} href="#" className="text-sm text-zinc-400 hover:text-white hover:underline p-2 rounded-lg hover:bg-white/5 transition-all">
                    {item}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
