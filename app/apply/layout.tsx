import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Application - Cannabis Marketing',
  description: 'Apply to partner with The Dank Network. Reach Michigan cannabis consumers through daily dispensary deals, Chrome extension visibility, video content & event marketing. No recurring fees.',
  openGraph: {
    title: 'Partner with The Dank Network | Cannabis Marketing Michigan',
    description: 'Apply to reach Michigan cannabis consumers. Dispensary deals, video content, event marketing. One-time investment.',
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
