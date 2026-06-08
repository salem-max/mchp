'use client';

import { useEffect } from 'react';
import { Droplets } from 'lucide-react';
import CloudBanner from '@/components/landing/CloudBanner';
import ServiceFeatures from '@/components/landing/ServiceFeatures';
import ServiceCTA from '@/components/landing/ServiceCTA';

const features = [
  {
    title: 'Leak Detection & Repair',
    description: 'Advanced detection methods to find hidden leaks and expert repairs to prevent water damage.',
  },
  {
    title: 'Drain Cleaning',
    description: 'Professional unclogging of sinks, toilets, and floor drains using modern equipment.',
  },
  {
    title: 'Pipe Installation & Repair',
    description: 'New pipe installations, replacements, and repairs for residential and commercial properties.',
  },
  {
    title: 'Water Heater Services',
    description: 'Installation, repair, and maintenance of all types of water heaters including tankless systems.',
  },
];

const benefits = [
  'Licensed and certified plumbers',
  'Emergency 24/7 plumbing services',
  'Upfront pricing with no hidden fees',
  'Warranty on all repairs and parts',
];

export default function PlumbingPage() {
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
        backgroundImage: `linear-gradient(rgba(33,150,243,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(33,150,243,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      <CloudBanner
        title="Plumbing"
        subtitle="Expert Water Solutions"
        description="From leaky faucets to complete pipe replacements, our certified plumbers deliver reliable solutions. Fast response times and quality workmanship guaranteed."
        icon={Droplets}
        accentColor="#2196F3"
        secondaryColor="#64B5F6"
      />

      <ServiceFeatures
        serviceName="Plumbing"
        features={features}
        benefits={benefits}
        accentColor="#2196F3"
        secondaryColor="#64B5F6"
      />

      <ServiceCTA
        serviceName="Plumbing"
        accentColor="#2196F3"
        secondaryColor="#64B5F6"
      />
    </div>
  );
}
