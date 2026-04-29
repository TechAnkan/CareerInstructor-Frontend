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

// Sample career nodes
const careerNodes = [
  { 
    id: 1, position: [0, 0, 0], title: "Software Engineering", color: "#6366f1", desc: "Build apps, systems, and platforms.",
    steps: ["Learn HTML, CSS, JavaScript", "Master React & Next.js", "Understand Node.js & Databases", "Build Full-Stack Projects", "Ace Algorithms & Data Structures"]
  },
  { 
    id: 2, position: [3, 2, -2], title: "Data Science", color: "#a855f7", desc: "Analyze data to find hidden patterns.",
    steps: ["Learn Python & SQL", "Master Statistics & Probability", "Learn Pandas & NumPy", "Machine Learning Basics", "Build Predictive Models"]
  },
  { 
    id: 3, position: [-3, -1, -4], title: "UX/UI Design", color: "#ec4899", desc: "Design beautiful user experiences.",
    steps: ["Learn Design Principles", "Master Figma", "Understand User Research", "Create Wireframes & Prototypes", "Build a Design Portfolio"]
  },
  { 
    id: 4, position: [2, -3, 2], title: "Cybersecurity", color: "#14b8a6", desc: "Protect networks and systems from threats.",
    steps: ["Learn Networking Basics", "Master Linux & Shell", "Understand Cryptography", "Learn Ethical Hacking", "Get Security+ Certified"]
  },
  { 
    id: 5, position: [-4, 2, 3], title: "Cloud Computing", color: "#3b82f6", desc: "Manage scalable cloud infrastructures.",
    steps: ["Understand Networking & OS", "Learn AWS/Azure Basics", "Master Docker & Containers", "Learn Kubernetes", "Deploy Scalable Apps"]
  },
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
  const points1 = [careerNodes[0].position, careerNodes[1].position] as any;
  const points2 = [careerNodes[0].position, careerNodes[4].position] as any;
  const points3 = [careerNodes[0].position, careerNodes[3].position] as any;
  const points4 = [careerNodes[0].position, careerNodes[2].position] as any;

  return (
    <>
      <Line points={points1} color="white" opacity={0.1} transparent lineWidth={1} />
      <Line points={points2} color="white" opacity={0.1} transparent lineWidth={1} />
      <Line points={points3} color="white" opacity={0.1} transparent lineWidth={1} />
      <Line points={points4} color="white" opacity={0.1} transparent lineWidth={1} />
    </>
  );
}

export default function Explore() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?callbackUrl=/explore");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen bg-black" />;

  const selectedNode = selectedPath ? careerNodes.find(n => n.id === selectedPath) : null;

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
                placeholder="Search careers..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
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
                onClick={() => setSelectedPath(node.id)}
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
            onClick={() => setSelectedPath(null)}
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
                  setSelectedPath(null);
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
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group-hover:bg-white/10 transition-colors">
                          <span className="text-zinc-300 font-medium">{step}</span>
                          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
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
          <CareerNode key={node.id} {...node} onSelect={setSelectedPath} />
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
