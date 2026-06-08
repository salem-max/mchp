import { Cloud } from 'lucide-react';
import {
  CTA,
  CloudBanner,
  Dashboards,
  Features,
  Footer,
  Hero,
  HowItWorks,
  LiveServiceStream,
  Marquee,
  Navbar,
  ServiceCTA,
  ServiceFeatures,
  Stats,
  TechStack,
} from "@/components/landing";

const serviceFeatures = [
  {
    title: 'Instant job matching',
    description: 'Connect customers with nearby technicians who are ready to respond fast.',
  },
  {
    title: 'Transparent pricing',
    description: 'Clear estimates, secure escrow, and no surprise fees for every service call.',
  },
  {
    title: 'Verified professionals',
    description: 'Vetted technicians with ratings, reviews, and work history available at a glance.',
  },
  {
    title: 'Real-time tracking',
    description: 'Follow jobs from assignment through completion with in-app status updates.',
  },
];

const serviceBenefits = [
  'Same-day service availability',
  'Upfront pricing and payment protection',
  'Trusted, verified technicians',
  'Local coverage across multiple trades',
];

import { MagicPageWrapper } from "@/components/layouts/MagicPageWrapper";

export default function HomePage() {
  return (
    <MagicPageWrapper>
      <main className="bg-[#050608] text-white">
        <Navbar />
        <Hero />
        <Marquee />
        <Features />
        <CloudBanner
          title="Flexible Maintenance"
          subtitle="Reliable service for every home repair"
          description="Book trusted technicians, get transparent estimates, and stay updated with every job—all from one modern platform."
          icon={<Cloud className="w-12 h-12" style={{ color: "#00d4ff" }} />} // ✅ fixed: pass JSX element
          accentColor="#00d4ff"
          secondaryColor="#7b61ff"
        />
        <ServiceFeatures
          serviceName="Home Maintenance"
          features={serviceFeatures}
          benefits={serviceBenefits}
        />
        <Stats />
        <TechStack />
        <HowItWorks />
        <section id="live-service-stream" className="w-full py-24">
          <div className="max-w-7xl mx-auto px-6">
            <LiveServiceStream />
          </div>
        </section>
        <Dashboards />
        <ServiceCTA serviceName="Home Repair" />
        <CTA />
        <Footer />
      </main>
    </MagicPageWrapper>
  );
}
