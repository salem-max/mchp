'use client';

import { useState } from 'react';
import {
  Hero,
  Features,
  CloudBanner,
  ServiceCTA,
  Stats,
  TechStack,
  HowItWorks,
  Marquee,
  LiveServiceStream,
} from '@/components/landing';

// Feature Components
import {
  LoginForm,
  SignupForm,
  RoleSelector,
  MetricCard,
  RecentActivity,
  QuickActionCards,
  JobList,
  JobDetail,
  JobStatsBar,
  InventoryTable,
  AddInventoryForm,
  InventoryStatsBar,
  TechnicianCard,
  TechnicianList,
  TechnicianProfileForm,
} from '@/components/features';

// UI Components
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';

// Icons
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
  Code,
  Smartphone,
  Globe,
} from 'lucide-react';

const featureCategories = [
  {
    id: 'auth',
    title: 'Authentication & Security',
    description: 'Secure login, role-based access, and user management',
    icon: ShieldCheck,
    color: '#00d4ff',
    components: ['LoginForm', 'SignupForm', 'RoleSelector'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Analytics',
    description: 'Comprehensive dashboards with metrics and insights',
    icon: BarChart3,
    color: '#00ffa3',
    components: ['MetricCard', 'RecentActivity', 'QuickActionCards'],
  },
  {
    id: 'jobs',
    title: 'Job Management',
    description: 'Complete work order and job tracking system',
    icon: Settings,
    color: '#7b61ff',
    components: ['JobList', 'JobDetail', 'JobStatsBar'],
  },
  {
    id: 'inventory',
    title: 'Inventory & Assets',
    description: 'Asset tracking and inventory management',
    icon: Wrench,
    color: '#ff6b6b',
    components: ['InventoryTable', 'AddInventoryForm', 'InventoryStatsBar'],
  },
  {
    id: 'technicians',
    title: 'Technician Management',
    description: 'Technician profiles and workforce management',
    icon: Users,
    color: '#4ecdc4',
    components: ['TechnicianCard', 'TechnicianList', 'TechnicianProfileForm'],
  },
];

const techFeatures = [
  {
    icon: Brain,
    title: 'AI-Powered Assistance',
    desc: 'Smart suggestions and predictive maintenance',
    demo: 'AI Chat Integration',
  },
  {
    icon: Cpu,
    title: 'Digital Twins',
    desc: 'Virtual asset representations',
    demo: '3D Asset Visualization',
  },
  {
    icon: Zap,
    title: 'IoT Integration',
    desc: 'Real-time sensor data collection',
    demo: 'Live Monitoring Dashboard',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    desc: 'Automated notifications and alerts',
    demo: 'Alert Management System',
  },
  {
    icon: MapPin,
    title: 'Location Services',
    desc: 'GPS tracking and location-based features',
    demo: 'Interactive Maps',
  },
  {
    icon: Lock,
    title: 'Role-Based Security',
    desc: 'Advanced access control and permissions',
    demo: 'Security Dashboard',
  },
];

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState('auth');
  const [showDemo, setShowDemo] = useState<string | null>(null);

  const renderFeatureDemo = (featureId: string) => {
    switch (featureId) {
      case 'auth':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Login Form</CardTitle>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Signup Form</CardTitle>
              </CardHeader>
              <CardContent>
                <SignupForm />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Role Selector</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleSelector />
              </CardContent>
            </Card>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <MetricCard title="Active Jobs" value={42} />
              <MetricCard title="Completed" value={128} />
              <MetricCard title="Revenue" value="$12.5K" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickActionCards />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <JobStatsBar />
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job List</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobList />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobDetail />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <InventoryStatsBar />
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <InventoryTable />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Add Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddInventoryForm />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'technicians':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technician List</CardTitle>
              </CardHeader>
              <CardContent>
                <TechnicianList />
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technician Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <TechnicianCard />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <TechnicianProfileForm />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Select a feature category to see the demo</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Feature Categories Overview */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">
              Feature Showcase
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore all the powerful features and components that make Malaysia Co (Maintenance Services)
              the complete maintenance services platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {featureCategories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  activeFeature === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveFeature(category.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <category.icon
                        className="w-5 h-5"
                        style={{ color: category.color }}
                      />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.components.map((component) => (
                      <span
                        key={component}
                        className="px-2 py-1 bg-muted rounded text-xs"
                      >
                        {component}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Demo Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Interactive Component Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFeature} onValueChange={setActiveFeature}>
                <TabsList className="grid w-full grid-cols-5">
                  {featureCategories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.title.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {featureCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-6">
                    {renderFeatureDemo(category.id)}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Technology Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {techFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.desc}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Code className="w-4 h-4 mr-2" />
                        View Demo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{feature.demo}</DialogTitle>
                      </DialogHeader>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Demo implementation for {feature.title} would be displayed here.
                          This showcases the integration between landing components and
                          feature functionality.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Landing Components */}
      <CloudBanner />
      <HowItWorks />
      <Stats />
      <TechStack />
      <ServiceCTA />
    </div>
  );
}