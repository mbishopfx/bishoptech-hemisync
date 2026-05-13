'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Omnibar } from '@/components/agent/Omnibar';
import { LibraryPlayer } from '@/components/audio/LibraryPlayer';
import { AgenticAuthModal } from '@/components/auth/AgenticAuthModal';
import Link from 'next/link';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleGenerate = async (mood) => {
    setIsLoading(true);
    setAgentMessage('');
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'AUTH_REQUIRED') {
          setIsAuthModalOpen(true);
        } else {
          console.error(data.error);
        }
        return;
      }

      setAgentMessage(data.agentMessage);
      setCurrentTrack(data.track);
    } catch (err) {
      console.error('Failed to connect to agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 w-full p-8 flex justify-between items-center z-50"
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-white flex items-center justify-center text-black font-bold">H</div>
          <span className="text-white font-medium tracking-tight">HemiSync.sys</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
          <Link href="/signup" className="px-4 py-2 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">Join Community</Link>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-light text-white tracking-tighter leading-none">
            Cognitive <span className="text-white/30">Orchestration</span>
          </h1>
          <p className="text-white/40 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto">
            Describe your current state. Our agent will match you to a precision frequency.
          </p>
        </motion.div>

        <Omnibar 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          agentMessage={agentMessage}
        />

        <AnimatePresence>
          {currentTrack && (
            <LibraryPlayer 
              track={currentTrack} 
              onFinished={() => console.log('Session complete')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-8 flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]"
      >
        <span>System Status: Optimal</span>
        <span>100+ Frequencies Online</span>
        <span>Binaural Phase Lock: Active</span>
      </motion.footer>

      <AgenticAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
