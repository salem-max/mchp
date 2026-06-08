"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Menu } from "lucide-react";
import NavLinks from "./NavLinks";
import MobileDrawer from "./MobileDrawer";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0D0D0D]/98 backdrop-blur-xl border-b border-orange-500/10 shadow-lg shadow-black/20"
            : "bg-[#0D0D0D]/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] bg-clip-text text-transparent"
          >
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF6B35]" />
            <span className="hidden xs:inline">Malaysia Co (Maintenance Services)</span>
          </Link>

          {/* Desktop Navigation */}
          <NavLinks />

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-base font-medium text-[#A09B93] hover:text-[#FF6B35] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl font-bold text-base bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] text-black hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-orange-500/25"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500/10 text-[#FF6B35] hover:bg-orange-500/20 transition-colors md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
