import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to home
      </Link>

      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: March 6, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>By accessing or using ModernHN, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be invited by an existing user to create an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You may not use another person's account</li>
              <li>You must notify us of any security breach or unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post illegal, harmful, or objectionable content</li>
              <li>Impersonate others or provide false information</li>
              <li>Spam or engage in automated usage</li>
              <li>Attempt to bypass security measures</li>
              <li>Interfere with other users' enjoyment of the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Content Rights</h2>
            <p>Users retain rights to their content but grant ModernHN a license to use, modify, and display it. We may remove content that violates these terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Account Termination</h2>
            <p>We may suspend or terminate accounts that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate these terms</li>
              <li>Engage in fraudulent activity</li>
              <li>Create risk or possible legal exposure</li>
              <li>Have extended periods of inactivity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>ModernHN is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
            <p>We may modify these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Governing Law</h2>
            <p>These terms are governed by the laws of the jurisdiction in which ModernHN operates, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Contact Information</h2>
            <p>For questions about these terms, please contact us at:</p>
            <p className="mt-2">
              Email: legal@modernhn.com<br />
              Address: 123 Tech Street, Suite 100<br />
              San Francisco, CA 94105
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;