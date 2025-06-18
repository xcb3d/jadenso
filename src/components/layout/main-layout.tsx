import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 relative overflow-hidden">
      {/* Animated Water Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="water-wave absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-100/20 via-blue-100/20 to-teal-100/20"></div>
          <div className="water-wave-2 absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100/15 via-cyan-100/15 to-sky-100/15"></div>
        </div>
        {/* Enhanced Floating Particles */}
        <div className="particle-system">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
      </div>

      <Header />
      <main className="flex-1 px-4 py-6 relative">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 