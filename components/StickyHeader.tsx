'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';

export default function StickyHeader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const formElement = document.getElementById('apply-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/apply';
    }
  };

  if (!isVisible) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-neon-green/20 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icons/DankNetwork.png.png"
              alt="Dank Network Logo"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
            <span className="text-neon-green font-black text-lg">DANK NETWORK</span>
          </Link>
          <Button variant="primary" onClick={scrollToForm}>
            Apply
          </Button>
        </div>
      </div>
    </header>
  );
}
