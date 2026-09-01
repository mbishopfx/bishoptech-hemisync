'use client';

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, FastForward, Rewind } from 'lucide-react';

function resolveTrackSource(track) {
  return track?.mp3Url || track?.mp3_url || track?.webmUrl || track?.webm_url || track?.wavUrl || track?.wav_url || '';
}

export const LibraryPlayer = forwardRef(function LibraryPlayer({ track, onFinished }, ref) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const source = resolveTrackSource(track);
  const hasTrack = Boolean(track && source);

  useImperativeHandle(ref, () => ({
    playTrack(nextTrack) {
      const nextSource = resolveTrackSource(nextTrack);
      if (!nextSource || !audioRef.current) return false;
      audioRef.current.src = nextSource;
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return true;
    },
    pause() {
      if (!audioRef.current) return false;
      audioRef.current.pause();
      setIsPlaying(false);
      return true;
    }
  }), []);

  useEffect(() => {
    if (!audioRef.current || !source) return;

    audioRef.current.src = source;
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(0);

    if (track?.autoPlay !== false) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [source, track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      return;
    }

    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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

  if (!hasTrack) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="workspace-library-player workspace-glass-card w-full max-w-md mx-auto mt-12 rounded-[2rem] p-6"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#548477]">Preview Ready</p>
          <h3 className="text-xl font-medium text-[#1d302c]">Tap Preview Tone to start</h3>
          <p className="text-sm text-[#60716b]">Your 3ish-minute public MP3 preview will appear here instantly.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="workspace-library-player workspace-glass-card w-full max-w-md mx-auto mt-12 rounded-[2rem] p-6"
    >
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onFinished) onFinished();
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-[#548477]">
            {track.modeLabel || track.mode_label || `${track.state || track.target_state || 'Stereo'} State Active`}
          </p>
          <h3 className="text-xl font-medium text-[#1d302c]">{track.name}</h3>
          <p className="mt-1 text-sm text-[#60716b]">
            {(track.targetHz || track.target_hz || track.baseFreqHz || track.base_freq_hz || '?')}Hz Pure Stereo Preview
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-[#87968f]">
            {track.durationSec || track.duration_sec || 172} seconds • Public MP3
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#dbe5de]">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-[#87968f]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button className="workspace-glass-button workspace-library-icon-action flex size-10 items-center justify-center rounded-full" type="button" aria-label="Rewind preview">
            <Rewind className="size-5" />
          </button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            type="button"
            className="workspace-glass-button workspace-glass-button--primary flex size-16 items-center justify-center rounded-full"
          >
            {isPlaying ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current translate-x-0.5" />}
          </motion.button>

          <button className="workspace-glass-button workspace-library-icon-action flex size-10 items-center justify-center rounded-full" type="button" aria-label="Fast-forward preview">
            <FastForward className="size-5" />
          </button>
        </div>

        <div className="workspace-library-volume flex items-center justify-center gap-2">
          <Volume2 className="size-4" />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-[#dbe5de]">
            <div className="h-full w-2/3 rounded-full bg-[#9fbdad]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
