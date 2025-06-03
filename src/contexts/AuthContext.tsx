import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading the user from localStorage or checking a token
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const requestOTP = async (email: string) => {
    setIsLoading(true);
    try {
      // Call Supabase function to generate and send OTP
      const { data, error } = await supabase.rpc('request_otp', { user_email: email });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to request OTP', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      // Verify OTP code
      const { data, error } = await supabase.rpc('validate_otp', {
        user_email: email,
        user_code: code
      });
      if (error) throw error;

      if (!data) {
        throw new Error('Invalid or expired code');
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email
      });
      if (authError) throw authError;

      // Set user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to verify OTP', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function - would actually call API
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock successful registration
      if (username && email && password) {
        const mockUser: User = {
          id: '1',
          username,
          email,
          karma: 1,
          createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else {
        throw new Error('Invalid registration data');
      }
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        requestOTP,
        verifyOTP,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};