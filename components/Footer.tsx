import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <Image
              src="/icons/DankNetwork.png.png"
              alt="Dank Network Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="text-white font-bold text-lg">The Dank Network</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-neon-green text-sm transition-colors">
              Home
            </Link>
            <Link href="/apply" className="text-gray-400 hover:text-neon-green text-sm transition-colors">
              Apply
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-neon-green text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-neon-green text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
        <p className="text-gray-500 text-xs text-center mt-8">
          © {currentYear} The Dank Network. Some content references cannabis. 21+ only.
        </p>
      </div>
    </footer>
  );
}
