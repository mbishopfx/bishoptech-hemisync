'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { motion } from 'framer-motion';

export function SessionCharts({ analytics }) {
  const data = useMemo(() => {
    if (!analytics) return [];
    const len = analytics.lengthSec || 0;
    return new Array(len).fill(null).map((_, s) => ({
      s,
      deltaHz: analytics.deltaHzSeries?.[s] ?? null,
      bedRms: analytics.bedRms?.[s] ?? 0
    }));
  }, [analytics]);

  if (!analytics) return null;

  const exportCSV = () => {
    const header = ['s', 'deltaHz', 'bedRms'];
    const rows = data.map((d) => [d.s, d.deltaHz, d.bedRms]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-analytics.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 col-span-2">
      <div className="flex items-center justify-end gap-2">
        <button onClick={exportCSV} className="rounded-md bg-sky-400/90 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-300">
          Export CSV
        </button>
        <button onClick={exportJSON} className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">
          Export JSON
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-dark rounded-xl p-4">
        <h3 className="mb-2 text-white">Delta Frequency Path</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.7)' }} label={{ value: 'Seconds', position: 'insideBottomRight', fill: 'rgba(255,255,255,0.6)' }} />
              <YAxis domain={[0, 20]} tick={{ fill: 'rgba(255,255,255,0.7)' }} label={{ value: 'Hz', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)' }} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Line type="monotone" dataKey="deltaHz" name="Delta (Hz)" stroke="#06b6d4" dot={false} strokeWidth={2} />
              <ReferenceLine y={4} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={12} stroke="#94a3b8" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-white/70">Theta usually sits around 4 to 7 Hz and alpha around 8 to 12 Hz. This curve shows how the session moves between those states.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-dark rounded-xl p-4">
        <h3 className="mb-2 text-white">Bed Energy</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="bed-rms-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <XAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
              <YAxis domain={[0, 0.5]} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Area type="monotone" dataKey="bedRms" name="Bed RMS" stroke="#06b6d4" fillOpacity={1} fill="url(#bed-rms-gradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-sm text-white/70">RMS approximates perceived energy. A premium beat should stay stable and controlled even as the entrainment curve changes.</p>
      </motion.div>

      {analytics.coverage && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-dark rounded-xl p-4">
          <h3 className="mb-2 text-white">Band Coverage</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(analytics.coverage).map(([k, v]) => ({ band: k, pct: v }))}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <XAxis dataKey="band" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                <Bar dataKey="pct" name="% of session" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-white/70">Coverage shows how much time the session spends in each entrainment band.</p>
        </motion.div>
      )}
    </div>
  );
}
