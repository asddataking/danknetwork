import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thedanknetwork.com';

export const metadata: Metadata = {
  title: {
    default: 'Michigan Cannabis Marketing & Dispensary Deals | The Dank Network',
    template: '%s | The Dank Network',
  },
  description: 'Michigan\'s leading cannabis media ecosystem. Daily dispensary deals, Chrome extension visibility, video content & event marketing for weed businesses. Partner with the top cannabis marketing platform.',
  keywords: [
    'Michigan cannabis marketing',
    'Michigan dispensary deals',
    'cannabis deals Michigan',
    'dispensary marketing Michigan',
    'weed deals Michigan',
    'marijuana marketing Michigan',
    'cannabis media Michigan',
    'dispensary advertising',
    'cannabis content marketing',
    'Michigan weed business',
    'Ann Arbor Hash Bash',
    'Daily Dispo Deals',
    'cannabis partner program',
    'Dank Network',
    'DankNDevour',
    'Michigan cannabis consumers',
    'dispensary visibility',
    'cannabis brand positioning',
    'Michigan marijuana deals',
    'cannabis loyalty program',
    'weed marketing platform',
    'Blue Water area dispensaries',
    'Detroit metro cannabis',
  ],
  authors: [{ name: 'Dank Network' }],
  creator: 'Dank Network',
  publisher: 'Dank Network',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'The Dank Network',
    title: 'Michigan Cannabis Marketing & Dispensary Deals | The Dank Network',
    description: 'Michigan\'s leading cannabis media ecosystem. Daily dispensary deals, Chrome extension visibility & video marketing for weed businesses.',
    images: [
      {
        url: '/icons/DankNetwork.png.png',
        width: 1200,
        height: 630,
        alt: 'The Dank Network - Michigan cannabis marketing & dispensary deals platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Michigan Cannabis Marketing & Dispensary Deals | The Dank Network',
    description: 'Michigan\'s cannabis media ecosystem. Daily dispensary deals, video content & event marketing for weed businesses.',
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
        {/* Cannabis / Organization JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'The Dank Network',
              url: siteUrl,
              description: 'Michigan\'s leading cannabis media ecosystem. We help dispensaries and weed businesses reach cannabis consumers through daily deals, Chrome extension visibility, video content, and event marketing.',
              sameAs: [
                'https://twitter.com/DankNetwork',
                'https://www.instagram.com/thedanknetwork/',
                'https://www.youtube.com/@DankNetwork',
                'https://www.tiktok.com/@thedanknetwork',
              ].filter(Boolean),
              areaServed: {
                '@type': 'State',
                name: 'Michigan',
              },
              serviceType: [
                'Cannabis Marketing',
                'Dispensary Deals',
                'Cannabis Media',
                'Weed Business Advertising',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'The Dank Network',
              url: siteUrl,
              description: 'Michigan cannabis marketing and dispensary deals. Partner with the premier cannabis media platform for weed businesses.',
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/apply?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
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
        
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-neon-green focus:text-black focus:font-bold focus:rounded-lg">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

