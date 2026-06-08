import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-background px-8 py-12 mt-24">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-xl">Malaysia Co (Maintenance Services)</h3>
          <p className="text-muted-foreground text-sm">
            Connecting customers with trusted technicians for home services.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Customer</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">How it works</Link></li>
            <li><Link href="/jobs" className="hover:text-foreground transition-colors">Find jobs</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Technician</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/technician/signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
            <li><Link href="/skills" className="hover:text-foreground transition-colors">Skills</Link></li>
            <li><Link href="/support" className="hover:text-foreground transition-colors flex items-center gap-2"><Mail className="h-4 w-4" />Support</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

