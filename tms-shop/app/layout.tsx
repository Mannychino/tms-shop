import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';

import './globals.css';
import { CartProvider } from '@/components/cart';

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const headingFont = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TMS — Made for your people.',
  description:
    'Custom merch for brands, events and communities. Lagos, Nigeria.',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`} >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}