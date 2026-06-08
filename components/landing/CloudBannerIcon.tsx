'use client';

import * as React from 'react';

interface CloudBannerIconProps {
  icon: React.ReactNode;
  accentColor: string;
}

export default function CloudBannerIcon({ icon, accentColor }: CloudBannerIconProps) {
  return (
    <div
      className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}30)`,
        border: `2px solid ${accentColor}30`,
      }}
    >
      {icon}
    </div>
  );
}