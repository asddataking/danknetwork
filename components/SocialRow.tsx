import { Youtube, Instagram, Facebook, Twitter } from 'lucide-react';

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'YouTube',
    icon: <Youtube className="w-6 h-6" />,
    href: '#',
  },
  {
    name: 'Instagram',
    icon: <Instagram className="w-6 h-6" />,
    href: '#',
  },
  {
    name: 'TikTok',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    href: '#',
  },
  {
    name: 'X (Twitter)',
    icon: <Twitter className="w-6 h-6" />,
    href: '#',
  },
  {
    name: 'Facebook',
    icon: <Facebook className="w-6 h-6" />,
    href: '#',
  },
];

export default function SocialRow() {
  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-neon-green transition-colors duration-200"
          aria-label={link.name}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
