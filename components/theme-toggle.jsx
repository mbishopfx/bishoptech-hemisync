'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem('hs-theme');
    if (saved) setDark(saved === 'dark');
  }, []);
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('hs-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed right-4 top-4 z-50 rounded-md bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
    >
      {dark ? 'Dark' : 'Light'}
    </button>
  );
}



