'use client';

import { ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';

interface ServiceCTAProps {
  serviceName: string;
  accentColor?: string;
  secondaryColor?: string;
}

export default function ServiceCTA({
  serviceName,
  accentColor = '#FF6B35',
  secondaryColor = '#FFB347',
}: ServiceCTAProps) {
  return (
    <section className="w-full py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div
          className="reveal rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15, ${secondaryColor}10)`,
            border: `2px solid ${accentColor}20`,
          }}
        >
          {/* Cloud decorations */}
          <div
            className="absolute -top-10 -left-10 w-[200px] h-[100px] rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="absolute -bottom-10 -right-10 w-[250px] h-[120px] rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: secondaryColor }}
          />

          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4 text-[#F0EDE6]">
              Need {serviceName} Help?
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-[#A09B93]">
              Get connected with a verified {serviceName.toLowerCase()} expert in minutes.
              Same-day service available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/customer/post-job"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-black hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})` }}
              >
                Post a Job Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border-2 hover:scale-105 transition-all"
                style={{
                  backgroundColor: `${accentColor}20`,
                  color: accentColor,
                  borderColor: `${accentColor}30`,
                }}
              >
                <Phone className="w-5 h-5" />
                Call Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
