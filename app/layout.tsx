import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
    images: [
      {
        url: '/icons/DankNetwork.png.png',
        width: 1200,
        height: 630,
        alt: 'Dank Network - Michigan\'s Home for Dank Content & Rewards',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dank Network — Michigan\'s Home for Dank Content & Rewards',
    description: 'Discover Michigan\'s hub for dank content, food reviews, cannabis culture, and the Earn & Burn rewards system. Watch, earn points, and unlock local perks.',
    creator: '@DankNetwork',
    images: ['/icons/DankNetwork.png.png'],
  },
  icons: {
    icon: '/icons/DankNetwork.png.png',
    apple: '/icons/DankNetwork.png.png',
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
  viewportFit: 'cover', // For iPhone notch support
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
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
        <link rel="icon" href="/icons/DankNetwork.png.png" />
        <link rel="apple-touch-icon" href="/icons/DankNetwork.png.png" />
        
        {/* iOS-specific meta tags for app-like experience */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dank Network" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Prevent automatic phone number detection on iOS */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} bg-black min-h-screen flex flex-col`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JD7K202D0X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JD7K202D0X');
          `}
        </Script>
        
        <PwaProvider />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-neon-green focus:text-black focus:font-bold focus:rounded-lg">
          Skip to main content
        </a>
        <Header />
        <div className="flex flex-1">
          <main id="main-content" className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">
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

