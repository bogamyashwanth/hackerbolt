import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiesPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to home
      </Link>

      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: March 6, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us provide and improve our services.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Types of Cookies We Use</h2>
            
            <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
            <p className="mb-4">Required for basic site functionality:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Authentication status</li>
              <li>Security features</li>
              <li>Session management</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Functional Cookies</h3>
            <p className="mb-4">Enhance your experience:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Theme preferences</li>
              <li>Language settings</li>
              <li>User preferences</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Analytics Cookies</h3>
            <p className="mb-4">Help us understand site usage:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Page views</li>
              <li>Navigation patterns</li>
              <li>Feature usage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Cookie Duration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Session cookies: Deleted when you close your browser</li>
              <li>Persistent cookies: Remain until expiration or deletion</li>
              <li>Authentication cookies: 30 days maximum</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">Some features use third-party services that may set cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analytics providers</li>
              <li>Security services</li>
              <li>Content delivery networks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Managing Cookies</h2>
            <p className="mb-4">You can control cookies through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser settings</li>
              <li>Our cookie preferences center</li>
              <li>Third-party opt-out tools</li>
            </ul>
            <p className="mt-4 text-warning-500">Note: Blocking essential cookies may affect site functionality</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Cookie Consent</h2>
            <p>We obtain your consent before setting non-essential cookies. You can change your preferences at any time.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Updates to Cookie Policy</h2>
            <p>We may update this policy to reflect changes in our practices or for legal compliance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
            <p>For questions about our cookie practices:</p>
            <p className="mt-2">
              Email: privacy@modernhn.com<br />
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

export default CookiesPage;