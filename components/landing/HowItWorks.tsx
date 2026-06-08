import Link from 'next/link';
import { FileText, Users, CheckCircle } from 'lucide-react';

const steps = [
  { number: '01', icon: FileText, title: 'Post Your Job', desc: 'Describe the issue, upload photos, set your budget. Our AI suggests the right category and fair price range.', href: '/dashboard/customer/post-job?demo=true&role=CUSTOMER' },
  { number: '02', icon: Users, title: 'Match & Chat', desc: 'Browse vetted technicians nearby. Chat in-app, check reviews, and confirm the booking with secure escrow.', href: '/dashboard/technician/feed?demo=true&role=TECHNICIAN' },
  { number: '03', icon: CheckCircle, title: 'Done & Pay', desc: 'Job complete? Release payment from escrow. Rate your technician and help the community.', href: '/dashboard/customer/jobs?demo=true&role=CUSTOMER' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4 glass border-[#00ffa3]/15 text-[#00ffa3]">
            Simple Process
          </div>
          <h2 className="reveal text-4xl sm:text-5xl font-extrabold">How Malaysia Co (Maintenance Services) Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <Link key={idx} href={step.href} className="reveal tilt-card glass-card rounded-3xl p-8 relative overflow-hidden block hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full" style={{ background: 'rgba(0, 212, 255, 0.04)' }} />
              <div className="stat-number text-6xl font-bold mb-4 text-white/[0.06]">{step.number}</div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-[#00d4ff]/10 neon-ring">
                <step.icon className="w-7 h-7 text-[#00d4ff]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm leading-relaxed text-white/40">{step.desc}</p>
              <div className="mt-4 text-xs text-[#00d4ff] font-medium flex items-center gap-1">
                Try it →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
