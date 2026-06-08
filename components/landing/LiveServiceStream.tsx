'use client';

import { useEffect, useRef } from 'react';
import { Zap, Droplets, Thermometer, Wrench, Wind, Hammer } from 'lucide-react';
import { Shimmer } from '@/components/ai-elements/shimmer';

const CARDS = [
  { icon: Zap,         title: 'Electrical Fix',  tech: 'Austin R.',  rating: 4.9, status: 'In Progress', statusColor: '#00ffa3', price: '$85',  accent: '#00d4ff' },
  { icon: Droplets,    title: 'Plumbing Leak',   tech: 'Sara L.',    rating: 4.8, status: 'Scheduled',   statusColor: '#7b61ff', price: '$120', accent: '#7b61ff' },
  { icon: Thermometer, title: 'AC Repair',       tech: 'Mike T.',    rating: 5.0, status: 'Completed ✓', statusColor: '#00d4ff', price: '$65',  accent: '#00ffa3' },
  { icon: Wind,        title: 'HVAC Service',    tech: 'Dana K.',    rating: 4.7, status: 'In Progress', statusColor: '#00ffa3', price: '$140', accent: '#00d4ff' },
  { icon: Wrench,      title: 'General Repair',  tech: 'James O.',   rating: 4.9, status: 'Scheduled',   statusColor: '#7b61ff', price: '$55',  accent: '#7b61ff' },
  { icon: Hammer,      title: 'Carpentry',       tech: 'Lena M.',    rating: 4.6, status: 'Completed ✓', statusColor: '#00d4ff', price: '$95',  accent: '#00ffa3' },
];

// Duplicate for seamless infinite loop
const STREAM = [...CARDS, ...CARDS];

function ServiceCard({ icon: Icon, title, tech, rating, status, statusColor, price, accent }: typeof CARDS[0]) {
  return (
    <div
      className="relative flex-shrink-0 w-[240px] rounded-2xl p-4 border border-white/10 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 20px ${accent}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Glow accent top-left */}
      <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full blur-2xl opacity-30" style={{ background: accent }} />

      <div className="relative flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-white truncate">{title}</div>
          <div className="text-xs text-white/40">{tech} · ★ {rating}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
          style={{ color: statusColor, borderColor: `${statusColor}30`, background: `${statusColor}10` }}
        >
          {status}
        </span>
        <span className="font-mono text-sm font-bold" style={{ color: '#00ffa3' }}>{price}</span>
      </div>
    </div>
  );
}

export default function LiveServiceStream() {
  const track1 = useRef<HTMLDivElement>(null);
  const track2 = useRef<HTMLDivElement>(null);

  // CSS animation via keyframes injected once
  useEffect(() => {
    if (document.getElementById('stream-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'stream-keyframes';
    style.textContent = `
      @keyframes streamLeft {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes streamRight {
        0%   { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
      .stream-left  { animation: streamLeft  28s linear infinite; }
      .stream-right { animation: streamRight 22s linear infinite; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="relative flex-1 flex flex-col justify-center gap-5 overflow-hidden select-none min-h-[420px]">
      {/* Header label */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
        <Shimmer className="text-xs font-medium text-white/50" duration={3}>
          Live service activity
        </Shimmer>
        <span className="ml-auto text-[10px] text-white/20 font-mono">2,400+ technicians</span>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="overflow-hidden">
        <div ref={track1} className="stream-left flex gap-4 w-max">
          {STREAM.map((card, i) => <ServiceCard key={i} {...card} />)}
        </div>
      </div>

      {/* Row 2 — scrolls right (offset start) */}
      <div className="overflow-hidden">
        <div ref={track2} className="stream-right flex gap-4 w-max">
          {[...STREAM].reverse().map((card, i) => <ServiceCard key={i} {...card} />)}
        </div>
      </div>

      {/* Row 3 — scrolls left slower */}
      <div className="overflow-hidden opacity-60">
        <div className="stream-left flex gap-4 w-max" style={{ animationDuration: '36s' }}>
          {STREAM.map((card, i) => <ServiceCard key={i} {...card} />)}
        </div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
        style={{ background: 'linear-gradient(to right, #0a0a0f, transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
        style={{ background: 'linear-gradient(to left, #0a0a0f, transparent)' }} />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />
    </div>
  );
}
