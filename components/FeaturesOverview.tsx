'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Brain,
  MessageCircle,
  Star,
  TrendingUp,
  Cpu,
  Zap,
  BarChart3,
  Bell,
  MapPin,
  Users,
  Settings,
  Wrench,
  Lock,
  Eye,
  ArrowRight,
  Play,
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
} from '@/components/ui';

// Feature Components for Demo
import {
  LoginForm,
  MetricCard,
  JobStatsBar,
  InventoryStatsBar,
  TechnicianCard,
} from '@/components/features';

const coreFeatures = [
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    desc: 'Role-based access control with secure login and user management',
    demo: 'auth',
    color: '#00d4ff',
    category: 'Security',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Comprehensive metrics and insights for performance tracking',
    demo: 'dashboard',
    color: '#00ffa3',
    category: 'Analytics',
  },
  {
    icon: Settings,
    title: 'Work Order Management',
    desc: 'Complete job tracking and management system',
    demo: 'jobs',
    color: '#7b61ff',
    category: 'Operations',
  },
  {
    icon: Wrench,
    title: 'Asset & Inventory',
    desc: 'Equipment tracking and inventory management',
    demo: 'inventory',
    color: '#ff6b6b',
    category: 'Assets',
  },
  {
    icon: Users,
    title: 'Technician Network',
    desc: 'Professional workforce management and profiles',
    demo: 'technicians',
    color: '#4ecdc4',
    category: 'Workforce',
  },
  {
    icon: Brain,
    title: 'AI Assistance',
    desc: 'Smart suggestions and predictive maintenance',
    demo: 'ai',
    color: '#ffd93d',
    category: 'AI',
  },
];

const advancedFeatures = [
  {
    icon: Cpu,
    title: 'Digital Twins',
    desc: 'Virtual asset representations for monitoring',
    demo: 'digital-twins',
  },
  {
    icon: Zap,
    title: 'IoT Integration',
    desc: 'Real-time sensor data and connectivity',
    demo: 'iot',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    desc: 'Automated notifications and maintenance alerts',
    demo: 'alerts',
  },
  {
    icon: MapPin,
    title: 'Location Services',
    desc: 'GPS tracking and location-based features',
    demo: 'location',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'In-app messaging between customers and technicians',
    demo: 'chat',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    desc: 'Advanced security with sandbox environments',
    demo: 'security',
  },
];

export default function FeaturesOverview() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const renderDemo = (demoType: string) => {
    switch (demoType) {
      case 'auth':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Secure authentication system with role-based access control
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Login Form</h4>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <LoginForm />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Features</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-role authentication</li>
                  <li>• Secure password handling</li>
                  <li>• Session management</li>
                  <li>• Forgot password recovery</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Real-time analytics and performance metrics
            </p>
            <div className="grid grid-cols-3 gap-4">
              <MetricCard title="Active Jobs" value={42} />
              <MetricCard title="Completed" value={128} />
              <MetricCard title="Revenue" value="$12.5K" />
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete work order management system
            </p>
            <JobStatsBar />
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Asset tracking and inventory management
            </p>
            <InventoryStatsBar />
          </div>
        );

      case 'technicians':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Professional technician network management
            </p>
            <TechnicianCard />
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Interactive demo for {demoType} feature
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This would showcase the full functionality of the {demoType} system
            </p>
          </div>
        );
    }
  };

  return (
    <section id="features" className="w-full py-24 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-4xl font-extrabold mb-4">
            Everything You Need for
            <span className="gradient-text block">Modern Maintenance</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From secure authentication to AI-powered insights, discover all the features
            that make Malaysia Co (Maintenance Services) the complete maintenance services solution.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {coreFeatures.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon
                      className="w-6 h-6"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.desc}</p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDemo(feature.demo)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Demo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                          {feature.title} Demo
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {renderDemo(feature.demo)}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/features#${feature.demo}`}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Advanced Capabilities</h3>
            <p className="text-muted-foreground">
              Cutting-edge features powered by modern technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advancedFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 glass border-primary/20 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Ready to get started?</span>
          </div>
          <h3 className="text-3xl font-bold mb-4">
            Experience All Features
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our comprehensive feature showcase to see how Malaysia Co (Maintenance Services)
            can transform your maintenance operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/features">
                View Full Showcase
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}