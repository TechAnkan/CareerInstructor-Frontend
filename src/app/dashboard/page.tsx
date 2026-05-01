"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Flame, Star, Trophy, Plus, User as UserIcon, ChevronRight } from "lucide-react";
import api from "@/lib/api";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [gamification, setGamification] = useState<any>(null);
  const [loadingGamification, setLoadingGamification] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [subtopicsCache, setSubtopicsCache] = useState<Record<string, string[]>>({});
  const [loadingSubtopics, setLoadingSubtopics] = useState<boolean>(false);

  const handleExpandStep = async (careerTitle: string, stepTitle: string, stepId: string) => {
    if (expandedStep === stepId) {
      setExpandedStep(null);
      return;
    }
    setExpandedStep(stepId);
    const cacheKey = `${careerTitle}-${stepTitle}`;
    if (subtopicsCache[cacheKey]) return; // Already fetched

    setLoadingSubtopics(true);
    try {
      const { data } = await api.post('/ai/subtopics', { careerTitle, stepTitle });
      setSubtopicsCache(prev => ({ ...prev, [cacheKey]: data }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSubtopics(false);
    }
  };

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
    const fetchGamification = async () => {
      try {
        if (user) {
          const { data } = await api.get('/gamification');
          setGamification(data);
        }
      } catch (error) {
        console.error("Failed to fetch gamification", error);
      } finally {
        setLoadingGamification(false);
      }
    };
    fetchRoadmaps();
    fetchGamification();
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
      {/* Animated Background elements */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />
      
      <motion.div 
        animate={{ 
          x: [0, 100, 0, -100, 0],
          y: [0, 50, 0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      
      <motion.div 
        animate={{ 
          x: [0, -100, 0, 100, 0],
          y: [0, -50, 0, 50, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />

      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" 
      />

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
            <span className="font-medium mr-2">{gamification?.streak || 0} Day Streak!</span>
            <Link href="/profile" className="flex items-center gap-2 hover:text-indigo-400 transition-colors border-l border-white/10 pl-4">
              <UserIcon className="w-5 h-5" /> Profile
            </Link>
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
                        <div key={step._id} className={`flex flex-col rounded-2xl border transition-colors hover:bg-white/10 ${isActive ? 'bg-white/10 border-white/30' : 'bg-black/20 border-white/5'}`}>
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => handleExpandStep(roadmap.careerTitle, step.title, step._id)}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div 
                                onClick={(e) => { e.stopPropagation(); toggleStep(roadmap._id, step._id); }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 hover:scale-110
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
                            <ChevronRight className={`w-5 h-5 text-zinc-500 transition-all ${expandedStep === step._id ? 'rotate-90' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {expandedStep === step._id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden px-4"
                              >
                                <div className="pb-4 pt-2 border-t border-white/5 ml-10">
                                  {loadingSubtopics && !subtopicsCache[`${roadmap.careerTitle}-${step.title}`] ? (
                                    <div className="text-sm text-purple-400 animate-pulse flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                                      AI is fetching subjects...
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {subtopicsCache[`${roadmap.careerTitle}-${step.title}`]?.map((subtopic, idx) => (
                                        <span key={idx} className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                                          {subtopic}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
              <p className="text-white/80 text-sm mb-6 relative z-10">
                {gamification?.dailyChallenge?.text || "Read one article about emerging tech in your field of interest."}
              </p>
              <button 
                onClick={async () => {
                  try {
                    await api.post('/gamification/complete');
                    setGamification({ ...gamification, dailyChallenge: { ...gamification.dailyChallenge, isCompleted: true } });
                  } catch (e) { console.error(e); }
                }}
                disabled={gamification?.dailyChallenge?.isCompleted}
                className="bg-white disabled:bg-white/50 text-indigo-900 px-4 py-2 rounded-full font-medium text-sm hover:bg-zinc-100 disabled:hover:bg-white/50 transition-colors relative z-10 flex items-center gap-2 w-max"
              >
                {gamification?.dailyChallenge?.isCompleted ? <><svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Completed!</> : "Complete Challenge"}
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
                  <a 
                    key={i} 
                    href={`https://www.google.com/search?q=${encodeURIComponent(item)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-zinc-400 hover:text-white hover:underline p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between group"
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
