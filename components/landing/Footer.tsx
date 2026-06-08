import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-16 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-card rounded-3xl p-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00d4ff] to-[#00ffa3]">
              <Zap className="w-4 h-4 text-[#0B0B0F]" />
            </div>
            <span className="text-xl font-extrabold gradient-text">Malaysia Co (Maintenance Services)</span>
          </div>
          <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
            Join thousands of happy customers and technicians already using Malaysia Co (Maintenance Services).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/signup" className="cta-primary px-8 py-3 rounded-xl font-bold text-sm">
              Sign Up Free
            </Link>
            <a
              href="https://github.com/NMFirdaus/maintenance-services"
              className="btn-outline-neon px-8 py-3 rounded-xl font-bold text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
<span>© 2026 Malaysia Co (Maintenance Services). On-demand repair revolution.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-white/50 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
