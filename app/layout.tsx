import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Toaster } from "sonner";

import ClientNavbar from "@/components/layout/ClientNavbar";
import MobileNav from "@/components/navigation/mobileNav";

import { TRPCProvider } from "@/providers/TRPCProvider";

export const metadata: Metadata = {
  title: "Malaysia Co (Maintenance Services) - On-Demand Service Marketplace",
  description:
    "Connect customers with technicians for home repairs and services.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark"
    >
      <body
        className="
          min-h-screen
          overflow-x-hidden
          bg-background
          text-foreground
          font-sans
          antialiased
        "
      >
        <TRPCProvider>
          <ClientNavbar />

          <MobileNav />

          <main id="main-content" className="min-h-screen">
            {children}
          </main>

          <Toaster
            richColors
            position="top-right"
          />
        </TRPCProvider>
      </body>
    </html>
  );
}