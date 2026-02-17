import type { Metadata } from 'next';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Terms of Service | The Dank Network',
  description: 'Terms of Service for The Dank Network partner program.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-20 pb-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="glass-card rounded-xl p-8 space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
              <p>
                By applying to become a partner with The Dank Network, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not submit an application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Partnership Application</h2>
              <p className="mb-4">
                Partnership applications are subject to review and approval by The Dank Network. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accept or reject any application at our sole discretion</li>
                <li>Request additional information during the review process</li>
                <li>Modify partnership terms based on business needs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Terms</h2>
              <p className="mb-4">
                Partnership fees are one-time payments with no recurring charges:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All fees are due upon partnership approval</li>
                <li>Payments are non-refundable once services have commenced</li>
                <li>No contracts or long-term commitments required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Partner Responsibilities</h2>
              <p className="mb-4">
                Partners agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate business information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Maintain appropriate business licenses and permits</li>
                <li>Use our services in a professional and ethical manner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
              <p>
                All content, trademarks, and intellectual property of The Dank Network remain the exclusive property of The Dank Network. Partners may not use our branding or content without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
              <p>
                The Dank Network is not liable for any indirect, incidental, or consequential damages arising from the partnership. Our total liability is limited to the amount paid for partnership services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
              <p>
                Either party may terminate the partnership at any time with written notice. Upon termination, all services will cease, and no refunds will be provided for services already rendered.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p>
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@thedanknetwork.com" className="text-neon-green hover:underline">
                  legal@thedanknetwork.com
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
