import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import PwaProvider from '@/components/PwaProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dank Network',
  description: 'Dank Network is a local Michigan media brand for food, weed, and sports – featuring Dank\'N\'Devour, Dank Recipes, Dank Sports, and DankPass rewards.',
  manifest: '/manifest.json',
  themeColor: '#00ff00',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00ff00" />
      </head>
      <body className={`${inter.className} bg-black min-h-screen flex flex-col`}>
        <PwaProvider />
        <Header />
        <div className="flex flex-1">
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
          <Sidebar />
        </div>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}

