'use client';

export function Switch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className={`h-6 w-10 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-white/20'}`}
           onClick={() => onChange(!checked)}>
        <div className={`h-6 w-6 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      {label && <span className="text-sm text-white/90">{label}</span>}
    </label>
  );
}



