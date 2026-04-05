'use client';

export function Switch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className={`h-6 w-11 rounded-full border border-white/10 transition-colors ${checked ? 'bg-[linear-gradient(135deg,rgba(240,216,157,0.95),rgba(127,213,223,0.92))]' : 'bg-white/15'}`}
           onClick={() => onChange(!checked)}>
        <div className={`h-6 w-6 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
      {label && <span className="text-sm text-white/90">{label}</span>}
    </label>
  );
}



