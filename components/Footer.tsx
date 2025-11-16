import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-dark-surface via-dark-bg to-dark-surface border-t border-accent-turquoise/30 mt-auto overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(15,185,201,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-turquoise flex items-center justify-center shadow-lg shadow-accent-turquoise/30">
                <span className="text-dark-bg font-black text-sm">DN</span>
              </div>
              <span className="text-white font-black text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dank Network
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Local Michigan food, weed, and sports content.
            </p>
          </div>

          {/* Network */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">Network</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-accent-turquoise text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/danknddevour" className="text-gray-400 hover:text-accent-turquoise text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block">
                  Dank&apos;N&apos;Devour
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="text-gray-400 hover:text-accent-sky text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block">
                  Dank Recipes
                </Link>
              </li>
              <li>
                <Link href="/sports" className="text-gray-400 hover:text-purple-400 text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block">
                  Dank Sports
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-gray-400 hover:text-accent-turquoise text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block">
                  Saved
                </Link>
              </li>
            </ul>
            <div className="mt-5 space-y-2">
              <a
                href="https://danknddevour.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-turquoise text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block"
              >
                danknddevour.com →
              </a>
              <a
                href="https://www.dankpass.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block"
              >
                dankpass.com →
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">Social</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-black flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg">Legal</h3>
            <p className="text-gray-400 text-xs mb-3 leading-relaxed">
              © {currentYear} Dank Network. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Some content references cannabis. 21+ only. Consume responsibly and follow local laws.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

