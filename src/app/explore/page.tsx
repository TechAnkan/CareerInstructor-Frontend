"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Float, Line } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Search, X, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

// Sample career nodes covering all streams
const careerNodes = [
  // Engineering & Tech
  { id: 1, position: [0, 0, 0], title: "Software Engineering", color: "#6366f1", desc: "Build apps, systems, and platforms.", steps: ["Learn HTML, CSS, JavaScript", "Master React & Next.js", "Understand Node.js & Databases", "Build Full-Stack Projects", "Ace Algorithms & Data Structures"] },
  { id: 2, position: [3, 2, -2], title: "Data Science", color: "#a855f7", desc: "Analyze data to find hidden patterns.", steps: ["Learn Python & SQL", "Master Statistics & Probability", "Learn Pandas & NumPy", "Machine Learning Basics", "Build Predictive Models"] },
  
  // Medical & Healthcare
  { id: 3, position: [5, -1, 3], title: "Medicine & Surgery", color: "#ef4444", desc: "Diagnose and treat patients as a doctor.", steps: ["Clear NEET/Medical Entrance", "Complete MBBS Degree", "1-Year Internship", "Pursue MD/MS Specialization", "Obtain Medical License"] },
  { id: 4, position: [7, 1, 1], title: "Biotechnology", color: "#14b8a6", desc: "Merge biology with technology for innovation.", steps: ["Study Biology & Chemistry", "B.Sc/B.Tech in Biotech", "Learn Lab Techniques", "Master Bioinformatics", "Pursue R&D or Pharma Roles"] },

  // Commerce & Business
  { id: 5, position: [-4, 3, 0], title: "Chartered Accountancy", color: "#10b981", desc: "Manage finances, auditing, and taxation.", steps: ["Clear CA Foundation", "Complete CA Intermediate", "3 Years Articleship", "Clear CA Final", "Register with ICAI"] },
  { id: 6, position: [-6, 1, -2], title: "Investment Banking", color: "#059669", desc: "Help organizations raise capital and grow.", steps: ["Degree in Finance/Economics", "Learn Financial Modeling", "MBA from Top Tier College", "Intern at a Bank", "Network & Pass Licensing Exams"] },

  // Arts & Humanities
  { id: 7, position: [0, 4, 4], title: "Journalism", color: "#f97316", desc: "Investigate and report news to the public.", steps: ["Degree in Mass Communication", "Build Strong Writing Skills", "Start a Blog/Portfolio", "Intern at a News Agency", "Specialize in a Beat"] },
  { id: 8, position: [2, 5, 2], title: "Psychology", color: "#db2777", desc: "Study the human mind and behavior.", steps: ["BA/B.Sc in Psychology", "MA/M.Sc Specialization", "Clear NET/Licensing", "Complete Clinical Internships", "Start Practice or Research"] },
  { id: 9, position: [-5, -2, 3], title: "Law & Legal Studies", color: "#64748b", desc: "Advocate for justice and interpret laws.", steps: ["Clear CLAT/Law Entrance", "Complete LLB Degree", "Intern with a Senior Lawyer", "Pass Bar Council Exam", "Specialize in Corporate/Criminal Law"] },

  // Pure Sciences / Honors
  { id: 10, position: [1, -5, -2], title: "Physics Research", color: "#0ea5e9", desc: "Uncover the fundamental laws of the universe.", steps: ["B.Sc Honors in Physics", "Master Calculus & Math", "M.Sc in Physics", "Qualify CSIR-NET/GATE", "Pursue Ph.D in specific field"] },
  { id: 11, position: [-3, -4, -1], title: "Architecture", color: "#eab308", desc: "Design buildings and physical structures.", steps: ["Clear NATA/JEE Paper 2", "Complete B.Arch Degree", "Master AutoCAD & 3D Modeling", "Complete Mandatory Internship", "Register with Council of Architecture"] },
];

