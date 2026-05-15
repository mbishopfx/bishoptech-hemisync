'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, FastForward, Rewind } from 'lucide-react';

export function LibraryPlayer({ track, onFinished }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (track && audioRef.current) {
      const source = track.mp3Url || track.mp3_url || track.webmUrl || track.webm_url || track.wavUrl || track.wav_url;
      audioRef.current.src = source || '';
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [track]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto mt-12 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onFinished) onFinished();
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-1">
            {track.modeLabel || track.mode_label || `${track.state || track.target_state || 'Stereo'} State Active`}
          </p>
          <h3 className="text-white text-xl font-medium">{track.name}</h3>
          <p className="text-white/40 text-sm mt-1">
            {(track.targetHz || track.target_hz || track.baseFreqHz || track.base_freq_hz || '?')}Hz Pure Stereo Preview
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button className="text-white/40 hover:text-white transition-colors">
            <Rewind className="size-5" />
          </button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="size-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {isPlaying ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current translate-x-0.5" />}
          </motion.button>

          <button className="text-white/40 hover:text-white transition-colors">
            <FastForward className="size-5" />
          </button>
        </div>

        <div className="flex justify-center items-center gap-2 text-white/20">
          <Volume2 className="size-4" />
          <div className="h-1 w-24 bg-white/10 rounded-full">
            <div className="h-full w-2/3 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
