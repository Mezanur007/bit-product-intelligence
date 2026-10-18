import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import Shell from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'B-IT Intelligence — Product & Investment Decision Platform',
  description: 'Enterprise internal intelligence, product evaluation, financial forecasting, and investment decision support for B-IT Technology.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AppProvider>
          <Suspense fallback={<div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center text-xs text-gray-400">Loading B-IT Intelligence...</div>}>
            <Shell>{children}</Shell>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
