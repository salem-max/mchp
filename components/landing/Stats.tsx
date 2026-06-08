'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'Vetted Technicians', target: 2400, suffix: '+' },
  { label: 'Jobs Completed', target: 15000, suffix: '+' },
  { label: '% Satisfaction', target: 98, suffix: '%' },
  { label: 'Cities Covered', target: 12, suffix: '+' },
];

interface StatCardProps { label: string; target: number; suffix: string; delay: number; }

function StatCard({ label, target, suffix, delay }: StatCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          let start = 0;
          const duration = 2000;
          const step = (now: number) => {
            if (!start) start = now;
            const p = Math.min((now - start) / duration, 1);
            setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className={`reveal tilt-card glass-card text-center rounded-3xl p-8`}>
      <div className="stat-number text-4xl font-bold mb-2 gradient-text">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/40">{label}</div>
    </div>
  );
}

export default function Stats() {
  return (
    <section id="stats" className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <StatCard key={i} label={s.label} target={s.target} suffix={s.suffix} delay={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
