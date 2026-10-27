import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart';
export const metadata: Metadata = { title: 'TMS — Made for your people.', description: 'Custom merch for brands, events and communities. Lagos, Nigeria.' };
export default function Layout({children}: {children: React.ReactNode}) {return <html lang="en"><body><CartProvider>{children}</CartProvider></body></html>}
