"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { X, ChevronDown, FileText, Search, HardHat, Wrench, Zap, Droplets, Thermometer } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/services", label: "Services", hasSubmenu: true },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
];

const serviceLinks = [
  { href: "/services/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/services/plumbing", label: "Plumbing", icon: Droplets },
  { href: "/services/electrical", label: "Electrical", icon: Zap },
  { href: "/services/ac-repair", label: "AC Repair", icon: Thermometer },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLAnchorElement>(null);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap
      if (e.key === "Tab" && isOpen) {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus first element when opened
  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Services submenu state
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#0D0D0D] border-r border-orange-500/20 z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-500/10">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] bg-clip-text text-transparent"
          >
            <FileText className="w-6 h-6 text-[#FF6B35]" />
            Malaysia Co (Maintenance Services)
          </Link>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500/10 text-[#FF6B35] hover:bg-orange-500/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="flex items-center justify-between w-full h-12 px-4 text-lg font-semibold text-[#F0EDE6] hover:text-[#FF6B35] hover:bg-orange-500/10 rounded-xl transition-all duration-200"
                      aria-expanded={servicesOpen}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-5 h-5 text-[#A09B93] transition-transform duration-200 ${
                          servicesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* Submenu */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        servicesOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="mt-2 ml-4 space-y-1 border-l-2 border-orange-500/20 pl-4">
                        {serviceLinks.map((service) => (
                          <li key={service.href}>
                            <Link
                              href={service.href}
                              onClick={onClose}
                              className="flex items-center gap-3 h-11 px-3 text-base text-[#A09B93] hover:text-[#FF6B35] hover:bg-orange-500/5 rounded-lg transition-all duration-200"
                            >
                              <service.icon className="w-4 h-4" />
                              {service.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href="/services"
                            onClick={onClose}
                            className="flex items-center gap-3 h-11 px-3 text-base text-[#FF6B35] hover:bg-orange-500/5 rounded-lg transition-all duration-200 font-medium"
                          >
                            View All Services
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center h-12 px-4 text-lg font-semibold text-[#F0EDE6] hover:text-[#FF6B35] hover:bg-orange-500/10 rounded-xl transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* CTAs */}
        <div className="p-4 space-y-3 border-t border-orange-500/10">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] text-black hover:opacity-90 transition-opacity"
          >
            <Search className="w-5 h-5" />
            Post a Job
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            ref={lastFocusableRef}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-base bg-orange-500/15 text-[#FF6B35] border border-orange-500/30 hover:border-[#FF6B35] transition-colors"
          >
            <HardHat className="w-5 h-5" />
            Join as Technician
          </Link>
        </div>
      </div>
    </>
  );
}
