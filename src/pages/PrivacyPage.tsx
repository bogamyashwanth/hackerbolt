import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to home
      </Link>

      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: March 6, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Email address</li>
              <li>Username</li>
              <li>IP address</li>
              <li>Device information</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browsing activity</li>
              <li>Content interactions</li>
              <li>Time spent on site</li>
              <li>Feature usage patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the service</li>
              <li>Improve user experience</li>
              <li>Send service updates</li>
              <li>Prevent abuse and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Data Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers and partners</li>
              <li>Law enforcement when required</li>
              <li>Other users (public profile information only)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your data, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption in transit and at rest</li>
              <li>Regular security audits</li>
              <li>Access controls and monitoring</li>
              <li>Secure data backups</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Object to data processing</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Children's Privacy</h2>
            <p>Our service is not intended for children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. International Data Transfers</h2>
            <p>Your data may be processed in countries outside your residence. We ensure appropriate safeguards are in place.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
            <p>We retain your data as long as necessary to provide our services or comply with legal obligations.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to Privacy Policy</h2>
            <p>We may update this policy and will notify you of significant changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
            <p>For privacy-related inquiries:</p>
            <p className="mt-2">
              Email: privacy@modernhn.com<br />
              Data Protection Officer<br />
              ModernHN<br />
              123 Tech Street, Suite 100<br />
              San Francisco, CA 94105
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;