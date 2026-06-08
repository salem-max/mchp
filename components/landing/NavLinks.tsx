"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Wrench, Zap, Droplets, Thermometer } from "lucide-react";

const mainLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
];

const serviceLinks = [
  { href: "/services/maintenance", label: "Maintenance", icon: Wrench, description: "General repairs & upkeep" },
  { href: "/services/plumbing", label: "Plumbing", icon: Droplets, description: "Pipes, fixtures & drainage" },
  { href: "/services/electrical", label: "Electrical", icon: Zap, description: "Wiring & installations" },
  { href: "/services/ac-repair", label: "AC Repair", icon: Thermometer, description: "Cooling system services" },
];

export default function NavLinks() {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <div className="hidden md:flex items-center gap-1">
      {/* Services dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setServicesOpen(true)}
        onMouseLeave={() => setServicesOpen(false)}
      >
        <button
          className="flex items-center gap-1 px-4 py-2 text-base font-medium text-[#A09B93] hover:text-[#FF6B35] transition-colors rounded-lg"
          aria-expanded={servicesOpen}
          aria-haspopup="true"
        >
          Services
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              servicesOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown menu */}
        <div
          className={`absolute top-full left-0 mt-2 w-72 bg-[#1A1A1A] border border-orange-500/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
            servicesOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="p-2">
            {serviceLinks.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-500/10 transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 text-[#FF6B35] group-hover:bg-orange-500/20 transition-colors">
                  <service.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-[#F0EDE6] group-hover:text-[#FF6B35] transition-colors">
                    {service.label}
                  </div>
                  <div className="text-sm text-[#A09B93]">{service.description}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-orange-500/10 p-2">
            <Link
              href="/services"
              className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-[#FF6B35] hover:bg-orange-500/10 rounded-xl transition-colors"
            >
              View All Services
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </Link>
          </div>
        </div>
      </div>

      {/* Other links */}
      {mainLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-4 py-2 text-base font-medium text-[#A09B93] hover:text-[#FF6B35] transition-colors rounded-lg"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
