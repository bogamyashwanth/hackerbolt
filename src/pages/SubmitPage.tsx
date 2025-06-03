import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SubmitStoryForm from '../components/forms/SubmitStoryForm';

const SubmitPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/submit');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to stories
      </Link>
      
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Submit a Story</h1>
        <SubmitStoryForm />
      </div>
    </div>
  );
};

export default SubmitPage;