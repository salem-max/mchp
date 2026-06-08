'use client';

const row1 = [
  { name: 'Next.js 15', icon: '▲' },
  { name: 'TypeScript', icon: 'TS' },
  { name: 'Tailwind CSS', icon: '🌊' },
  { name: 'Prisma', icon: '◈' },
  { name: 'Supabase', icon: '⚡' },
  { name: 'Stripe', icon: '💳' },
  { name: 'OpenAI', icon: '✦' },
  { name: 'Vercel', icon: '▲' },
];

const row2 = [
  { name: 'React 19', icon: '⚛' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Framer Motion', icon: '◎' },
  { name: 'Recharts', icon: '📊' },
  { name: 'Radix UI', icon: '◉' },
  { name: 'Resend', icon: '✉' },
  { name: 'JWT Auth', icon: '🔐' },
  { name: 'shadcn/ui', icon: '🎨' },
];

function Badge({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl glass-card mx-2 group cursor-default">
      <span className="text-base leading-none">{icon}</span>
      <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

function BannerRow({ items, reverse = false }: { items: typeof row1; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden relative">
      <div
        className="flex"
        style={{
          animation: `banner-scroll${reverse ? '-reverse' : ''} ${items.length * 4}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <Badge key={i} name={item.name} icon={item.icon} />
        ))}
      </div>
    </div>
  );
}

export default function TechStack() {
  return (
    <section className="w-full py-24 overflow-hidden">
      {/* Keyframes injected inline so no extra CSS file needed */}
      <style>{`
        @keyframes banner-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes banner-scroll-reverse {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="reveal text-4xl font-extrabold mb-3">Built with Modern Tech</h2>
        <p className="reveal text-white/40 text-sm">Production-grade stack, zero compromises.</p>
      </div>

      {/* Banner wrapper with edge fade */}
      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="flex flex-col gap-4 py-2">
          <BannerRow items={row1} />
          <BannerRow items={row2} reverse />
        </div>
      </div>
    </section>
  );
}
