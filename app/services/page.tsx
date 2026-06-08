'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Droplets, Zap, Thermometer, ArrowRight } from 'lucide-react';

const services = [
  {
    name: 'Maintenance',
    description: 'General repairs, handyman services, and preventive maintenance for your home and office.',
    icon: Wrench,
    href: '/services/maintenance',
    accentColor: '#4CAF50',
    secondaryColor: '#81C784',
  },
  {
    name: 'Plumbing',
    description: 'Leak repairs, drain cleaning, pipe installations, and water heater services.',
    icon: Droplets,
    href: '/services/plumbing',
    accentColor: '#2196F3',
    secondaryColor: '#64B5F6',
  },
  {
    name: 'Electrical',
    description: 'Wiring, panel upgrades, lighting installation, and electrical troubleshooting.',
    icon: Zap,
    href: '/services/electrical',
    accentColor: '#FFC107',
    secondaryColor: '#FFD54F',
  },
  {
    name: 'AC Repair',
    description: 'AC installation, repair, maintenance, and duct cleaning services.',
    icon: Thermometer,
    href: '/services/ac-repair',
    accentColor: '#00BCD4',
    secondaryColor: '#4DD0E1',
  },
];

export default function ServicesPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="w-full min-h-screen bg-[#0D0D0D] text-[#F0EDE6] font-['Sora'] overflow-x-hidden relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      {/* Cloud shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/4 w-[400px] h-[200px] rounded-full opacity-[0.06] blur-3xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347]" />
        <div className="absolute -right-20 top-1/3 w-[350px] h-[180px] rounded-full opacity-[0.06] blur-3xl bg-gradient-to-l from-[#FFB347] to-[#FF6B35]" />
        <div className="absolute left-1/3 bottom-1/4 w-[300px] h-[150px] rounded-full opacity-[0.05] blur-3xl bg-[#FF6B35]" />
      </div>

      <section className="relative z-10 w-full pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 bg-orange-500/15 text-[#FFB347] border border-orange-500/20">
              <span className="w-2 h-2 rounded-full animate-pulse bg-[#FF6B35]" />
              Professional Services
            </div>
            <h1 className="reveal text-5xl sm:text-6xl font-extrabold leading-[1.05] mb-6">
              <span className="gradient-text">Our Services</span>
            </h1>
            <p className="reveal text-lg leading-relaxed text-[#A09B93]">
              From routine maintenance to emergency repairs, our verified technicians are ready to help. 
              Choose a service below to learn more and book an expert.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <Link
                key={service.name}
                href={service.href}
                className="reveal group relative rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] border"
                style={{
                  background: `linear-gradient(135deg, ${service.accentColor}08, ${service.secondaryColor}05)`,
                  borderColor: `${service.accentColor}15`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ background: `${service.accentColor}10` }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${service.accentColor}15` }}
                    >
                      <service.icon className="w-8 h-8" style={{ color: service.accentColor }} />
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: `${service.accentColor}20` }}
                    >
                      <ArrowRight className="w-5 h-5" style={{ color: service.accentColor }} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-[#F0EDE6]">{service.name}</h3>
                  <p className="text-[#A09B93] mb-6">{service.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${service.accentColor}15`, color: service.accentColor }}
                    >
                      24/7 Available
                    </span>
                    <span className="text-[#A09B93]">4.9★ Rating</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="reveal text-center mt-16">
            <p className="text-[#A09B93] mb-6">
              Not sure which service you need? Post a job and we&apos;ll match you with the right expert.
            </p>
            <Link
              href="/customer/post-job"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] text-black hover:scale-105 transition-transform"
            >
              Post a Job
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
