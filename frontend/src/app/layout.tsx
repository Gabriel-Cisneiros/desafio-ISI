import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { AppHeader, AppHeaderFallback } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/shared/toaster';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Passe',
  description: 'Mercado de jogadores de uma liga de futebol fictícia.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={geistSans.variable}>
      <body>
        <TooltipProvider>
          <SidebarProvider>
            <Suspense fallback={<Sidebar collapsible="icon" />}>
              <AppSidebar />
            </Suspense>
            <SidebarInset>
              <Suspense fallback={<AppHeaderFallback />}>
                <AppHeader />
              </Suspense>
              <div className="p-4 md:p-8">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
