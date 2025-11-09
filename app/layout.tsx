import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maple - Smart Customer Support Platform',
  description: 'Transform your customer support with intelligent email management. Automated responses, real-time insights, and team collaboration for modern businesses.',
  keywords: ['customer support', 'email automation', 'help desk', 'support platform', 'startup tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
