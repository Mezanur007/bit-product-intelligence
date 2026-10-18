import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import Shell from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'BI Technology — Business Intelligence | Product & Investment Decision Platform',
  description: 'Enterprise internal intelligence, product evaluation, financial forecasting, and investment decision support for BI Technology.',
  icons: {
    icon: '/brand/logo.webp',
    apple: '/brand/logo.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-slate-900 bg-[#F4F7FB]">
        <AppProvider>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-sm font-semibold text-slate-500 gap-3">
                <img src="/brand/logo.webp" alt="BI Technology" className="w-8 h-8 animate-spin" />
                <span>Loading BI Technology Business Intelligence...</span>
              </div>
            }
          >
            <Shell>{children}</Shell>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
