import { ShieldCheck, Brain, MessageCircle, Star, Wifi, BatteryFull, Wrench, TrendingUp, Zap, Cpu, BarChart3, Bell, MapPin, Users, Settings, Lock } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Secure Escrow Payments', desc: 'Money released only after job completion via Stripe Connect.', color: '#00d4ff' },
  { icon: Brain, title: 'AI-Powered Assistance', desc: 'Smart suggestions, predictive maintenance, and automated insights powered by OpenAI.', color: '#00ffa3' },
  { icon: MessageCircle, title: 'In-App Chat & Messaging', desc: 'Real-time communication between customers and technicians.', color: '#7b61ff' },
  { icon: Star, title: 'Two-Way Ratings & Reviews', desc: 'Build trust with comprehensive rating system for all parties.', color: '#00d4ff' },
  { icon: TrendingUp, title: 'Predictive Maintenance', desc: 'AI-driven predictions to prevent equipment failures before they occur.', color: '#ff6b6b' },
  { icon: Cpu, title: 'Digital Twins', desc: 'Virtual representations of physical assets for monitoring and simulation.', color: '#4ecdc4' },
  { icon: Zap, title: 'IoT Integration', desc: 'Connect sensors and devices for real-time data collection and analysis.', color: '#ffd93d' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Comprehensive dashboards with insights, reports, and performance metrics.', color: '#a8e6cf' },
  { icon: Bell, title: 'Smart Alerts & Notifications', desc: 'Automated alerts for maintenance schedules, issues, and updates.', color: '#ffb3ba' },
  { icon: MapPin, title: 'Location-Based Services', desc: 'Find nearby technicians and track job locations with integrated maps.', color: '#bae1ff' },
  { icon: Users, title: 'Multi-Role Dashboards', desc: 'Tailored interfaces for customers, technicians, and administrators.', color: '#d4a574' },
  { icon: Settings, title: 'Work Order Management', desc: 'Streamlined creation, tracking, and completion of maintenance tasks.', color: '#f7dc6f' },
  { icon: Wrench, title: 'Asset & Inventory Tracking', desc: 'Manage equipment, parts, and inventory with detailed records.', color: '#bb8fce' },
  { icon: Lock, title: 'Role-Based Access Control', desc: 'Secure authentication with customizable permissions and sandbox mode.', color: '#85c1e9' },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: feature list */}
          <div>
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4 glass border-[#00d4ff]/15 text-[#00d4ff]">
              Complete Solution
            </div>
            <h2 className="reveal text-4xl font-extrabold mb-10">
              Comprehensive Features<br /><span className="gradient-text">For Modern Maintenance</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`reveal glass-card flex items-start gap-4 p-5 rounded-2xl`}
                >
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${f.color}15` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-sm">{f.title}</h4>
                    <p className="text-sm text-white/40">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="reveal flex justify-center">
            <div className="phone-mockup rounded-[40px] p-3 glass-strong w-[300px]">
              <div className="rounded-[32px] overflow-hidden" style={{ background: '#0B0B0F' }}>
                <div className="flex items-center justify-between px-6 py-3 glass">
                  <span className="text-xs font-medium text-white/60">9:41</span>
                  <div className="flex gap-1 text-white/40">
                    <Wifi className="w-3 h-3" />
                    <BatteryFull className="w-3 h-3" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00d4ff] to-[#00ffa3]">
                      <Wrench className="w-4 h-4 text-[#0B0B0F]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Malaysia Co (Maintenance Services)</div>
                      <div className="text-xs text-white/40">Customer Dashboard</div>
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-4 mb-4">
                    <div className="text-xs mb-2 text-white/40">Active Work Order</div>
                    <div className="font-bold text-sm mb-2">HVAC System Maintenance</div>
                    <div className="w-full rounded-full h-1.5 bg-white/10 mb-2">
                      <div className="rounded-full h-1.5 bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] w-[85%]" />
                    </div>
                    <div className="text-xs text-[#00ffa3]">85% Complete</div>
                  </div>
                  <div className="glass-card rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">Upcoming Maintenance</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">3 days</span>
                    </div>
                    <div className="stat-number text-2xl font-bold text-[#00d4ff]">Elevator Inspection</div>
                    <div className="text-xs text-white/40">Scheduled for next week</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 glass-card rounded-xl p-3 text-center">
                      <div className="stat-number text-lg font-bold text-[#00ffa3]">12</div>
                      <div className="text-xs text-white/40">Active Orders</div>
                    </div>
                    <div className="flex-1 glass-card rounded-xl p-3 text-center">
                      <div className="stat-number text-lg font-bold text-[#00d4ff]">4.8★</div>
                      <div className="text-xs text-white/40">Avg Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
