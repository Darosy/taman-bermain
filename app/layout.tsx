import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = { title: 'Taman Main', manifest: '/manifest.webmanifest', icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' }, appleWebApp: { capable: true, title: 'Taman Main' } };
export const viewport: Viewport = { themeColor: '#FFC93C', width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="id"><body>{children}</body></html>; }
