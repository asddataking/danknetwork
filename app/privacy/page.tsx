import type { Metadata } from 'next';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Privacy Policy | The Dank Network',
  description: 'Privacy Policy for The Dank Network partner program.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-20 pb-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="glass-card rounded-xl p-8 space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              <p className="mb-4">
                When you apply to become a partner, we collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Business name and contact information</li>
                <li>Contact person name and email address</li>
                <li>Phone number</li>
                <li>Business type and website information</li>
                <li>Partnership tier preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review and process your partnership application</li>
                <li>Communicate with you about your application</li>
                <li>Provide partnership services if approved</li>
                <li>Send you updates about our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only with service providers who assist us in operating our business and conducting our partnership program, subject to confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@thedanknetwork.com" className="text-neon-green hover:underline">
                  privacy@thedanknetwork.com
                </a>
              </p>
            </section>

            <section>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
