import React from 'react';
import { Link } from 'react-router-dom';
import AdminLoginForm from '../components/admin/AdminLoginForm';

const AdminLoginPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <Link to="/" className="inline-block">
          <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FF6600" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold mt-4">Admin Login</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Secure access for administrators
        </p>
      </div>
      
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6">
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;