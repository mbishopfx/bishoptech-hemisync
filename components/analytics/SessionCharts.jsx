'use client';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

export function SessionCharts({ analytics }) {
  const data = useMemo(() => {
    if (!analytics) return [];
    const len = analytics.lengthSec || 0;
    const out = new Array(len).fill(null).map((_, s) => ({
      s,
      deltaHz: analytics.deltaHzSeries?.[s] ?? null,
      duck: analytics.duckEnvSeries?.[s] ?? 1,
      voice: analytics.voicePresence?.[s] ?? 0,
      bedRms: analytics.bedRms?.[s] ?? 0,
      voiceRms: analytics.voiceRms?.[s] ?? 0
    }));
    return out;
  }, [analytics]);

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-dark rounded-xl p-4">
        <h3 className="mb-2 text-white">Delta Frequency (binaural difference)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.7)' }} label={{ value: 'Seconds', position: 'insideBottomRight', fill: 'rgba(255,255,255,0.6)' }} />
              <YAxis domain={[0, 20]} tick={{ fill: 'rgba(255,255,255,0.7)' }} label={{ value: 'Hz', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)' }} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Line type="monotone" dataKey="deltaHz" name="Δf (Hz)" stroke="#06b6d4" dot={false} strokeWidth={2} />
              <ReferenceLine y={4} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={12} stroke="#94a3b8" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-white/70">Bands: θ≈4–7 Hz (deep meditation), α≈8–12 Hz (relaxation). Curve shows session ramp per preset.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-dark rounded-xl p-4">
        <h3 className="mb-2 text-white">Ducking Envelope (bed level while guidance speaks)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.7)' }} label={{ value: 'Seconds', position: 'insideBottomRight', fill: 'rgba(255,255,255,0.6)' }} />
              <YAxis domain={[0.7, 1.05]} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Line type="monotone" dataKey="duck" name="Bed Level" stroke="#8b5cf6" dot={false} strokeWidth={2} />
              <ReferenceLine y={0.8} stroke="#94a3b8" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-white/70">Bed reduces to 80% while guidance speaks (fast attack/slow release) for clarity without losing immersion.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-dark rounded-xl p-4">
        <h3 className="mb-2 text-white">RMS Levels & Voice Presence</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
              <YAxis domain={[0, 0.5]} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Area type="monotone" dataKey="bedRms" name="Bed RMS" stroke="#06b6d4" fillOpacity={1} fill="url(#g1)" />
              <Area type="monotone" dataKey="voiceRms" name="Voice RMS" stroke="#8b5cf6" fillOpacity={1} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-white/70">RMS approximates perceived loudness. Voice should dominate slightly during guidance; bed remains supportive.</p>
      </motion.div>

      {analytics.coverage && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="glass-dark rounded-xl p-4">
          <h3 className="mb-2 text-white">Band Coverage</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(analytics.coverage).map(([k,v])=>({band:k,pct:v}))}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <XAxis dataKey="band" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <YAxis domain={[0,100]} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                <Bar dataKey="pct" name="% of session" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-white/70">Theta-heavy sessions support deep meditation; alpha supports relaxation and entry. Coverage shows time spent in each band.</p>
        </motion.div>
      )}
    </div>
  );
}


