'use client';

import Link from 'next/link'
import { Mail, Wrench } from 'lucide-react'

export default function ClientFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur py-12 xs:py-16 mt-24" role="contentinfo">
      <div className="container-responsive grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8 xs:gap-6 lg:gap-12">
        {/* Brand */}
        <div className="space-y-4 col-span-1 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 group touch-target mb-4 p-2 rounded-lg hover:bg-accent/50 focus-ring transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-scale">Malaysia Co (Maintenance Services)</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Connecting customers with trusted technicians for fast, reliable home services.
          </p>
        </div>

        {/* Customer Links */}
        <nav aria-label="Customer links">
          <h4 className="font-semibold text-base mb-6 text-scale">Customer</h4>
          <ul className="space-y-3">
            <li><Link href="/how-it-works" className="text-sm hover:text-foreground transition-colors block py-1 touch-target focus-ring">How it works</Link></li>
            <li><Link href="/jobs" className="text-sm hover:text-foreground transition-colors block py-1 touch-target focus-ring">Find jobs</Link></li>
            <li><Link href="/pricing" className="text-sm hover:text-foreground transition-colors block py-1 touch-target focus-ring">Pricing</Link></li>
          </ul>
        </nav>

        {/* Technician Links */}
        <nav aria-label="Technician links">
          <h4 className="font-semibold text-base mb-6 text-scale">Technician</h4>
          <ul className="space-y-3">
            <li><Link href="/technician/signup" className="text-sm hover:text-foreground transition-colors block py-1 touch-target focus-ring">Sign up</Link></li>
            <li><Link href="/skills" className="text-sm hover:text-foreground transition-colors block py-1 touch-target focus-ring">Skills</Link></li>
            <li><Link href="/support" className="text-sm hover:text-foreground transition-colors flex items-center gap-2 py-1 touch-target focus-ring"><Mail className="h-4 w-4 flex-shrink-0" />Support</Link></li>
          </ul>
        </nav>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-muted/20 mt-12 pt-8 xs:pt-12">
        <div className="container-responsive flex flex-col xs:flex-row flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="min-w-0">&copy; 2024 Malaysia Co (Maintenance Services). All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors touch-target focus-ring px-2 py-1 rounded">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors touch-target focus-ring px-2 py-1 rounded">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors touch-target focus-ring px-2 py-1 rounded">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

