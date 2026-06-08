"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wrench, Shield, Building2, UserCheck2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const roles = [
  {
    id: 'CUSTOMER',
    title: 'Customer',
    subtitle: 'Homeowners & businesses posting maintenance jobs',
    description: 'Post jobs, hire technicians, track progress, pay securely',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    href: '/signup?role=customer',
    badge: 'Most Popular'
  },
  {
    id: 'TECHNICIAN',
    title: 'Technician',
    subtitle: 'Skilled professionals earning on their schedule',
    description: 'Find nearby jobs, set availability, get paid fast, build ratings',
    icon: Wrench,
    color: 'from-emerald-500 to-green-600',
    href: '/signup?role=technician',
    badge: 'Earn Money'
  },
  {
    id: 'ADMIN',
    title: 'Business Admin',
    subtitle: 'Facility managers & service companies',
    description: 'Manage teams, track assets, schedule maintenance, analytics',
    icon: Building2,
    color: 'from-purple-500 to-pink-600',
    href: '/signup?role=admin'
  }
]

export default function RoleSelector() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold mb-6">
          <UserCheck2 className="w-5 h-5" />
          Choose your role
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
          Join Malaysia Co (Maintenance Services)
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
          The platform connecting customers with trusted technicians for all your maintenance needs
        </p>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Plumbing • Electrical • AC Repair • Carpentry • Appliance Repair • And More
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {roles.map((role) => (
          <Link key={role.id} href={role.href} className="group">
            <Card className="h-full border-0 bg-gradient-to-br hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 border-transparent hover:-translate-y-2 hover:border-blue-200/50">
              <CardHeader className="pb-6">
                <div className="w-fit p-4 bg-gradient-to-br rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <role.icon className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-gray-600">
                    {role.subtitle}
                  </CardDescription>
                  {role.badge && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold hover:from-yellow-500 hover:to-orange-600">
                      {role.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-8">{role.description}</p>
                <Button size="lg" className="w-full font-semibold group-hover:bg-blue-600 group-hover:shadow-lg transition-all">
                  Get Started as {role.title}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
