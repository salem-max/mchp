'use client';

import { useEffect } from 'react';
import { Zap } from 'lucide-react';
import CloudBanner from '@/components/landing/CloudBanner';
import ServiceFeatures from '@/components/landing/ServiceFeatures';
import ServiceCTA from '@/components/landing/ServiceCTA';

const features = [
  {
    title: 'Wiring & Rewiring',
    description: 'Complete electrical wiring for new constructions and safe rewiring for older buildings.',
  },
  {
    title: 'Panel Upgrades',
    description: 'Upgrade your electrical panel to handle modern power demands safely and efficiently.',
  },
  {
    title: 'Lighting Installation',
    description: 'Indoor and outdoor lighting installation, including smart lighting systems and fixtures.',
  },
  {
    title: 'Troubleshooting & Repairs',
    description: 'Diagnose and fix electrical issues including outlets, switches, and circuit problems.',
  },
];

const benefits = [
  'Licensed master electricians',
  'Code-compliant installations',
  'Safety inspections included',
  'Energy-efficient solutions',
];

export default function ElectricalPage() {
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
        backgroundImage: `linear-gradient(rgba(255,193,7,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,193,7,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      <CloudBanner
        title="Electrical"
        subtitle="Safe & Reliable Power"
        description="Professional electrical services from certified electricians. We ensure your home or business has safe, reliable, and efficient electrical systems."
        icon={Zap}
        accentColor="#FFC107"
        secondaryColor="#FFD54F"
      />

      <ServiceFeatures
        serviceName="Electrical"
        features={features}
        benefits={benefits}
        accentColor="#FFC107"
        secondaryColor="#FFD54F"
      />

      <ServiceCTA
        serviceName="Electrical"
        accentColor="#FFC107"
        secondaryColor="#FFD54F"
      />
    </div>
  );
}
