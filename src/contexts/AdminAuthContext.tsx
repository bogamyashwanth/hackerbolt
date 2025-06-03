import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authenticator } from 'otplib';
import * as SimpleWebAuthn from '@simplewebauthn/browser';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  isMFARequired: boolean;
  initializeAdmin: (password: string) => Promise<void>;
  loginAdmin: (password: string) => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  registerSecurityKey: (name: string) => Promise<void>;
  verifySecurityKey: () => Promise<void>;
  logoutAdmin: () => void;
}
const IP_API_URL = 'https://api.ipify.org?format=json';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isMFARequired, setIsMFARequired] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch(IP_API_URL);
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get client IP:', error);
      // Return a default IP if the API call fails
      // This ensures the application continues to work
      return '127.0.0.1';
    }
  };

  useEffect(() => {
    // Check session validity periodically
    const interval = setInterval(async () => {
      if (sessionId) {
        try {
          const { data: isValid } = await supabase.rpc('validate_admin_session', {
            p_session_id: sessionId,
            p_token: localStorage.getItem('adminSessionToken')
          });

          if (!isValid) {
            logoutAdmin();
          } else {
            // Update session expiry
            await supabase.rpc('update_session_expiry', {
              p_session_id: sessionId
            });
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          logoutAdmin();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionId]);

  const initializeAdmin = async (password: string) => {
    try {
      const { error } = await supabase.rpc('init_admin_auth_rpc', {
        p_email: 'yashwanthbogam4@gmail.com',
        p_password: password
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to initialize admin:', error);
      throw error;
    }
  };

  const loginAdmin = async (password: string) => {
    try {
      const { data: status, error: statusError } = await supabase
        .rpc('get_admin_auth_status', {
          p_email: 'yashwanthbogam4@gmail.com'
        });

      if (statusError) throw statusError;

      if (!status.initialized) {
        throw new Error('Admin not initialized');
      }

      // Verify password
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_admin_password_rpc', {
          p_email: 'yashwanthbogam4@gmail.com',
          p_password: password
        });

      if (verifyError) throw verifyError;
      if (!isValid) {
        throw new Error('Invalid password');
      }

      if (status.mfa_required) {
        setIsMFARequired(true);
        return;
      }

      if (status.password_change_required) {
        // Handle password change requirement
        navigate('/admin/change-password');
        return;
      }

      await createSession();
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  const verifyMFA = async (code: string) => {
    try {
      const { data: settings } = await supabase
        .from('admin_auth_settings')
        .select('totp_secret')
        .single();

      if (!settings?.totp_secret) {
        throw new Error('MFA not configured');
      }

      const isValid = authenticator.verify({
        token: code,
        secret: settings.totp_secret
      });

      if (!isValid) {
        throw new Error('Invalid MFA code');
      }

      await createSession();
    } catch (error) {
      console.error('MFA verification failed:', error);
      throw error;
    }
  };

  const registerSecurityKey = async (name: string) => {
    try {
      // Get challenge from server
      const { data: challenge } = await supabase.functions.invoke('get-registration-challenge');

      // Create credentials
      const credential = await SimpleWebAuthn.startRegistration(challenge);

      // Verify with server
      const { error } = await supabase.functions.invoke('verify-registration', {
        body: { credential, name }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Security key registration failed:', error);
      throw error;
    }
  };

  const verifySecurityKey = async () => {
    try {
      // Get challenge from server
      const { data: challenge } = await supabase.functions.invoke('get-authentication-challenge');

      // Get assertion
      const assertion = await SimpleWebAuthn.startAuthentication(challenge);

      // Verify with server
      const { error } = await supabase.functions.invoke('verify-authentication', {
        body: { assertion }
      });

      if (error) throw error;

      await createSession();
    } catch (error) {
      console.error('Security key verification failed:', error);
      throw error;
    }
  };

  const createSession = async () => {
    try {
      const { data: session, error } = await supabase.rpc('create_admin_session', {
        p_ip_address: await getClientIP(),
        p_user_agent: navigator.userAgent
      });

      if (error) throw error;

      setSessionId(session.id);
      localStorage.setItem('adminSessionToken', session.token);
      setIsAdminAuthenticated(true);
      setIsMFARequired(false);
    } catch (error) {
      console.error('Session creation failed:', error);
      throw error;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setIsMFARequired(false);
    setSessionId(null);
    localStorage.removeItem('adminSessionToken');
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdminAuthenticated,
      isMFARequired,
      initializeAdmin,
      loginAdmin,
      verifyMFA,
      registerSecurityKey,
      verifySecurityKey,
      logoutAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};