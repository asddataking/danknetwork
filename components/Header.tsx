import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black border-b border-neon-green/20 pt-safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icons/DankNetwork.png.png"
              alt="Dank Network Logo"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
              priority
            />
            <span className="text-neon-green font-black text-lg md:text-xl">
              DANK NETWORK
            </span>
          </Link>
          <Link
            href="/apply"
            className="px-4 py-2 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-colors"
          >
            Apply
          </Link>
        </div>
      </div>
    </header>
  );
}
