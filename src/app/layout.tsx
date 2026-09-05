import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Medsync — Healthcare Command Center', description: 'Simulated healthcare operations intelligence for BRICS resilience.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
