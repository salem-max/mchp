'use client';

import Link from 'next/link';
import { Search, HardHat, ChevronDown, Zap, Droplets, Thermometer } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-x-hidden">
      {/* Animated blobs - smaller on mobile */}
      <div className="hero-blob w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#FF6B35] top-[10%] left-[-15%] sm:left-[-10%]" />
      <div className="hero-blob w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#FFB347] top-[30%] right-[-10%] sm:right-[-5%]" style={{ animationDelay: '3s' }} />
      <div className="hero-blob w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#FF6B35] bottom-[10%] left-[30%]" style={{ animationDelay: '5s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left content */}
        <div className="flex-1 min-w-0 text-center lg:text-left">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 glass border-[#00d4ff]/20">
            <span className="w-2 h-2 rounded-full animate-pulse bg-[#00d4ff]" />
            <span className="text-[#00d4ff]">Live — 2,400+ technicians</span>
          </div>
<h1 className="reveal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-4 sm:mb-6 break-words">

            <span className="gradient-text">Malaysia Co (Maintenance Services)</span>
            <br />
            <span className="text-[#F0EDE6]">Get help.<span className="hidden sm:inline"> </span>Earn extra.</span>
          </h1>
<p className="reveal text-base sm:text-lg max-w-xl mb-6 sm:mb-8 leading-relaxed break-words text-[#A09B93]">
            A two-sided platform connecting customers with vetted part-time technicians for home &amp; office maintenance — plumbing, electrical, AC, carpentry, and more.
          </p>
          <div className="reveal flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
            <Link 
              href="/login"
              className="cta-primary flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] text-black hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Search className="w-5 h-5" />
              Post a Job
            </Link>
            <Link 
              href="/signup"
              className="flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg bg-orange-500/15 text-[#FF6B35] border-2 border-orange-500/30 hover:border-[#FF6B35] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <HardHat className="w-5 h-5" />
              Join as Technician
            </Link>
          </div>
          <div className="reveal flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10 justify-center lg:justify-start text-[#A09B93]">
            <div className="flex -space-x-2 sm:-space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-xs sm:text-sm font-medium bg-[#FF6B35] text-black">A</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-xs sm:text-sm font-medium bg-[#FFB347] text-black">M</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-xs sm:text-sm font-medium bg-[#FF6B35] text-black">K</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-xs sm:text-sm font-medium bg-[#FFB347] text-black">+</div>
            </div>
            <span className="text-xs sm:text-sm">
              <strong className="text-[#F0EDE6]">4.9★</strong> from 1,200+ reviews
            </span>
          </div>
        </div>

        {/* Right: 3D floating cards - hidden on very small screens, shown on sm+ */}
        <div className="hidden sm:flex flex-1 scene-3d relative min-h-[350px] lg:min-h-[450px]">
          <div className="float-card absolute rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl bg-gradient-to-br from-[#1A1A1A] to-[#222] border border-orange-500/15 top-0 right-0 w-[220px] lg:w-[280px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-500/15">
                <Zap className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <div>
                <div className="font-bold text-sm">Electrical Fix</div>
                <div className="text-xs text-[#A09B93]">Aus. • ★ 4.9</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">In Progress</span>
              <span className="font-['Space_Mono'] text-[#FFB347]">$85</span>
            </div>
          </div>
          <div className="float-card absolute rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl bg-gradient-to-br from-[#1A1A1A] to-[#222] border border-orange-400/15 top-[100px] lg:top-[140px] left-0 w-[200px] lg:w-[260px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-400/15">
                <Droplets className="w-6 h-6 text-[#FFB347]" />
              </div>
              <div>
                <div className="font-bold text-sm">Plumbing</div>
                <div className="text-xs text-[#A09B93]">Sara L. • ★ 4.8</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400">Scheduled</span>
              <span className="font-['Space_Mono'] text-[#FFB347]">$120</span>
            </div>
          </div>
          <div className="float-card absolute rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl bg-gradient-to-br from-[#1A1A1A] to-[#222] border border-orange-500/10 bottom-0 right-4 lg:right-10 w-[180px] lg:w-[240px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-500/15">
                <Thermometer className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <div>
                <div className="font-bold text-sm">AC Repair</div>
                <div className="text-xs text-[#A09B93]">Mike T. • ★ 5.0</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/15 text-[#FF6B35]">Completed ✓</span>
              <span className="font-['Space_Mono'] text-[#FFB347]">$65</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="hidden sm:flex absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[#A09B93] animate-bounce">
        <span className="text-xs">Scroll to explore</span>
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
}
