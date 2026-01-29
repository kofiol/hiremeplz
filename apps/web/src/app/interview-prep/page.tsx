"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InterviewPrepPage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Simulation of voice activity for the orb animation
  // In a real app, this would be driven by audio levels
  const [voiceLevel, setVoiceLevel] = useState(1);

  const toggleMute = () => setIsMuted(!isMuted);
  const endSession = () => router.push("/overview");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/overview" className="text-white/50 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm font-light tracking-wider opacity-80">voice</span>
        </div>
      </header>

      {/* Main Content - The Orb */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="relative flex items-center justify-center">
            {/* Outer rings/glow */}
            <motion.div
                animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    opacity: isListening ? [0.3, 0.1, 0.3] : 0.1,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute w-80 h-80 bg-white rounded-full blur-3xl"
            />
            
            {/* The Orb itself */}
            <motion.div
                animate={{
                    scale: isListening ? [1, 1.05, 1] : [1, 1.02, 1],
                }}
                transition={{
                    duration: isListening ? 1.5 : 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="w-64 h-64 rounded-full relative overflow-hidden bg-gradient-to-b from-blue-100 to-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center"
            >
                {/* Cloud/Nebula effect inside the orb */}
                <motion.div 
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"
                />
                
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-400/20 to-blue-900/40" />
            </motion.div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="relative z-10 p-8 pb-12 flex items-center justify-between max-w-md mx-auto w-full">
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={cn(
                "w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-0 transition-all duration-300",
                isMuted && "bg-red-500/20 hover:bg-red-500/30 text-red-500"
            )}
        >
            {isMuted ? (
                <MicOff className="w-6 h-6" />
            ) : (
                <Mic className="w-6 h-6" />
            )}
        </Button>

        <Button
            variant="ghost"
            size="icon"
            onClick={endSession}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-0 text-white hover:text-red-400 transition-all duration-300"
        >
            <X className="w-6 h-6" />
        </Button>
      </footer>
    </div>
  );
}
