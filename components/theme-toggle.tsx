"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme;


  return (
    <div className="flex items-center gap-3 rounded-3xl bg-slate-100/90 p-3 text-slate-900 shadow-sm shadow-slate-900/5 transition duration-300 dark:bg-slate-950/85 dark:text-slate-100">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition hover:border-cyan-400 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:text-cyan-300"
        onClick={() => setTheme("light")}
        aria-label="Switch to light theme"
      >
        <Sun size={18} />
      </button>

      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition hover:border-cyan-400 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:text-cyan-300"
        onClick={() => setTheme("dark")}
        aria-label="Switch to dark theme"
      >
        <Moon size={18} />
      </button>


      <div className="hidden shrink-0 rounded-full bg-slate-950/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-200/12 dark:text-slate-200 sm:block">
        {mounted ? currentTheme : "..."}
      </div>
    </div>
  );
}