function CareerNode({ id, position, title, color, desc, onSelect }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh
        position={position}
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          setHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial 
          color={color} 
          wireframe={hovered}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
        
        <Html distanceFactor={10} position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
          <div className={`transition-all duration-300 pointer-events-none ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl w-48 text-center">
              <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
              <p className="text-zinc-400 text-xs">{desc}</p>
              <p className="mt-2 text-indigo-400 text-xs font-semibold animate-pulse">Click to view path</p>
            </div>
          </div>
        </Html>
      </mesh>
    </Float>
  );
}

// Draw lines between nodes to represent paths
function Connections() {
  const lines = [
    [careerNodes[0].position, careerNodes[1].position], // SE -> Data
    [careerNodes[2].position, careerNodes[3].position], // Med -> Biotech
    [careerNodes[4].position, careerNodes[5].position], // CA -> IB
    [careerNodes[6].position, careerNodes[7].position], // Journalism -> Psych
    [careerNodes[1].position, careerNodes[9].position], // Data -> Physics
    [careerNodes[0].position, careerNodes[10].position], // SE -> Arch
    [careerNodes[8].position, careerNodes[5].position], // Law -> IB
  ] as any;

  return (
    <>
      {lines.map((points: any, i: number) => (
        <Line key={i} points={points} color="white" opacity={0.15} transparent lineWidth={1} />
      ))}
    </>
  );
}

export default function Explore() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [subtopicsCache, setSubtopicsCache] = useState<Record<string, string[]>>({});
  const [loadingSubtopics, setLoadingSubtopics] = useState<boolean>(false);

  const handleExpandStep = async (stepTitle: string, index: number) => {
    if (expandedStep === index) {
      setExpandedStep(null);
      return;
    }
    setExpandedStep(index);
    const cacheKey = `${selectedNode.title}-${stepTitle}`;
    if (subtopicsCache[cacheKey]) return; // Already fetched

    setLoadingSubtopics(true);
    try {
      const { data } = await api.post('/ai/subtopics', { careerTitle: selectedNode.title, stepTitle });
      setSubtopicsCache(prev => ({ ...prev, [cacheKey]: data }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-roadmap', { career: searchQuery });
      setSelectedNode({
        id: 'custom-' + Date.now(),
        title: data.title,
        desc: data.desc,
        color: data.color || '#8b5cf6',
        steps: data.steps
      });
      setSearchQuery("");
    } catch (error) {
      console.error(error);
      alert("Failed to generate roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?callbackUrl=/explore");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen bg-black" />;

  return (
    <div className="h-screen w-full bg-black relative font-sans overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm border border-white/10 w-max">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-black/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl max-w-sm"
          >
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-400" /> Career Universe
            </h1>
            <p className="text-zinc-400 text-sm mb-4">
              Explore the constellation of careers. Drag to rotate, scroll to zoom. Hover over a node to reveal details.
            </p>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Search careers... (Press Enter)" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm disabled:opacity-50"
                disabled={isGenerating}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              {isGenerating && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-purple-400 animate-pulse font-medium">
                  Generating...
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto hidden md:block"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Recommended for you
          </h3>
          <div className="flex flex-col gap-2">
            {careerNodes.slice(0, 3).map(node => (
              <button 
                key={node.id} 
                onClick={() => setSelectedNode(careerNodes.find(n => n.id === node.id))}
                className="text-left text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }}></span>
                {node.title}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Path Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
            className="absolute inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div 
                className="h-32 w-full absolute top-0 left-0 opacity-20 pointer-events-none"
                style={{ background: `linear-gradient(to bottom, ${selectedNode.color}, transparent)` }}
              />
              
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedNode(null);
                }}
                className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[100] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ backgroundColor: selectedNode.color }} />
                  <h2 className="text-3xl font-bold text-white">{selectedNode.title}</h2>
                </div>
                <p className="text-zinc-400 mb-8">{selectedNode.desc}</p>

                <h3 className="text-xl font-semibold text-white mb-4">Your Roadmap</h3>
                
                <div className="space-y-4">
                  {selectedNode.steps?.map((step, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        {index < selectedNode.steps!.length - 1 && (
                          <div className="w-0.5 h-full bg-white/10 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6 pt-1">
                        <div 
                          onClick={() => handleExpandStep(step, index)}
                          className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col group-hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300 font-medium">{step}</span>
                            <ChevronRight className={`w-5 h-5 text-zinc-600 group-hover:text-white transition-all ${expandedStep === index ? 'rotate-90' : ''}`} />
                          </div>
                          
                          <AnimatePresence>
                            {expandedStep === index && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                              >
                                {loadingSubtopics && !subtopicsCache[`${selectedNode.title}-${step}`] ? (
                                  <div className="text-sm text-purple-400 animate-pulse flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                                    AI is analyzing sub-topics...
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {subtopicsCache[`${selectedNode.title}-${step}`]?.map((subtopic, i) => (
                                      <span key={i} className="text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                                        {subtopic}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4 relative z-[100]">
                  <button 
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await api.post('/roadmaps', {
                          careerId: selectedNode.id,
                          careerTitle: selectedNode.title,
                          color: selectedNode.color,
                          steps: selectedNode.steps
                        });
                        router.push('/dashboard');
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Error saving roadmap');
                      }
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-xl transition-colors cursor-pointer text-lg shadow-lg"
                  >
                    Start this Path
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/mentor');
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-colors border border-white/10 cursor-pointer text-lg"
                  >
                    Ask AI Mentor
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} className={selectedNode ? 'pointer-events-none' : ''}>
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Connections />

        {careerNodes.map((node) => (
          <CareerNode key={node.id} {...node} onSelect={(id: any) => setSelectedNode(careerNodes.find(n => n.id === id))} />
        ))}

        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
