'use client';

import { LucideIcon, Check, Clock, Shield, Star } from 'lucide-react';

interface ServiceFeature {
  title: string;
  description: string;
}

interface ServiceFeaturesProps {
  serviceName: string;
  features: ServiceFeature[];
  benefits: string[];
  accentColor?: string;
  secondaryColor?: string;
}

export default function ServiceFeatures({
  serviceName,
  features,
  benefits,
  accentColor = '#FF6B35',
  secondaryColor = '#FFB347',
}: ServiceFeaturesProps) {
  const defaultBenefits = [
    'Same-day appointments available',
    'Upfront transparent pricing',
    '100% satisfaction guaranteed',
    'Licensed & insured professionals',
  ];

  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <section className="w-full py-24 bg-gradient-to-b from-[#111] to-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Service Features */}
          <div>
            <div
              className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4 border"
              style={{
                backgroundColor: `${accentColor}10`,
                color: secondaryColor,
                borderColor: `${accentColor}20`,
              }}
            >
              Our {serviceName} Services
            </div>
            <h2 className="reveal text-4xl font-extrabold mb-10">
              Expert {serviceName}<br />
              <span style={{ color: accentColor }}>Solutions</span>
            </h2>
            <div className="space-y-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="reveal flex items-start gap-4 p-5 rounded-2xl transition-all hover:bg-white/5 border"
                  style={{ borderColor: `${accentColor}10` }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <Check className="w-5 h-5" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-[#F0EDE6]">{feature.title}</h4>
                    <p className="text-sm text-[#A09B93]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Why Choose Us */}
          <div>
            <div
              className="reveal rounded-3xl p-8 border"
              style={{
                background: `linear-gradient(135deg, ${accentColor}08, ${secondaryColor}08)`,
                borderColor: `${accentColor}15`,
              }}
            >
              <h3 className="text-2xl font-bold mb-6 text-[#F0EDE6]">
                Why Choose Our {serviceName} Service?
              </h3>
              <div className="space-y-4">
                {displayBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <Check className="w-3 h-3" style={{ color: accentColor }} />
                    </div>
                    <span className="text-[#A09B93]">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t" style={{ borderColor: `${accentColor}15` }}>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: accentColor }}>
                    500+
                  </div>
                  <div className="text-xs text-[#A09B93]">Jobs Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: secondaryColor }}>
                    4.9★
                  </div>
                  <div className="text-xs text-[#A09B93]">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: accentColor }}>
                    2hr
                  </div>
                  <div className="text-xs text-[#A09B93]">Avg Response</div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="reveal grid grid-cols-2 gap-4 mt-6">
              <div
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ backgroundColor: `${accentColor}05`, borderColor: `${accentColor}10` }}
              >
                <Shield className="w-8 h-8" style={{ color: accentColor }} />
                <div>
                  <div className="font-bold text-sm text-[#F0EDE6]">Fully Insured</div>
                  <div className="text-xs text-[#A09B93]">Peace of mind</div>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ backgroundColor: `${secondaryColor}05`, borderColor: `${secondaryColor}10` }}
              >
                <Clock className="w-8 h-8" style={{ color: secondaryColor }} />
                <div>
                  <div className="font-bold text-sm text-[#F0EDE6]">24/7 Support</div>
                  <div className="text-xs text-[#A09B93]">Always here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
