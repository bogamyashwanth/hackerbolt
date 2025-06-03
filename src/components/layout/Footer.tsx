import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-navy-900 border-t border-gray-200 dark:border-navy-800 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; 2025 ModernHN. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
            <Link to="/cookies" className="hover:text-gray-700 dark:hover:text-gray-300">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;