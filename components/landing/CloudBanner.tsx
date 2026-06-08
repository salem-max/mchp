'use client';

import * as React from 'react';

interface CloudBannerProps {
  title: string;
  subtitle: string;
  description: string;
  /** React element (e.g., <Wrench className="..." />) */
  icon: React.ReactNode;
  accentColor?: string;
  secondaryColor?: string;
}

export default function CloudBanner({
  title,
  subtitle,
  description,
  icon,
  accentColor = '#FF6B35',
  secondaryColor = '#FFB347',
}: CloudBannerProps) {
  return (
    <section className="relative w-full min-h-[70vh] pt-32 pb-20 overflow-hidden">
      {/* Cloud shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large cloud - left */}
        <div
          className="absolute -left-20 top-1/4 w-[400px] h-[200px] rounded-full opacity-[0.08] blur-3xl animate-float-slow"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})` }}
        />
        <div
          className="absolute -left-10 top-[30%] w-[250px] h-[120px] rounded-full opacity-[0.06] blur-2xl animate-float-slow animation-delay-1000"
          style={{ backgroundColor: accentColor }}
        />

        {/* Large cloud - right */}
        <div
          className="absolute -right-20 top-1/3 w-[350px] h-[180px] rounded-full opacity-[0.08] blur-3xl animate-float-slow animation-delay-2000"
          style={{ background: `linear-gradient(225deg, ${secondaryColor}, ${accentColor})` }}
        />
        <div
          className="absolute -right-5 top-[40%] w-[200px] h-[100px] rounded-full opacity-[0.06] blur-2xl animate-float-slow animation-delay-3000"
          style={{ backgroundColor: secondaryColor }}
        />

        {/* Floating cloud elements */}
        <div
          className="absolute left-[20%] top-[15%] w-[150px] h-[80px] rounded-full opacity-[0.05] blur-xl animate-float"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute right-[25%] top-[20%] w-[120px] h-[60px] rounded-full opacity-[0.04] blur-xl animate-float animation-delay-1500"
          style={{ backgroundColor: secondaryColor }}
        />
        <div
          className="absolute left-[40%] bottom-[20%] w-[180px] h-[90px] rounded-full opacity-[0.06] blur-2xl animate-float animation-delay-2500"
          style={{ background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})` }}
        />

        {/* Small floating particles */}
        <div
          className="absolute left-[10%] top-[60%] w-[60px] h-[60px] rounded-full opacity-[0.1] blur-lg animate-float-particle"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute right-[15%] top-[70%] w-[40px] h-[40px] rounded-full opacity-[0.08] blur-md animate-float-particle animation-delay-1000"
          style={{ backgroundColor: secondaryColor }}
        />
        <div
          className="absolute left-[60%] top-[25%] w-[50px] h-[50px] rounded-full opacity-[0.07] blur-lg animate-float-particle animation-delay-2000"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${accentColor}20 1px, transparent 1px),
                            linear-gradient(90deg, ${accentColor}20 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto min-w-0">
          {/* Badge */}
          <div
            className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 border"
            style={{
              backgroundColor: `${accentColor}15`,
              color: secondaryColor,
              borderColor: `${accentColor}20`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            Professional {title} Services
          </div>

          {/* Icon container - now renders the passed element directly */}
          <div
            className="reveal w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${secondaryColor}20)`,
              border: `2px solid ${accentColor}30`,
            }}
          >
            {icon}
          </div>

          {/* Title */}
<h1 className="reveal text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 break-words"> 

            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})` }}
            >
              {title}
            </span>
            <br />
            <span className="text-[#F0EDE6]">{subtitle}</span>
          </h1>

          {/* Description */}
          <p className="reveal text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-[#A09B93]">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="reveal flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="cta-primary px-8 py-4 rounded-2xl font-bold text-lg text-black hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})` }}
            >
              Book a {title} Expert
            </button>
            <button
              className="px-8 py-4 rounded-2xl font-bold text-lg border-2 hover:scale-105 transition-all"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
                borderColor: `${accentColor}30`,
              }}
            >
              View Pricing
            </button>
          </div>

          {/* Trust indicators */}
          <div className="reveal flex items-center gap-6 mt-10 justify-center text-[#A09B93]">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                ✓
              </div>
              <span className="text-sm">Verified Experts</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}
              >
                24
              </div>
              <span className="text-sm">Same-Day Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                ★
              </div>
              <span className="text-sm">4.9 Rating</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-10px) translateX(5px) scale(1.1);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-20px) translateX(-5px) scale(1);
            opacity: 0.1;
          }
          75% {
            transform: translateY(-10px) translateX(10px) scale(0.9);
            opacity: 0.08;
          }
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 10s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1500 {
          animation-delay: 1.5s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-2500 {
          animation-delay: 2.5s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </section>
  );
}