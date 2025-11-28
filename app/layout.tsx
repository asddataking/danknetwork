import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import PwaProvider from '@/components/PwaProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Dank Network — Michigan\'s Home for Dank Content & Rewards',
    template: '%s | Dank Network',
  },
  description: 'Discover Michigan\'s hub for dank content, food reviews, cannabis culture, and the Earn & Burn rewards system. Watch, earn points, and unlock local perks.',
  keywords: [
    'Michigan food reviews',
    'Michigan dispensary deals',
    'cannabis deals Michigan',
    'St. Clair food review',
    'Michigan restaurants',
    'Dank Network',
    'DankNDevour',
    'Dank Pass',
    'Earn and Burn rewards',
    'Daily Dispo Deals',
    'Michigan content creator',
    'Michigan media network',
    'Michigan influencers',
    'dank content Michigan',
    'Michigan weed deals',
    'Michigan loyalty program',
    'Michigan foodie',
    'Blue Water area',
    'Detroit metro restaurants',
  ],
  authors: [{ name: 'Dank Network' }],
  creator: 'Dank Network',
  publisher: 'Dank Network',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thedanknetwork.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Dank Network',
    title: 'Dank Network — Michigan\'s Home for Dank Content & Rewards',
    description: 'Dank Network is Michigan\'s home for dank content and next-level rewards. We bring together food reviews, cannabis culture, local adventures, daily deals, and creator-driven entertainment—all inside one connected universe. Powered by our Earn & Burn™ Rewards, fans can watch content, complete challenges, upload receipts, and unlock perks from restaurants, dispensaries, and local businesses statewide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dank Network — Michigan\'s Home for Dank Content & Rewards',
    description: 'Discover Michigan\'s hub for dank content, food reviews, cannabis culture, and the Earn & Burn rewards system. Watch, earn points, and unlock local perks.',
    creator: '@DankNetwork',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#00ff00',
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
          <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">
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

