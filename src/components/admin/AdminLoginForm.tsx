import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Lock, AlertCircle, Key, ShieldAlert } from 'lucide-react';

const AdminLoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isInitMode, setIsInitMode] = useState(false);
  const { loginAdmin, verifyMFA, verifySecurityKey, isMFARequired, initializeAdmin } = useAdminAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isMFARequired) {
        await verifyMFA(mfaCode);
      } else {
        if (isInitMode) {
          if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
          }
          await initializeAdmin(password);
          setError('Admin initialized successfully. Please log in.');
          setIsInitMode(false);
          setPassword('');
          return;
        } else {
          await loginAdmin(password);
        }
      }
      navigate('/admin');
    } catch (error: any) {
      const errorMsg = error?.message || 'An error occurred';
      if (errorMsg === 'Admin not initialized') {
        setIsInitMode(true);
        setError('No admin account found. Please set up the initial admin password.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecurityKey = async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      await verifySecurityKey();
      navigate('/admin');
    } catch (error) {
      setError('Security key verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error-50 dark:bg-navy-800 text-error-500 p-3 rounded-md flex items-start">
          <AlertCircle size={18} className="flex-shrink-0 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {isInitMode && (
        <div className="bg-warning-50 dark:bg-navy-800 text-warning-600 p-3 rounded-md flex items-start mb-4">
          <ShieldAlert size={18} className="flex-shrink-0 mr-2 mt-0.5" />
          <span>
            No admin account found. Please set up the initial admin password.
          </span>
        </div>
      )}
      
      {isMFARequired ? (
        <div>
          <label htmlFor="mfaCode" className="block text-sm font-medium mb-1">
            Verification Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key size={18} className="text-gray-400" />
            </div>
            <input
              id="mfaCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100"
              placeholder="Enter 6-digit code"
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Admin Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100"
              placeholder="Enter admin password"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (isMFARequired ? 'Verifying...' : 'Signing in...') 
            : (isMFARequired 
                ? 'Verify Code' 
                : (isInitMode ? 'Initialize Admin' : 'Sign in'))}
        </button>

        <button
          type="button"
          onClick={handleSecurityKey}
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-navy-900 hover:bg-gray-50 dark:hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Use Security Key
        </button>
      </div>
    </form>
  );
};

export default AdminLoginForm;