import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AtSign, Lock, AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await requestOTP(email);
      setIsCodeSent(true);
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await verifyOTP(email, otpCode);
      navigate('/');
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={isCodeSent ? handleVerifyOTP : handleRequestOTP} className="space-y-4">
      {error && (
        <div className="bg-error-50 dark:bg-navy-800 text-error-500 p-3 rounded-md flex items-start">
          <AlertCircle size={18} className="flex-shrink-0 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AtSign size={18} className="text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {isCodeSent ? (
        <div>
          <label htmlFor="otpCode" className="block text-sm font-medium mb-1">
            Verification Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              id="otpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter 6-digit code"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter the verification code sent to your email
          </p>
        </div>
      ) : null}
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (isCodeSent ? 'Verifying...' : 'Sending code...') 
            : (isCodeSent ? 'Verify Code' : 'Send Verification Code')}
        </button>
      </div>
      
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 hover:underline">
            Create one
          </Link>
        </span>
      </div>
    </form>
  );
};

export default LoginForm;