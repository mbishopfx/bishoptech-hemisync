'use client';
import { useState } from 'react';

export function Accordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
      {items.map((it, idx) => (
        <div key={idx}>
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left text-white hover:bg-white/10"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <span className="text-sm font-medium">{it.title}</span>
            <span className="text-white/70">{open === idx ? '−' : '+'}</span>
          </button>
          {open === idx && (
            <div className="px-4 pb-4 text-sm text-white/80">
              {typeof it.content === 'string' ? <p>{it.content}</p> : it.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}



