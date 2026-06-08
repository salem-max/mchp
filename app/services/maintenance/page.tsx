'use client';

import { useEffect } from 'react';
import { Wrench } from 'lucide-react';
import CloudBanner from '@/components/landing/CloudBanner';
import ServiceFeatures from '@/components/landing/ServiceFeatures';
import ServiceCTA from '@/components/landing/ServiceCTA';

const features = [
  {
    title: 'General Repairs',
    description: 'From squeaky doors to broken fixtures, we handle all general home and office repairs efficiently.',
  },
  {
    title: 'Preventive Maintenance',
    description: 'Regular inspections and maintenance to prevent costly repairs and extend the life of your systems.',
  },
  {
    title: 'Handyman Services',
    description: 'Furniture assembly, mounting, installations, and various odd jobs around your property.',
  },
  {
    title: 'Emergency Repairs',
    description: 'Quick response for urgent maintenance issues that cannot wait. Available 24/7.',
  },
];

const benefits = [
  'Multi-skilled technicians for various tasks',
  'Flexible scheduling including weekends',
  'No job too small or too big',
  'Transparent hourly or fixed pricing',
];

export default function MaintenancePage() {
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
        backgroundImage: `linear-gradient(rgba(76,175,80,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(76,175,80,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      <CloudBanner
        title="Maintenance"
        subtitle="Keep Everything Running"
        description="Professional maintenance services for your home and office. Our skilled technicians handle everything from minor repairs to comprehensive upkeep, ensuring your space stays in perfect condition."
        icon={Wrench}
        accentColor="#4CAF50"
        secondaryColor="#81C784"
      />

      <ServiceFeatures
        serviceName="Maintenance"
        features={features}
        benefits={benefits}
        accentColor="#4CAF50"
        secondaryColor="#81C784"
      />

      <ServiceCTA
        serviceName="Maintenance"
        accentColor="#4CAF50"
        secondaryColor="#81C784"
      />
    </div>
  );
}
