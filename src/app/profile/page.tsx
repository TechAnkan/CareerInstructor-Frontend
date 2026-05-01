"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, Sparkles, BookOpen } from "lucide-react";
import api from "@/lib/api";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [grade, setGrade] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading, router]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfile(data);
      setGrade(data.grade || "");
      setInterestsInput(data.interests?.join(", ") || "");
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      const interestsArray = interestsInput.split(",").map(i => i.trim()).filter(i => i);
      const { data } = await api.put('/profile', { grade, interests: interestsArray });
      setProfile(data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (JPEG, PNG).");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setIsEvaluating(true);
      try {
        const { data } = await api.post('/profile/evaluate-marks', { imageBase64: base64Image });
        setProfile(data);
      } catch (error: any) {
        console.error("Failed to evaluate marks", error);
        alert(error.response?.data?.message || "Failed to evaluate marks sheet.");
      } finally {
        setIsEvaluating(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  if (loading || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 overflow-hidden relative">
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-6 w-max transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold flex items-center gap-4"
          >
            Your Profile
          </motion.h1>
          <p className="text-zinc-400 mt-2">Help the AI understand you better for highly personalized guidance.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Basic Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-col gap-6"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="text-indigo-400 w-6 h-6" /> Academic Info
            </h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-sm">Grade / Current Stage</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Grade</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="College/University">College / University</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-sm">Interests & Hobbies (comma separated)</label>
              <input 
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g. Coding, Space, Video Games, Art"
                className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button 
              onClick={handleSaveInfo}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-medium py-3 rounded-xl transition-colors mt-auto"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </motion.div>

          {/* AI Marks Sheet Evaluation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-col gap-6"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="text-purple-400 w-6 h-6" /> AI Marks Sheet Analysis
            </h2>
            <p className="text-sm text-zinc-300">
              Upload an image of your recent report card or marks sheet. Our AI will analyze your scores and identify your academic strengths to recommend the perfect careers!
            </p>

            <div 
              onClick={() => !isEvaluating && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                ${isEvaluating ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/20 hover:border-purple-400 hover:bg-white/5'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              {isEvaluating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles className="w-8 h-8 text-purple-400 mb-2" />
                  </motion.div>
                  <p className="text-purple-300 font-medium">AI is reading your marks...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <p className="font-medium text-white">Click to Upload Marks Sheet</p>
                  <p className="text-xs text-zinc-500 mt-1">JPEG, PNG only</p>
                </>
              )}
            </div>

            {/* Evaluation Results */}
            {profile.academicProfile && profile.academicProfile.extractedMarks?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 rounded-2xl p-6 mt-4 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Extracted Data</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {profile.academicProfile.extractedMarks.map((m: any, i: number) => (
                    <div key={i} className="bg-white/5 p-2 rounded-lg text-sm flex justify-between">
                      <span className="text-zinc-400">{m.subject}</span>
                      <span className="font-medium">{m.score}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Summary</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {profile.academicProfile.evaluationSummary}
                  </p>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
