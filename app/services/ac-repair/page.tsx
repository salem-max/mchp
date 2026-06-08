'use client';

import { useEffect } from 'react';
import { Thermometer } from 'lucide-react';
import CloudBanner from '@/components/landing/CloudBanner';
import ServiceFeatures from '@/components/landing/ServiceFeatures';
import ServiceCTA from '@/components/landing/ServiceCTA';

const features = [
  {
    title: 'AC Installation',
    description: 'Professional installation of all AC types including split, window, and central air systems.',
  },
  {
    title: 'AC Repair & Service',
    description: 'Expert diagnosis and repair of cooling issues, refrigerant leaks, and compressor problems.',
  },
  {
    title: 'Preventive Maintenance',
    description: 'Regular servicing to keep your AC running efficiently and extend its lifespan.',
  },
  {
    title: 'Duct Cleaning & Repair',
    description: 'Clean and repair ductwork for improved air quality and system efficiency.',
  },
];

const benefits = [
  'Certified HVAC technicians',
  'All AC brands serviced',
  'Energy efficiency optimization',
  '90-day repair warranty',
];

export default function ACRepairPage() {
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
        backgroundImage: `linear-gradient(rgba(0,188,212,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,188,212,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      <CloudBanner
        title="AC Repair"
        subtitle="Stay Cool & Comfortable"
        description="Beat the heat with our expert AC repair and maintenance services. Our certified HVAC technicians ensure your cooling system runs at peak performance year-round."
        icon={Thermometer}
        accentColor="#00BCD4"
        secondaryColor="#4DD0E1"
      />

      <ServiceFeatures
        serviceName="AC Repair"
        features={features}
        benefits={benefits}
        accentColor="#00BCD4"
        secondaryColor="#4DD0E1"
      />

      <ServiceCTA
        serviceName="AC Repair"
        accentColor="#00BCD4"
        secondaryColor="#4DD0E1"
      />
    </div>
  );
}
