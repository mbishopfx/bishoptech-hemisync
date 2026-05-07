'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TonePlayer({ spec }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const engineRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      await Tone.start();
      if (!mounted) return;
      setIsReady(true);
    }
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isReady || !spec) return;

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;
    setProgress(0);
    setIsPlaying(false);

    const baseFreqHz = spec.baseFreqHz || 220;
    const initialDelta = spec.stages?.[0]?.deltaHz?.from || spec.deltaHz || 10;
    
    const leftOsc = new Tone.Oscillator(baseFreqHz, 'sine');
    const rightOsc = new Tone.Oscillator(baseFreqHz + initialDelta, 'sine');
    
    leftOsc.sync().start(0);
    rightOsc.sync().start(0);

    const leftPan = new Tone.Panner(-1).toDestination();
    const rightPan = new Tone.Panner(1).toDestination();
    
    // Lower volume for pleasant listening
    leftOsc.volume.value = -12;
    rightOsc.volume.value = -12;
    
    leftOsc.connect(leftPan);
    rightOsc.connect(rightPan);
    
    if (spec.stages && spec.stages.length > 0) {
      let time = 0;
      for (const stage of spec.stages) {
        const from = stage.deltaHz?.from || spec.deltaHz || 10;
        const to = stage.deltaHz?.to || spec.deltaHz || 10;
        const dur = stage.durationSec || 0;
        
        rightOsc.frequency.setValueAtTime(baseFreqHz + from, time);
        rightOsc.frequency.linearRampToValueAtTime(baseFreqHz + to, time + dur);
        
        time += dur;
      }
      Tone.Transport.schedule((t) => {
        Tone.Transport.stop();
        setIsPlaying(false);
      }, time);
    } else {
      Tone.Transport.schedule((t) => {
        Tone.Transport.stop();
        setIsPlaying(false);
      }, spec.lengthSec || 60);
    }

    engineRef.current = { leftOsc, rightOsc, leftPan, rightPan };

    const intervalId = setInterval(() => {
      if (Tone.Transport.state === 'started') {
        setProgress(Tone.Transport.seconds);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      Tone.Transport.stop();
      Tone.Transport.cancel();
      leftOsc.dispose();
      rightOsc.dispose();
      leftPan.dispose();
      rightPan.dispose();
    };
  }, [isReady, spec]);

  function togglePlay() {
    if (!isReady) return;
    if (Tone.context.state !== 'running') Tone.context.resume();
    
    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }

  const format = (s) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  const total = spec?.lengthSec || 0;

  return (
    <div className="flex flex-col gap-2 p-5 border border-zinc-800 rounded-lg bg-zinc-950 mt-4">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="icon" onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <div className="flex-1 font-mono text-sm text-zinc-400">
          {format(progress)} / {format(total)}
        </div>
        <div className="text-xs text-emerald-500 font-medium tracking-wide border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">
          ON-THE-FLY ENGINE
        </div>
      </div>
      <div className="text-xs text-zinc-600 leading-tight">
        High-fidelity Web Audio synthesis. Responsive frequency controls active.
      </div>
    </div>
  );
}
