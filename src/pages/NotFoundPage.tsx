import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <svg className="w-16 h-16 mx-auto text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      
      <h1 className="text-4xl font-bold mt-6">404</h1>
      <p className="text-xl mt-2">Page not found</p>
      <p className="text-gray-500 dark:text-gray-400 mt-4">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/" className="mt-8 inline-flex items-center text-primary-500 hover:underline">
        <ArrowLeft size={16} className="mr-1" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;