import Link from 'next/link';
import { LayoutDashboard, Users, Wrench, Shield, BarChart3 } from 'lucide-react';

const dashboards = [
  {
    name: 'Customer Dashboard',
    description: 'Post jobs, find technicians, track progress, and manage your service requests.',
    icon: Users,
    href: '/dashboard/customer?demo=true&role=CUSTOMER',
    color: '#00d4ff',
    features: ['Post Jobs', 'Browse Technicians', 'Real-time Chat', 'Payment Escrow'],
  },
  {
    name: 'Technician Dashboard',
    description: 'Find jobs, manage your schedule, track earnings, and build your reputation.',
    icon: Wrench,
    href: '/dashboard/technician?demo=true&role=TECHNICIAN',
    color: '#00ffa3',
    features: ['Job Discovery', 'Earnings Tracking', 'Availability Management', 'Ratings'],
  },
  {
    name: 'Admin Dashboard',
    description: 'Monitor platform metrics, manage users, resolve disputes, and ensure quality.',
    icon: Shield,
    href: '/dashboard/admin?demo=true&role=ADMIN',
    color: '#7b61ff',
    features: ['User Management', 'Dispute Resolution', 'Analytics', 'Reporting'],
  },
  {
    name: 'CMMS Dashboard',
    description: 'Computerized Maintenance Management System for asset tracking and work orders.',
    icon: BarChart3,
    href: '/dashboard/cmms',
    color: '#ff6b6b',
    features: ['Asset Tracking', 'Work Orders', 'Digital Twins', 'IoT Integration'],
  },
];

export default function Dashboards() {
  return (
    <section id="dashboards" className="w-full py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4 glass border-[#00d4ff]/15 text-[#00d4ff]">
            Access Your Dashboard
          </div>
          <h2 className="reveal text-4xl md:text-5xl font-extrabold mb-6">
            Choose Your<br /><span className="gradient-text">Dashboard</span>
          </h2>
          <p className="reveal text-lg md:text-xl max-w-2xl mx-auto text-white/40">
            Tailored interfaces for every user type with powerful features and real-time insights.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <Link
                key={dashboard.name}
                href={dashboard.href}
                className="reveal group"
              >
                <div className="h-full glass-card rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20 flex flex-col">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${dashboard.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: dashboard.color }} />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold mb-2 group-hover:text-white/90 transition-colors">
                    {dashboard.name}
                  </h3>
                  <p className="text-sm text-white/60 mb-4 flex-grow">
                    {dashboard.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {dashboard.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-white/50">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: dashboard.color }}
                        />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6 pt-4 border-t border-white/10 w-full">
                    <div
                      className="text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-2"
                      style={{ color: dashboard.color }}
                    >
                      Access Dashboard
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Access CTA */}
        <div className="reveal text-center">
          <p className="text-white/60 mb-4">
            Not yet registered? Start as a customer or technician to unlock full dashboard access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=customer"
              className="cta-primary px-8 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <Users className="w-5 h-5" />
              I Need Service
            </Link>
            <Link
              href="/signup?role=technician"
              className="btn-outline-neon px-8 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <Wrench className="w-5 h-5" />
              I Provide Service
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
