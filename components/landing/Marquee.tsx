'use client';

import { Wrench, Zap, Wind, Hammer, Tv, Paintbrush } from 'lucide-react';

const SERVICES = [
  { label: 'Plumbing', Icon: Wrench, color: '#3b82f6' },
  { label: 'Electrical', Icon: Zap, color: '#f59e0b' },
  { label: 'AC Repair', Icon: Wind, color: '#06b6d4' },
  { label: 'Carpentry', Icon: Hammer, color: '#a78bfa' },
  { label: 'Appliance Repair', Icon: Tv, color: '#34d399' },
  { label: 'Painting', Icon: Paintbrush, color: '#f97316' },
];


function ServiceCard({
  label,
  Icon,
  color,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <div
      className="group rounded-2xl border px-5 py-5 flex flex-col items-center gap-3 backdrop-blur-md transition-transform hover:translate-y-[-2px] hover:bg-white/5"
      style={{
        background: `linear-gradient(135deg, ${color}16 0%, ${color}08 100%)`,
        borderColor: `${color}28`,
        boxShadow: `0 0 24px ${color}18`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <span className="text-xs sm:text-sm font-semibold text-white/80 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function ServiceGrid() {
  return (
    <section className="w-full py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white/30 mb-14">
          Services We Cover
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ label, Icon, color }) => (
            <ServiceCard key={label} label={label} Icon={Icon} color={color} />
          ))}
        </div>
      </div>
    </section>
  );
}

