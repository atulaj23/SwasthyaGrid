import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });

export const metadata: Metadata = { title: 'Medsync — Healthcare Command Center', description: 'Simulated healthcare operations intelligence for BRICS resilience.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" className={inter.variable}><body>{children}</body></html>; }
