import Link from 'next/link';
import { Wrench, Search } from 'lucide-react';

export default function CTA() {
  return (
    <section className="w-full py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="hero-blob w-[500px] h-[500px] bg-[#00d4ff] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <div className="glass-card rounded-3xl p-12">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 glass border-[#00d4ff]/15 text-[#00d4ff]">
            Get Started in Minutes
          </div>
          <h2 className="reveal text-4xl sm:text-5xl font-extrabold mb-6">
            Ready to <span className="gradient-text">Malaysia Co (Maintenance Services)?</span>
          </h2>
          <p className="reveal text-lg mb-10 text-white/40">
            Whether you need a repair done or want to earn extra on your own schedule — we&apos;ve got you covered.
          </p>
          <div className="reveal flex flex-col sm:flex-row gap-4 justify-center">
<Link href="/dashboard/customer?demo=true" className="cta-primary px-10 py-4 rounded-2xl font-bold text-base">
              <span className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Try Customer Dashboard
              </span>
            </Link>
            <Link href="/dashboard/technician?demo=true" className="btn-outline-neon px-10 py-4 rounded-2xl font-bold text-base">
              <span className="flex items-center justify-center gap-2">
                <Wrench className="w-5 h-5" />
                Try Technician Dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
