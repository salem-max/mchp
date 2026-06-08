import React from "react";

export function MagicPageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <main className="relative z-10">{children}</main>
    </div>
  );
}

