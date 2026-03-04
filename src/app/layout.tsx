import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Chiranjeev Agarwal — CHIRU-OS Portfolio',
  description: 'The retro terminal OS portfolio of Chiranjeev Agarwal — Full Stack Developer. Boot up and explore.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased overflow-hidden')}>
        <div className="fixed inset-0 h-full w-full scanlines vignette flicker">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
